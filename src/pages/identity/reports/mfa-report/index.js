import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { LockPerson } from '@mui/icons-material'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

const Page = () => {
  const pageTitle = 'MFA Report'
  const router = useRouter()

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListMFAUsers',
    queryKey: 'ListMFAUsers',
    cacheName: 'MFAState',
    syncTitle: 'Sync MFA Report',
    allowToggle: false,
    defaultCached: true,
  })

  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
    'UPN',
    'AccountEnabled',
    'isLicensed',
    'MFARegistration',
    'PerUser',
    'CoveredBySD',
    'CoveredByCA',
    'MFAMethods',
    'CAPolicies',
    'IsAdmin',
    'UserType',
    ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
  ]

  const filters = [
    {
      filterName: 'Enabled, licensed users',
      value: [
        { id: 'AccountEnabled', value: 'Yes' },
        { id: 'isLicensed', value: 'Yes' },
      ],
      type: 'column',
    },
    {
      filterName: 'Enabled, licensed users missing MFA',
      value: [
        { id: 'AccountEnabled', value: 'Yes' },
        { id: 'isLicensed', value: 'Yes' },
        { id: 'MFARegistration', value: 'No' },
      ],
      type: 'column',
    },
    {
      filterName: 'No MFA methods registered',
      value: [{ id: 'MFARegistration', value: 'No' }],
      type: 'column',
    },
    {
      filterName: 'MFA methods registered',
      value: [{ id: 'MFARegistration', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'Admin Users',
      value: [{ id: 'IsAdmin', value: 'Yes' }],
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

  const actions = [
    {
      label: 'Set Per-User MFA',
      type: 'POST',
      icon: <LockPerson />,
      url: '/api/ExecPerUserMFA',
      data: { userId: 'ID', userPrincipalName: 'UPN' },
      fields: [
        {
          type: 'autoComplete',
          name: 'State',
          label: 'State',
          options: [
            { label: 'Enforced', value: 'Enforced' },
            { label: 'Enabled', value: 'Enabled' },
            { label: 'Disabled', value: 'Disabled' },
          ],
          multiple: false,
          creatable: false,
        },
      ],
      confirmText: 'Are you sure you want to set per-user MFA for these users?',
      multiPost: false,
    },
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        queryKey={reportDB.resolvedQueryKey}
        simpleColumns={simpleColumns}
        filters={filters}
        actions={actions}
        cardButton={reportDB.controls}
        initialFilters={urlFilters}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
