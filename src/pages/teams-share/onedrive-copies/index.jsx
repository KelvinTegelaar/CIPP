import { Alert, Button, SvgIcon } from '@mui/material'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { CippTablePage } from '../../../components/CippComponents/CippTablePage.jsx'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { CippApiDialog } from '../../../components/CippComponents/CippApiDialog'
import { useDialog } from '../../../hooks/use-dialog'
import { useSettings } from '../../../hooks/use-settings'
import { usePermissions } from '../../../hooks/use-permissions'
import { ApiGetCall } from '../../../api/ApiCall'
import { CippIcons } from '../../../utils/icon-registry'
import {
  oneDriveCopyConfirmText,
  oneDriveCopyDisclaimer,
  oneDriveCopyFields,
  oneDriveCopyLeaverField,
} from '../../../utils/onedrive-copy-fields'

// Opening a copy asks for its live status; the backend checks SharePoint at most every 30 minutes.
const CopyStatus = ({ row }) => {
  const tenantFilter = useSettings().currentTenant
  const status = ApiGetCall({
    url: '/api/ListOneDriveCopyToUser',
    data: { tenantFilter, OperationId: row.OperationId },
    queryKey: `ListOneDriveCopyToUser-${tenantFilter}-status-${row.OperationId}`,
  })
  const copy = Array.isArray(status.data) ? status.data[0] : null
  return (
    <CippDataTable
      noCard
      title={copy?.Message ?? 'Recipients'}
      data={(copy?.Recipients ?? row.Recipients ?? []).map(
        ({ UserPrincipalName, ...rest }) => ({
          Destination: UserPrincipalName,
          ...rest,
        })
      )}
      simpleColumns={[
        'Destination',
        'State',
        'Message',
        'ItemsCopied',
        'BytesCopied',
        'JobsComplete',
        'JobsTotal',
      ]}
      isFetching={status.isFetching}
      refreshFunction={status.refetch}
    />
  )
}

const Page = () => {
  const tenant = useSettings().currentTenant
  const startDialog = useDialog()
  const { checkPermissions } = usePermissions()
  const canStart = checkPermissions(['Identity.OneDrive.ReadWrite'])

  return (
    <>
      <CippTablePage
        tableFilter={
          <Alert severity="info" sx={{ mb: 2 }}>
            {oneDriveCopyDisclaimer}
          </Alert>
        }
        title="OneDrive Copies"
        apiUrl="/api/ListOneDriveCopyToUser"
        queryKey={`ListOneDriveCopyToUser-${tenant}`}
        simpleColumns={[
          'StartedUtc',
          'Leaver',
          'Destinations',
          'State',
          'StartedBy',
          'SourceFileCount',
          'SourceBytes',
          'LastCheckedUtc',
        ]}
        offCanvas={{ children: (row) => <CopyStatus row={row} />, size: 'lg' }}
        cardButton={
          canStart && (
            <Button
              onClick={startDialog.handleOpen}
              startIcon={
                <SvgIcon fontSize="small">
                  <CippIcons.Add />
                </SvgIcon>
              }
            >
              Copy OneDrive
            </Button>
          )
        }
      />
      <CippApiDialog
        title="Copy OneDrive"
        createDialog={startDialog}
        fields={[oneDriveCopyLeaverField, ...oneDriveCopyFields]}
        api={{
          url: '/api/ExecOneDriveCopyToUser',
          type: 'POST',
          data: {},
          confirmText: oneDriveCopyConfirmText,
          relatedQueryKeys: ['ListOneDriveCopyToUser*'],
        }}
      />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
