import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippIcons } from '../../../../../utils/icon-registry'
import { TabbedLayout } from '../../../../../layouts/TabbedLayout'
import { Alert, Button, Stack, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Grid } from '@mui/system'
import { CippTablePage } from '../../../../../components/CippComponents/CippTablePage.jsx'
import { CippOffCanvas } from '../../../../../components/CippComponents/CippOffCanvas'
import CippFormComponent from '../../../../../components/CippComponents/CippFormComponent'
import { CippApiResults } from '../../../../../components/CippComponents/CippApiResults'
import { ApiPostCall } from '../../../../../api/ApiCall'
import { useSettings } from '../../../../../hooks/use-settings'
import tabOptions from '../tabOptions.json'

const queryKey = 'HistoricalSearches'

// Start-HistoricalSearch report types
const reportTypeOptions = [
  { label: 'Message trace', value: 'MessageTrace' },
  { label: 'Message trace detail', value: 'MessageTraceDetail' },
  { label: 'Defender for Office 365 (ATP)', value: 'ATPReport' },
  { label: 'Spam', value: 'SPAM' },
  { label: 'Spoof', value: 'Spoof' },
  { label: 'DLP', value: 'DLP' },
  { label: 'Unified DLP', value: 'UnifiedDLP' },
  { label: 'Transport rule', value: 'TransportRule' },
  { label: 'Connector', value: 'ConnectorReport' },
  { label: 'Outbound security', value: 'OutboundSecurityReport' },
  { label: 'P2 sender attribution', value: 'P2SenderAttribution' },
]

