import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { AssignmentInd } from '@mui/icons-material'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'

const Page = () => {
  const pageTitle = 'Licences Report'
  const apiUrl = '/api/ListLicenses'

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
      icon: <AssignmentInd />,
      confirmText: 'Are you sure you want to assign [License] to the selected user?',
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
            labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
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
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
