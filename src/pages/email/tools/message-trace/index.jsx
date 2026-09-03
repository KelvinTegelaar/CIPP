import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { Alert, Button, Stack, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { ApiPostCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'
import CippButtonCard from '../../../../components/CippCards/CippButtonCard'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable'
import { CippOffCanvas } from '../../../../components/CippComponents/CippOffCanvas'
import { useState } from 'react'
import { Grid } from '@mui/system'
import tabOptions from './tabOptions.json'
import { getCippError } from '../../../../utils/get-cipp-error'

const simpleColumns = [
  'Received',
  'Status',
  'SenderAddress',
  'RecipientAddress',
  'Subject',
  'Size',
]
const detailColumns = ['Date', 'Event', 'Action', 'Detail']
const apiUrl = '/api/ListMessageTrace'
const pageTitle = 'Message Trace'

// Get-MessageTraceV2 status values ("None" existed on V1 only)
const statusOptions = [
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Expanded', value: 'Expanded' },
  { label: 'Failed', value: 'Failed' },
  { label: 'Filtered As Spam', value: 'FilteredAsSpam' },
  { label: 'Getting Status', value: 'GettingStatus' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Quarantined', value: 'Quarantined' },
]

// Backend errors carry Metadata.Error; fall back to a Results string, then the generic axios message.
const getMessageTraceError = (error) => {
  const body = error?.response?.data
  return body?.Metadata?.Error || (typeof body?.Results === 'string' ? body.Results : null) || getCippError(error)
}

const subjectHelp = {
  Contains:
    'Matches anywhere in the subject, e.g. "Invoice" finds "Your Invoice 4482"',
  StartsWith:
    'Matches the start of the subject, e.g. "Invoice" finds "Invoice 4482 overdue"',
  EndsWith:
    'Matches the end of the subject, e.g. "overdue" finds "Invoice 4482 is overdue"',
}

const Page = () => {
  const tenantFilter = useSettings().currentTenant
  const [searchResults, setSearchResults] = useState([])
  const [metadata, setMetadata] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [traceDetails, setTraceDetails] = useState([])
  const [filterExpanded, setFilterExpanded] = useState(true)
  const formControl = useForm({
    defaultValues: {
      dateFilter: '2',
      endDate: Math.floor(Date.now() / 1000),
      startDate: Math.floor(new Date().getTime() / 1000) - 2 * 24 * 60 * 60,
      subjectFilterType: 'Contains',
      advancedFilters: false,
    },
    mode: 'onChange',
  })

  const messageTrace = ApiPostCall({
    urlFromData: true,
    queryKey: 'MessageTrace',
    onResult: (result) => {
      setMetadata(result?.Metadata ?? null)
      setSearchResults(result?.Results ?? [])
    },
  })

  const messageTraceDetail = ApiPostCall({
    urlFromData: true,
    queryKey: `MessageTraceDetail-${selectedRow?.MessageTraceId}-${selectedRow?.RecipientAddress}`,
    onResult: (result) => {
      setTraceDetails(result?.Results ?? [])
    },
  })

  const startMessageTraceDetail = (row) => {
    setSelectedRow(row)
    messageTraceDetail.mutate({
      url: apiUrl,
      data: {
        tenantFilter: tenantFilter,
        id: row.MessageTraceId,
        recipient: row.RecipientAddress,
        traceDetail: true,
      },
    })
  }

  const actions = [
    {
      label: 'View Details',
      noConfirm: true,
      customFunction: (row) => {
        startMessageTraceDetail(row)
        setDetailVisible(true)
      },
      icon: <CippIcons.DocumentTextIcon />,
    },
    {
      label: 'View in Explorer',
      noConfirm: true,
      link: `https://security.microsoft.com/realtimereportsv3?tid=${tenantFilter}&dltarget=Explorer&dlstorage=Url&viewid=allemail&query-NetworkMessageId=[MessageTraceId]`,
      icon: <CippIcons.DocumentTextIcon />,
    },
  ]

  const buildSearchData = () => {
    const formData = formControl.getValues()
    const data = {
      tenantFilter: tenantFilter,
      fromIP: formData.fromIP,
      toIP: formData.toIP,
      recipient: formData.recipient,
      sender: formData.sender,
      status: formData.status,
      subject: formData.subject,
      subjectFilterType: formData.subjectFilterType,
      messageId: formData.messageId,
    }
    if (formControl.watch('dateFilter') === 'custom') {
      data.startDate = formData.startDate
      data.endDate = formData.endDate
    } else {
      data.days = Number(formData.dateFilter)
    }
    return data
  }

  const onSubmit = () => {
    messageTrace.mutate(
      { url: apiUrl, data: buildSearchData() },
      {
        onError: (error) => {
          setSearchResults([])
          setMetadata({ Error: getMessageTraceError(error) })
        },
      }
    )
    setFilterExpanded(false)
  }

  const onClear = () => {
    formControl.reset({
      dateFilter: '2',
      advancedFilters: false,
      endDate: null,
      fromIP: '',
      messageId: '',
      recipient: [],
      sender: [],
      startDate: null,
      status: [],
      subject: '',
      subjectFilterType: 'Contains',
      toIP: '',
    })
    setSearchResults([])
    setMetadata(null)
  }

  const isIPAddress = {
    validate: (value) =>
      !value ||
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        value
      ) ||
      /^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)$/.test(value) ||
      'This is not a valid IP address',
  }

  return (
    <>
      <Stack spacing={2} sx={{ px: 3 }}>
        <CippButtonCard
          component="accordion"
          title="Find a message"
          accordionExpanded={filterExpanded}
          onAccordionChange={(expanded) => setFilterExpanded(expanded)}
        >
          <Grid container spacing={1.5} sx={{ mt: -1.5 }}>
            <Grid size={12}>
              <CippFormComponent
                type="radio"
                row
                name="dateFilter"
                label="When was it sent?"
                options={[
                  { label: 'Last 48 hours', value: '2' },
                  { label: 'Last 7 days', value: '7' },
                  { label: 'Last 10 days', value: '10' },
                  { label: 'Pick a date range', value: 'custom' },
                ]}
                formControl={formControl}
              />
            </Grid>
            {formControl.watch('dateFilter') === 'custom' && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="datePicker"
                    name="startDate"
                    label="Start Date"
                    dateTimeType="datetime"
                    formControl={formControl}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="datePicker"
                    name="endDate"
                    label="End Date"
                    dateTimeType="datetime"
                    formControl={formControl}
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="autoComplete"
                freeSolo
                multiple={true}
                creatable={true}
                name="sender"
                label="Who sent it?"
                placeholder="Type an email address and press Enter"
                helperText="Leave empty to include every sender"
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
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="autoComplete"
                freeSolo
                multiple={true}
                creatable={true}
                name="recipient"
                label="Who was it sent to?"
                placeholder="Type an email address and press Enter"
                helperText="Leave empty to include every recipient"
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
                name="subject"
                label="What was the subject line?"
                helperText={
                  subjectHelp[formControl.watch('subjectFilterType')] ??
                  subjectHelp.Contains
                }
                formControl={formControl}
              />
            </Grid>
            {formControl.watch('advancedFilters') && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="radio"
                    row
                    name="subjectFilterType"
                    label="Subject Match"
                    options={[
                      { label: 'Contains', value: 'Contains' },
                      { label: 'Starts with', value: 'StartsWith' },
                      { label: 'Ends with', value: 'EndsWith' },
                    ]}
                    formControl={formControl}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="autoComplete"
                    name="status"
                    label="Delivery Status"
                    options={statusOptions}
                    multiple={true}
                    formControl={formControl}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="textField"
                    name="messageId"
                    label="Message ID"
                    helperText="Narrows the search along with the other filters"
                    formControl={formControl}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <CippFormComponent
                    type="textField"
                    name="fromIP"
                    label="From IP"
                    formControl={formControl}
                    validators={isIPAddress}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <CippFormComponent
                    type="textField"
                    name="toIP"
                    label="To IP"
                    formControl={formControl}
                    validators={isIPAddress}
                  />
                </Grid>
              </>
            )}

            <Grid
              size={12}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Button
                onClick={onSubmit}
                variant="contained"
                color="primary"
                startIcon={<CippIcons.MagnifyingGlassIcon />}
              >
                Search
              </Button>
              <Button
                onClick={onClear}
                variant="outlined"
                startIcon={<CippIcons.ClearAll />}
              >
                Clear
              </Button>
              <CippFormComponent
                type="switch"
                name="advancedFilters"
                label="Show advanced filters"
                formControl={formControl}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  ml: 'auto'
                }}>
                Searches cover up to 10 days at a time, going back 90 days. For
                anything older, use the Historical Search tab.
              </Typography>
            </Grid>
          </Grid>
        </CippButtonCard>
        {metadata?.Error && <Alert severity="error">{metadata.Error}</Alert>}
        {metadata?.Note && <Alert severity="info">{metadata.Note}</Alert>}
        <CippDataTable
          title={
            pageTitle +
            (formControl.watch('dateFilter') !== 'custom'
              ? ` - Last ${formControl.watch('dateFilter')} Days`
              : ` - ${new Date(
                  formControl.watch('startDate') * 1000
                ).toLocaleDateString()} to ${new Date(
                  formControl.watch('endDate') * 1000
                ).toLocaleDateString()}`)
          }
          simpleColumns={simpleColumns}
          data={searchResults}
          isFetching={messageTrace.isPending}
          refreshFunction={onSubmit}
          actions={actions}
          mobileCard={{ primary: 'Subject', secondary: 'SenderAddress' }}
        />
      </Stack>
      <CippOffCanvas
        title="Message Trace Details"
        size="lg"
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        isFetching={messageTraceDetail.isPending}
        extendedInfoFields={[
          'Subject',
          'SenderAddress',
          'RecipientAddress',
          'Status',
          'Received',
          'MessageId',
          'MessageTraceId',
        ]}
        extendedData={selectedRow ?? {}}
      >
        <CippDataTable
          noCard={true}
          title="Delivery Events"
          simpleColumns={detailColumns}
          data={traceDetails ?? []}
          refreshFunction={() =>
            selectedRow && startMessageTraceDetail(selectedRow)
          }
          isFetching={messageTraceDetail.isPending}
          mobileCard={{ primary: 'Event', secondary: 'Detail' }}
        />
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
