import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

const Page = () => {
  const pageTitle = 'Group Usage Report'
  const router = useRouter()

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListGroupUsage',
    queryKey: 'ListGroupUsage',
    cacheName: 'GroupUsage',
    syncTitle: 'Sync Group Usage Report',
    syncConfirmText:
      'Refresh all cached data sources for the group usage report (groups, Conditional Access, Intune, roles, applications, licenses, transport rules)? This can take a few minutes.',
    allowToggle: false,
    defaultCached: true,
  })

  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
    'displayName',
    'groupType',
    'mail',
    'usedLocations',
    'usedIn',
    'usageCount',
    'isUsed',
    ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
  ]

  const filters = [
    {
      filterName: 'Unused groups',
      value: [{ id: 'isUsed', value: 'No' }],
      type: 'column',
    },
    {
      filterName: 'Used in Conditional Access',
      value: [{ id: 'usedLocations', value: 'Conditional Access' }],
      type: 'column',
    },
    {
      filterName: 'Used in Intune',
      value: [{ id: 'usedLocations', value: 'Intune' }],
      type: 'column',
    },
    {
      filterName: 'Used for licensing',
      value: [{ id: 'usedLocations', value: 'Licensing' }],
      type: 'column',
    },
  ]

  const urlFilters = useMemo(() => {
    if (router.query.filters) {
      try {
        return JSON.parse(router.query.filters)
      } catch (e) {
        console.error('Failed to parse filters from URL:', e)
        return null
      }
    }
    return null
  }, [router.query.filters])

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        queryKey={reportDB.resolvedQueryKey}
        simpleColumns={simpleColumns}
        filters={filters}
        dataSourceControls={reportDB.controls}
        initialFilters={urlFilters}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
