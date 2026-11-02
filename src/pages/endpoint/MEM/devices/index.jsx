import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog.jsx'
import { getIntuneDeviceActions } from '../../../../components/CippComponents/CippIntuneDeviceActions.jsx'
import { useSettings } from '../../../../hooks/use-settings'
import { useDialog } from '../../../../hooks/use-dialog.js'
import { Button } from '@mui/material'
import { Stack } from '@mui/system'

const Page = () => {
  const pageTitle = 'Devices'
  const tenantFilter = useSettings().currentTenant
  const depSyncDialog = useDialog()

  const actions = getIntuneDeviceActions({ tenantFilter })

  const offCanvas = {
    extendedInfoFields: ['deviceName', 'userPrincipalName'],
    actions: actions,
  }

  const simpleColumns = [
    'deviceName',
    'userPrincipalName',
    'complianceState',
    'manufacturer',
    'model',
    'operatingSystem',
    'osVersion',
    'enrolledDateTime',
    'managedDeviceOwnerType',
    'deviceEnrollmentType',
    'joinType',
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListGraphRequest"
        apiData={{
          Endpoint: 'deviceManagement/managedDevices',
        }}
        apiDataKey="Results"
        actions={actions}
        queryKey={`MEMDevices-${tenantFilter}`}
        offCanvas={offCanvas}
        rowOpen={{
          link:
            tenantFilter === 'AllTenants'
              ? '/endpoint/MEM/devices/device?deviceId=[id]&tenantFilter=[Tenant]'
              : `/endpoint/MEM/devices/device?deviceId=[id]&tenantFilter=${tenantFilter}`,
          condition: (row) => Boolean(row?.id),
        }}
        simpleColumns={simpleColumns}
        cardButton={
          <Stack direction="row" spacing={1} sx={{
            alignItems: "center"
          }}>
            <Button onClick={depSyncDialog.handleOpen} startIcon={<CippIcons.Sync />}>
              Sync DEP
            </Button>
          </Stack>
        }
      />
      <CippApiDialog
        title="Sync DEP Tokens"
        createDialog={depSyncDialog}
        api={{
          type: 'POST',
          url: '/api/ExecSyncDEP',
          data: {},
          confirmText: `Are you sure you want to sync Apple Device Enrollment Program (DEP) tokens? This will sync all DEP tokens for ${tenantFilter}. This may take several minutes to complete in the background, and can only be done every 15 minutes.`,
        }}
      />
    </>
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
