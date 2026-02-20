import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useSettings } from "../../../../hooks/use-settings.js";
import { PermissionButton } from "../../../../utils/permissions";
import { useCippUserActions } from "../../../../components/CippComponents/CippUserActions.jsx";
import { CippInviteGuestDrawer } from "../../../../components/CippComponents/CippInviteGuestDrawer.jsx";
import { CippBulkInviteGuestDrawer } from "../../../../components/CippComponents/CippBulkInviteGuestDrawer.jsx";
import { CippBulkUserDrawer } from "../../../../components/CippComponents/CippBulkUserDrawer.jsx";
import { CippAddUserDrawer } from "../../../../components/CippComponents/CippAddUserDrawer.jsx";
import { CippApiLogsDrawer } from "../../../../components/CippComponents/CippApiLogsDrawer.jsx";
import { Box } from "@mui/material";

const Page = () => {
  const userActions = useCippUserActions();
  const pageTitle = "Users";
  const tenant = useSettings().currentTenant;
  const cardButtonPermissions = ["Identity.User.ReadWrite"];

  const filters = [
    {
      filterName: "Account Enabled",
      value: [{ id: "accountEnabled", value: "Yes" }],
      type: "column",
    },
    {
      filterName: "Account Disabled",
      value: [{ id: "accountEnabled", value: "No" }],
      type: "column",
    },
    {
      filterName: "Guest Accounts",
      value: [{ id: "userType", value: "Guest" }],
      type: "column",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "createdDateTime", // Created Date (UTC)
      "id", // Unique ID
      "userPrincipalName", // UPN
      "givenName", // Given Name
      "surname", // Surname
      "jobTitle", // Job Title
      "assignedLicenses", // Licenses
      "businessPhones", // Business Phone
      "mobilePhone", // Mobile Phone
      "mail", // Mail
      "city", // City
      "department", // Department
      "onPremisesLastSyncDateTime", // OnPrem Last Sync
      "onPremisesDistinguishedName", // OnPrem DN
      "otherMails", // Alternate Email Addresses
      "licenseAssignmentStates", // License Assignment States
    ],
    actions: userActions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      cardButton={
        <Box sx={{ display: "flex", gap: 1 }}>
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
      apiData={{
        Endpoint: "users",
        manualPagination: true,
        $select:
          "id,accountEnabled,businessPhones,city,createdDateTime,companyName,country,department,displayName,faxNumber,givenName,isResourceAccount,jobTitle,mail,mailNickname,mobilePhone,officeLocation,otherMails,postalCode,preferredDataLocation,preferredLanguage,proxyAddresses,showInAddressList,state,streetAddress,surname,usageLocation,userPrincipalName,userType,assignedLicenses,licenseAssignmentStates,onPremisesSyncEnabled,OnPremisesImmutableId,onPremisesLastSyncDateTime,onPremisesDistinguishedName",
        $count: true,
        $orderby: "displayName",
        $top: 999,
      }}
      apiDataKey="Results"
      actions={userActions}
      offCanvas={offCanvas}
      simpleColumns={[
        "accountEnabled",
        "userPrincipalName",
        "displayName",
        "mail",
        "businessPhones",
        "proxyAddresses",
        "assignedLicenses",
        "licenseAssignmentStates",
      ]}
      filters={filters}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
