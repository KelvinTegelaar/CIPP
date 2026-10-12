import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'
import { useSettings } from '../../../../hooks/use-settings.js'
import { PermissionButton } from '../../../../utils/permissions'
import { useCippUserActions } from '../../../../components/CippComponents/CippUserActions.jsx'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { CippInviteGuestDrawer } from '../../../../components/CippComponents/CippInviteGuestDrawer.jsx'
import { CippBulkInviteGuestDrawer } from '../../../../components/CippComponents/CippBulkInviteGuestDrawer.jsx'
import { CippBulkUserDrawer } from '../../../../components/CippComponents/CippBulkUserDrawer.jsx'
import { CippAddUserDrawer } from '../../../../components/CippComponents/CippAddUserDrawer.jsx'
import { CippApiLogsDrawer } from '../../../../components/CippComponents/CippApiLogsDrawer.jsx'
import { Box } from '@mui/material'

// Live mode pages straight through Graph so large tenants stream in page by page.
const liveApiData = {
  Endpoint: 'users',
  manualPagination: true,
  $select:
    'id,accountEnabled,businessPhones,city,createdDateTime,companyName,country,department,displayName,faxNumber,givenName,isResourceAccount,jobTitle,mail,mailNickname,mobilePhone,officeLocation,otherMails,postalCode,preferredDataLocation,preferredLanguage,proxyAddresses,showInAddressList,state,streetAddress,surname,usageLocation,userPrincipalName,userType,assignedLicenses,licenseAssignmentStates,onPremisesSyncEnabled,OnPremisesImmutableId,onPremisesLastSyncDateTime,onPremisesDistinguishedName,onPremisesDomainName,onPremisesSamAccountName,onPremisesSecurityIdentifier,onPremisesUserPrincipalName',
  $count: true,
  $orderby: 'displayName',
  $top: 999,
}

const Page = () => {
  const userActions = useCippUserActions()
  const pageTitle = 'Users'
  const tenant = useSettings().currentTenant
  const tenantQuery = tenant === 'AllTenants' ? '[Tenant]' : tenant
  const cardButtonPermissions = ['Identity.User.ReadWrite']

  // Cached mode reads the Users collection straight from the reporting database;
  // live mode keeps the Graph proxy below.
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListDBCache?type=Users',
    queryKey: 'ListDBCache-Users',
    cacheName: 'Users',
    syncTitle: 'Sync Users Report',
    allowToggle: true,
    defaultCached: false,
    allowAllTenantSync: true,
    // Reporting-DB rows carry no per-row cache timestamp.
    cacheColumns: [],
  })

  const filters = [
    {
      filterName: 'Account Enabled',
      value: [{ id: 'accountEnabled', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'Account Disabled',
      value: [{ id: 'accountEnabled', value: 'No' }],
      type: 'column',
    },
    {
      filterName: 'Guest Accounts',
      value: [{ id: 'userType', value: 'Guest' }],
      type: 'column',
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'createdDateTime', // Created Date (UTC)
      'id', // Unique ID
      'userPrincipalName', // UPN
      'givenName', // Given Name
      'surname', // Surname
      'jobTitle', // Job Title
      'assignedLicenses', // Licenses
      'businessPhones', // Business Phone
      'mobilePhone', // Mobile Phone
      'mail', // Mail
      'city', // City
      'department', // Department
      'onPremisesLastSyncDateTime', // OnPrem Last Sync
      'onPremisesDistinguishedName', // OnPrem DN
      'otherMails', // Alternate Email Addresses
      'licenseAssignmentStates', // License Assignment States
    ],
    actions: userActions,
  }

  return (
    <>
      <CippTablePage
        title={pageTitle}
        cardButton={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CippAddUserDrawer
              requiredPermissions={cardButtonPermissions}
              PermissionButton={PermissionButton}
            />
            <CippBulkUserDrawer
              requiredPermissions={cardButtonPermissions}
              PermissionButton={PermissionButton}
            />
            <CippInviteGuestDrawer
              requiredPermissions={cardButtonPermissions}
              PermissionButton={PermissionButton}
            />
            <CippBulkInviteGuestDrawer
              requiredPermissions={cardButtonPermissions}
              PermissionButton={PermissionButton}
            />
            <CippApiLogsDrawer
              apiFilter="(?<!Scheduler_)User"
              buttonText="View Logs"
              title="User Logs"
              PermissionButton={PermissionButton}
              tenantFilter={tenant}
            />
          </Box>
        }
        dataSourceControls={reportDB.controls}
        apiUrl={
          reportDB.useReportDB
            ? reportDB.resolvedApiUrl
            : '/api/ListGraphRequest'
        }
        apiData={reportDB.useReportDB ? reportDB.resolvedApiData : liveApiData}
        apiDataKey="Results"
        // Cache reads arrive in table order, not sorted like the live Graph query.
        defaultSorting={[{ id: 'displayName', desc: false }]}
        // The live key matches what the add/invite drawers invalidate after a change.
        queryKey={
          reportDB.useReportDB ? reportDB.resolvedQueryKey : `Users-${tenant}`
        }
        actions={userActions}
        offCanvas={offCanvas}
        rowOpen={{
          link: `/identity/administration/users/user?userId=[id]&tenantFilter=${tenantQuery}`,
          condition: (row) => Boolean(row?.id),
        }}
        simpleColumns={[
          ...reportDB.cacheColumns,
          'accountEnabled',
          'userPrincipalName',
          'displayName',
          'mail',
          'businessPhones',
          'proxyAddresses',
          'assignedLicenses',
          'licenseAssignmentStates',
          'userType',
        ]}
        filters={filters}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
