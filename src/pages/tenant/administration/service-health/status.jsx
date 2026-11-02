import { CippTablePage } from '../../../../components/CippComponents/CippTablePage'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import { CippIcons } from '../../../../utils/icon-registry'
import { useRouter } from 'next/router'
import { groupRowsBy } from '../../../../utils/group-rows'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { useSettings } from '../../../../hooks/use-settings'
import { useUrlFilters } from '../../../../utils/url-filters'
import { ApiGetCall } from '../../../../api/ApiCall'
import tabOptions from './tabOptions'

const Page = () => {
  const { currentTenant } = useSettings()

  const router = useRouter()

  const urlFilters = useUrlFilters()

  const overviews = ApiGetCall({
    url: '/api/ListServiceHealthOverviews?UseReportDB=true',
    data: { tenantFilter: currentTenant },
    queryKey: `overviews-${currentTenant}`,
    waiting: !!currentTenant,
  })
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListServiceHealthOverviews',
    queryKey: 'ListServiceHealthOverviews',
    cacheName: 'ServiceHealthOverviews',
    syncTitle: 'Sync Service Health',
    allowToggle: true,
    defaultCached: true,
    allowAllTenantSync: true,
  })

  return (
    <>
      <CippTablePage
        title="Service Status"
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        queryKey={reportDB.resolvedQueryKey}
        simpleColumns={[
          ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
          'service',
          'status',
          ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
        ]}
        dataSourceControls={reportDB.controls}
        filters={[
          {
            filterName: 'Not operational',
            value: [
              {
                id: 'status',
                value: 'serviceOperational',
                filterFn: 'notEquals',
              },
            ],
            type: 'column',
          },
          {
            filterName: 'Degraded',
            value: [{ id: 'status', value: 'serviceDegradation' }],
            type: 'column',
          },
          {
            filterName: 'Interrupted',
            value: [{ id: 'status', value: 'serviceInterruption' }],
            type: 'column',
          },
          ...urlFilters,
        ]}
        dataTransform={
          currentTenant === 'AllTenants'
            ? groupRowsBy('service, status')
            : undefined
        }
        offCanvas={{
          extendedInfoFields: ['service', 'status', 'Tenants'],
          size: 'lg',
        }}
        tableFilter={
          <CippInfoBar
            data={[
              {
                name: 'Services',
                data: new Set((overviews.data ?? []).map((r) => r?.service))
                  .size,
                icon: <CippIcons.Cloud />,
                color: 'primary',
              },
              {
                name: 'Services with issues',
                data: new Set(
                  (overviews.data ?? [])
                    .filter((r) => String(r?.status) !== 'serviceOperational')
                    .map((r) => r?.service)
                ).size,
                icon: <CippIcons.Warning />,
                color: 'warning',
              },
              {
                name: 'Degraded',
                data: new Set(
                  (overviews.data ?? [])
                    .filter((r) => String(r?.status) === 'serviceDegradation')
                    .map((r) => r?.service)
                ).size,
                icon: <CippIcons.Warning />,
                color: 'warning',
                link: `${router.pathname}?filters=${encodeURIComponent(JSON.stringify([{ id: 'status', value: 'serviceDegradation' }]))}`,
              },
              {
                name: 'Interrupted',
                data: new Set(
                  (overviews.data ?? [])
                    .filter((r) => String(r?.status) === 'serviceInterruption')
                    .map((r) => r?.service)
                ).size,
                icon: <CippIcons.Error />,
                color: 'error',
                link: `${router.pathname}?filters=${encodeURIComponent(JSON.stringify([{ id: 'status', value: 'serviceInterruption' }]))}`,
              },
            ]}
            isFetching={overviews.isFetching}
          />
        }
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={true}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)
export default Page
