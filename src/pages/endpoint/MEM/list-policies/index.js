import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { PermissionButton } from '../../../../utils/permissions.js'
import { CippPolicyDeployDrawer } from '../../../../components/CippComponents/CippPolicyDeployDrawer.jsx'
import { useSettings } from '../../../../hooks/use-settings.js'
import { useCippIntunePolicyActions } from '../../../../components/CippComponents/CippIntunePolicyActions.jsx'
import { Sync, Info, CloudDone, Bolt } from '@mui/icons-material'
import { Button, SvgIcon, IconButton, Tooltip, Chip } from '@mui/material'
import { Stack } from '@mui/system'
import { useDialog } from '../../../../hooks/use-dialog'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog'
import { CippQueueTracker } from '../../../../components/CippTable/CippQueueTracker'
import { useState, useEffect } from 'react'

const Page = () => {
  const pageTitle = 'Configuration Policies'
  const cardButtonPermissions = ['Endpoint.MEM.ReadWrite']
  const tenant = useSettings().currentTenant
  const isAllTenants = tenant === 'AllTenants'
  const syncDialog = useDialog()
  const [syncQueueId, setSyncQueueId] = useState(null)
  const [useReportDB, setUseReportDB] = useState(isAllTenants)

  // Reset toggle whenever the tenant changes
  useEffect(() => {
    setUseReportDB(tenant === 'AllTenants')
  }, [tenant])

  const actions = useCippIntunePolicyActions(tenant, 'URLName', {
    templateData: {
      ID: 'id',
      URLName: 'URLName',
    },
    deleteUrlName: 'URLName',
  })

  const offCanvas = {
    extendedInfoFields: [
      'createdDateTime',
      'displayName',
      'lastModifiedDateTime',
      'PolicyTypeName',
    ],
    actions: actions,
  }

  const simpleColumns = [
    ...(useReportDB ? ['Tenant', 'CacheTimestamp'] : []),
    'displayName',
    'PolicyTypeName',
    'PolicyAssignment',
    'PolicyExclude',
    'description',
    'lastModifiedDateTime',
  ]

  const pageActions = [
    <Stack key="actions-stack" direction="row" spacing={1} alignItems="center">
      {useReportDB && (
        <>
          <CippQueueTracker
            queueId={syncQueueId}
            queryKey={`ListIntunePolicy-${tenant}`}
            title="Intune Policy Sync"
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
              ? 'Showing cached data from the Reporting Database — click to switch to live'
              : 'Showing live data — click to switch to cache'
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
        apiUrl={`/api/ListIntunePolicy${useReportDB ? '?UseReportDB=true' : ''}`}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        queryKey={`ListIntunePolicy-${tenant}-${useReportDB}`}
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
        title="Sync Intune Policy Report"
        fields={[]}
        api={{
          type: 'GET',
          url: '/api/ExecCIPPDBCache',
          confirmText: `Run Intune policy cache sync for ${tenant}? This will update policy data immediately.`,
          relatedQueryKeys: [`ListIntunePolicy-${tenant}-true`],
          data: {
            Name: 'IntunePolicies',
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
