import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import tabOptions from './tabOptions.json'

const Page = () => {
  const pageTitle = 'Licences Report'
  const apiUrl = '/api/ListLicensesReport'
  const router = useRouter()

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

  const simpleColumns = [
    'Tenant',
    'License',
    'CountUsed',
    'CountAvailable',
    'TotalLicenses',
    'AssignedUsers',
    'AssignedGroups',
    'TermInfo', // TODO TermInfo is not showing as a clickable json object in the table, like CApolicies does in the mfa report. IDK how to fix it. -Bobby
  ]

  const actions = [
    {
      label: 'Assign License to User',
      type: 'POST',
      url: '/api/ExecBulkLicense',
      icon: <CippIcons.AssignmentInd />,
      confirmText:
        'Are you sure you want to assign [License] to the selected user?',
      multiPost: false,
      children: ({ formHook, row }) => (
        <CippFormComponent
          type="autoComplete"
          name="userIds"
          label="Select User"
          multiple={false}
          creatable={false}
          formControl={formHook}
          validators={{ required: 'Please select a user' }}
          api={{
            tenantFilter: row?.Tenant,
            url: '/api/ListGraphRequest',
            dataKey: 'Results',
            labelField: (option) =>
              `${option.displayName} (${option.userPrincipalName})`,
            valueField: 'id',
            queryKey: `Users-${row?.Tenant}`,
            data: {
              Endpoint: 'users',
              $select: 'id,displayName,userPrincipalName',
              $count: true,
              $orderby: 'displayName',
              $top: 999,
            },
          }}
        />
      ),
      customDataformatter: (row, action, formData) => ({
        tenantFilter: row.Tenant,
        LicenseOperation: 'Add',
        Licenses: [{ label: row.License, value: row.skuId }],
        userIds: [formData.userIds?.value],
      }),
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'Tenant',
      'License',
      'CountUsed',
      'CountAvailable',
      'TotalLicenses',
      'AssignedUsers',
      'AssignedGroups',
      'TermInfo',
    ],
    actions: actions,
  }

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiDataKey="Results"
      simpleColumns={simpleColumns}
      actions={actions}
      offCanvas={offCanvas}
      initialFilters={urlFilters}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
