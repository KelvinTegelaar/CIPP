import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Deleted Items";

  // Actions formatted based on your request
  const actions = [
    {
      label: "Restore Object",
      type: "POST",
      url: "/api/ExecRestoreDeleted",
      data: { TenantFilter: "Tenant", ID: "id" },
      confirmText: "Are you sure you want to restore this user?",
      multiPost: false,
    },
  ];

  // Offcanvas extended info fields
  const offCanvas = {
    extendedInfoFields: [
      "createdDateTime", // Created on
      "userPrincipalName", // UPN
      "givenName", // Given Name
      "surname", // Surname
      "jobTitle", // Job Title
      "LicJoined", // Licenses
      "businessPhones", // Business Phone
      "mobilePhone", // Mobile Phone
      "mail", // Mail
      "city", // City
      "department", // Department
      "onPremisesLastSyncDateTime", // OnPrem Last Sync
      "id", // Unique ID
    ],
    actions: actions,
  };

  // Columns for the table
  const columns = [
    "displayName", // Display Name
    "TargetType", // Type
    "userPrincipalName", // User Principal Name
    "deletedDateTime", // Deleted on
    "onPremisesSyncEnabled", // AD Synced
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListDeletedItems"
      apiData={{
        Endpoint: "deletedItems",
        manualPagination: true,
        $select:
          "id,displayName,TargetType,userPrincipalName,deletedDateTime,onPremisesSyncEnabled,createdDateTime,givenName,surname,jobTitle,LicJoined,businessPhones,mobilePhone,mail,city,department,onPremisesLastSyncDateTime",
        $count: true,
        $orderby: "deletedDateTime desc",
        $top: 500,
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={columns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
