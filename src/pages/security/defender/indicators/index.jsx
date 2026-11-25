import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippAddDefenderIndicatorDrawer } from '../../../../components/CippComponents/CippAddDefenderIndicatorDrawer.jsx'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { usePermissions } from '../../../../hooks/use-permissions'
import { useSettings } from '../../../../hooks/use-settings'
import { CippIcons } from '../../../../utils/icon-registry'
import { isMultiTenant } from '../../../../utils/tenant-selection'

const BATCH_SIZE = 500

const Page = () => {
  const tenant = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWrite = checkPermissions(['Security.Defender.ReadWrite'])

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListDefenderIndicators',
    queryKey: 'ListDefenderIndicators',
    cacheName: 'DefenderIndicators',
    syncTitle: 'Sync Defender Indicators',
    allowToggle: true,
    defaultCached: false,
    allowAllTenantSync: true,
    serverPagination: true,
  })

  const hasTarget = (row) =>
    Boolean(row?.id && row?.Tenant) &&
    !isMultiTenant(row.Tenant) &&
    (isMultiTenant(tenant) || row.Tenant === tenant)

  const removeBatches = (row) => {
    const idsByTenant = new Map()
    for (const item of (Array.isArray(row) ? row : [row]).filter(hasTarget)) {
      if (!idsByTenant.has(item.Tenant)) idsByTenant.set(item.Tenant, new Set())
      idsByTenant.get(item.Tenant).add(String(item.id))
    }
    const batches = []
    for (const [rowTenant, ids] of idsByTenant) {
      const list = [...ids]
      for (let start = 0; start < list.length; start += BATCH_SIZE) {
        batches.push({
          tenantFilter: rowTenant,
          IndicatorIds: list.slice(start, start + BATCH_SIZE),
        })
      }
    }
    return batches
  }

  const actions = [
    {
      label: 'Remove',
      type: 'POST',
      url: '/api/RemoveDefenderIndicator',
      icon: <CippIcons.Delete />,
      color: 'danger',
      confirmText:
        'Remove the [action] indicator for [indicatorValue] from [Tenant]? Devices stop applying it once Defender sends them the change.',
      customDataformatter: (row) => removeBatches(row),
      relatedQueryKeys: ['ListDefenderIndicators*'],
      condition: (row) => canWrite && hasTarget(row),
    },
  ]

  return (
    <>
      <CippTablePage
        title="Defender Indicators"
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        queryKey={reportDB.resolvedQueryKey}
        dataSourceControls={reportDB.controls}
        actions={actions}
        cardButton={
          canWrite ? (
            <CippAddDefenderIndicatorDrawer
              queryKey={reportDB.resolvedQueryKey}
            />
          ) : null
        }
        filters={[
          {
            filterName: 'Allowed',
            value: [{ id: 'action', value: 'Allowed' }],
            type: 'column',
            filterType: 'equal',
          },
        ]}
        offCanvas={{
          extendedInfoFields: [
            'indicatorValue',
            'indicatorType',
            'action',
            'title',
            'description',
            'severity',
            'generateAlert',
            'expirationTime',
            'creationTimeDateTimeUtc',
            'createdByDisplayName',
            'createdBySource',
            'lastUpdateTime',
            'lastUpdatedBy',
            'rbacGroupNames',
            'rbacGroupIds',
            'application',
            'id',
          ],
        }}
        simpleColumns={[
          ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
          'indicatorValue',
          'indicatorType',
          'action',
          'title',
          'description',
          'expirationTime',
          'createdByDisplayName',
          'creationTimeDateTimeUtc',
          'rbacGroupNames',
          ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
        ]}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout tenantGroupSupport={true} allTenantsSupport={true}>
    {page}
  </DashboardLayout>
)

export default Page