const Page = () => {
  const tenantFilter = useSettings().currentTenant
  const [drawerVisible, setDrawerVisible] = useState(false)
  const formControl = useForm({
    defaultValues: {
      reportType: { label: 'Message trace', value: 'MessageTrace' },
      direction: 'All',
      startDate: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
      endDate: Math.floor(Date.now() / 1000),
    },
    mode: 'onChange',
  })

  const startSearch = ApiPostCall({
    relatedQueryKeys: [queryKey],
  })

  const onSubmit = () => {
    const formData = formControl.getValues()
    startSearch.mutate({
      url: '/api/ExecHistoricalSearch',
      data: {
        tenantFilter: tenantFilter,
        Action: 'Start',
        reportTitle: formData.reportTitle,
        reportType: formData.reportType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        senderAddress: formData.senderAddress,
        recipientAddress: formData.recipientAddress,
        messageId: formData.messageId,
        direction: formData.direction,
        deliveryStatus: formData.deliveryStatus,
        originalClientIP: formData.originalClientIP,
        notifyAddress: formData.notifyAddress,
      },
    })
  }

  const actions = [
    {
      // The download opens Microsoft's legacy report endpoint, which requires a customer-native
      // admin login and is not GDAP-aware; delegated partners should use a customer NotifyAddress.
      label: 'Download CSV',
      link: '[FileUrl]',
      external: true,
      noConfirm: true,
      icon: <CippIcons.Download />,
      condition: (row) => !!row.FileUrl && row.Status === 'Done',
    },
    {
      label: 'Cancel Search',
      type: 'POST',
      url: '/api/ExecHistoricalSearch',
      data: { Action: '!Stop', jobId: 'JobId' },
      confirmText:
        'Cancel this historical search? Cancelled searches still count toward the 250 searches per day quota.',
      icon: <CippIcons.Block />,
      color: 'danger',
      condition: (row) => row.Status === 'NotStarted',
      relatedQueryKeys: [queryKey],
    },
  ]

  return (
    <>
      <CippTablePage
        title="Historical Searches"
        tenantInTitle={false}
        apiUrl="/api/ListHistoricalSearches"
        apiData={{ tenantFilter: tenantFilter }}
        queryKey={queryKey}
        simpleColumns={[
          'ReportTitle',
          'ReportType',
          'Status',
          'JobProgress',
          'Rows',
          'SubmitDate',
          'StartDate',
          'EndDate',
        ]}
        cardButton={
          <Button
            variant="contained"
            startIcon={<CippIcons.Add />}
            onClick={() => setDrawerVisible(true)}
          >
            New Historical Search
          </Button>
        }
        actions={actions}
        offCanvas={{
          extendedInfoFields: [
            'ReportTitle',
            'ReportType',
            'Status',
            'JobProgress',
            'Rows',
            'FileRows',
            'SubmitDate',
            'CompletionDate',
            'StartDate',
            'EndDate',
            'SenderAddress',
            'RecipientAddress',
            'ErrorDescription',
            'JobId',
          ],
        }}
        tableFilter={
          <Stack spacing={1.5}>
            <Alert severity="info">
              Historical searches run asynchronously in Exchange Online and
              cover up to 90 days of data, delivered as CSV (up to 100,000
              rows). Each tenant can run 250 searches per day; this list shows
              searches submitted in the last 10 days.
            </Alert>
            <Alert severity="warning">
              <strong>
                Downloading the CSV requires a customer-tenant admin login.
              </strong>{' '}
              Microsoft&apos;s report download endpoint is not GDAP-aware, so
              the delegated partner session cannot retrieve the file. To get the
              report, sign in to the customer tenant as an admin with the
              Message Tracking role (Global Administrator or Exchange
              Administrator) and use Download CSV there, or set a Notify Address
              in the customer tenant to have the CSV emailed on completion.
            </Alert>
          </Stack>
        }
      />
      <CippOffCanvas
        title="New Historical Search"
        size="lg"
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        footer={
          <Stack direction="row" spacing={1} sx={{ p: 2 }}>
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={startSearch.isPending}
            >
              Start Search
            </Button>
            <Button variant="outlined" onClick={() => setDrawerVisible(false)}>
              Close
            </Button>
          </Stack>
        }
      >
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <CippFormComponent
              type="textField"
              name="reportTitle"
              label="Report Title"
              formControl={formControl}
              required
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="autoComplete"
              name="reportType"
              label="Report Type"
              options={reportTypeOptions}
              multiple={false}
              creatable={false}
              formControl={formControl}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="datePicker"
              name="startDate"
              label="Start Date"
              dateTimeType="date"
              formControl={formControl}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="datePicker"
              name="endDate"
              label="End Date"
              dateTimeType="date"
              formControl={formControl}
              required
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="autoComplete"
              freeSolo
              multiple={true}
              creatable={true}
              name="senderAddress"
              label="Sender Addresses"
              helperText="Pick a mailbox, or type any address; wildcards like *@domain.com are supported (up to 100)"
              api={{
                url: '/api/ListMailboxes',
                labelField: (option) => option.UPN,
                valueField: 'UPN',
                queryKey: `ListMailboxes-${tenantFilter}`,
                manualSearch: true,
                searchParam: 'Anr',
                data: { Minimal: true },
              }}
              formControl={formControl}
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="autoComplete"
              freeSolo
              multiple={true}
              creatable={true}
              name="recipientAddress"
              label="Recipient Addresses"
              helperText="Pick a mailbox, or type any address; wildcards like *@domain.com are supported (up to 100)"
              api={{
                url: '/api/ListMailboxes',
                labelField: (option) => option.UPN,
                valueField: 'UPN',
                queryKey: `ListMailboxes-${tenantFilter}`,
                manualSearch: true,
                searchParam: 'Anr',
                data: { Minimal: true },
              }}
              formControl={formControl}
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="textField"
              name="messageId"
              label="Message ID"
              helperText="At least one sender, recipient or message ID filter is required"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="radio"
              row
              name="direction"
              label="Direction"
              options={[
                { label: 'All', value: 'All' },
                { label: 'Received', value: 'Received' },
                { label: 'Sent', value: 'Sent' },
              ]}
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="autoComplete"
              name="deliveryStatus"
              label="Delivery Status"
              options={[
                { label: 'Delivered', value: 'Delivered' },
                { label: 'Expanded', value: 'Expanded' },
                { label: 'Failed', value: 'Failed' },
              ]}
              multiple={false}
              creatable={false}
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="textField"
              name="originalClientIP"
              label="Original Client IP"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="autoComplete"
              freeSolo
              multiple={true}
              creatable={true}
              name="notifyAddress"
              label="Notify Address"
              helperText="Internal mailbox to email when the search completes; pick a mailbox or type an address"
              api={{
                url: '/api/ListMailboxes',
                labelField: (option) => option.UPN,
                valueField: 'UPN',
                queryKey: `ListMailboxes-${tenantFilter}`,
                manualSearch: true,
                searchParam: 'Anr',
                data: { Minimal: true },
              }}
              formControl={formControl}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              Large searches can take several hours. Results stay available from
              this page for 10 days.
            </Typography>
          </Grid>
          <Grid size={12}>
            <CippApiResults apiObject={startSearch} />
          </Grid>
        </Grid>
      </CippOffCanvas>
    </>
  );
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)
export default Page
