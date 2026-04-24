import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog.jsx'
import { PermissionButton } from '../../../../utils/permissions.js'
import { CippPolicyDeployDrawer } from '../../../../components/CippComponents/CippPolicyDeployDrawer.jsx'
import { useSettings } from '../../../../hooks/use-settings.js'
import { useCippIntunePolicyActions } from '../../../../components/CippComponents/CippIntunePolicyActions.jsx'
import { Sync, CloudDone, Bolt } from '@mui/icons-material'
import { Button, Chip, SvgIcon, Tooltip } from '@mui/material'
import { Stack } from '@mui/system'
import { useDialog } from '../../../../hooks/use-dialog'
import { CippQueueTracker } from '../../../../components/CippTable/CippQueueTracker'
import { useEffect, useState } from 'react'

const Page = () => {
  const pageTitle = 'App Protection & Configuration Policies'
  const cardButtonPermissions = ['Endpoint.MEM.ReadWrite']
  const tenant = useSettings().currentTenant
  const isAllTenants = tenant === 'AllTenants'
  const syncDialog = useDialog()
  const [syncQueueId, setSyncQueueId] = useState(null)
  const [useReportDB, setUseReportDB] = useState(isAllTenants)

  useEffect(() => {
    setUseReportDB(tenant === 'AllTenants')
  }, [tenant])

  const actions = useCippIntunePolicyActions(tenant, 'URLName', {
    templateData: {
      ID: 'id',
      URLName: 'managedAppPolicies',
    },
    platformType: 'deviceAppManagement',
    deleteUrlName: 'URLName',
  })

  const offCanvas = {
    extendedInfoFields: [
      'createdDateTime',
      'displayName',
      'lastModifiedDateTime',
      'PolicyTypeName',
      'PolicySource',
    ],
    actions: actions,
  }

  const simpleColumns = [
    ...(useReportDB ? ['CacheTimestamp'] : []),
    ...(useReportDB && isAllTenants ? ['Tenant'] : []),
    'displayName',
    'PolicyTypeName',
    'PolicyAssignment',
    'PolicyExclude',
    'lastModifiedDateTime',
  ]

  const pageActions = [
    <Stack key="actions-stack" direction="row" spacing={1} alignItems="center">
      {useReportDB && (
        <>
          <CippQueueTracker
            queueId={syncQueueId}
            queryKey={`ListAppProtectionPolicies-${tenant}`}
            title="App Protection Policies Sync"
          />
          <Button
            startIcon={
              <SvgIcon fontSize="small">
                <Sync />
              </SvgIcon>
            }
            size="xs"
            onClick={syncDialog.handleOpen}
          >
            Sync
          </Button>
        </>
      )}
      <Tooltip
        title={
          isAllTenants
            ? 'AllTenants always uses cached data'
            : useReportDB
              ? 'Showing cached data from the Reporting Database - click to switch to live'
              : 'Showing live data - click to switch to cache'
        }
      >
        <span>
          <Chip
            icon={useReportDB ? <CloudDone /> : <Bolt />}
            label={useReportDB ? 'Cached' : 'Live'}
            color="primary"
            size="small"
            onClick={isAllTenants ? undefined : () => setUseReportDB((prev) => !prev)}
            clickable={!isAllTenants}
            disabled={isAllTenants}
            variant="outlined"
          />
        </span>
      </Tooltip>
    </Stack>,
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={`/api/ListAppProtectionPolicies${useReportDB ? '?UseReportDB=true' : ''}`}
        queryKey={`ListAppProtectionPolicies-${tenant}-${useReportDB}`}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <CippPolicyDeployDrawer
              buttonText="Deploy Policy"
              requiredPermissions={cardButtonPermissions}
              PermissionButton={PermissionButton}
            />
            {pageActions}
          </Stack>
        }
      />
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync App Protection Policies Report"
        fields={[]}
        api={{
          type: 'GET',
          url: '/api/ExecCIPPDBCache',
          confirmText: `Run app protection policies cache sync for ${tenant}? This will update policy data immediately.`,
          relatedQueryKeys: [`ListAppProtectionPolicies-${tenant}-true`],
          data: {
            Name: 'IntuneAppProtectionPolicies',
          },
          onSuccess: (result) => {
            if (result?.Metadata?.QueueId) {
              setSyncQueueId(result?.Metadata?.QueueId)
            }
          },
        }}
      />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
