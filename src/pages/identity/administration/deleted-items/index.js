import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { RestoreFromTrash, Warning } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Deleted Items";

  const actions = [
    {
      label: "Restore Object",
      type: "POST",
      icon: <RestoreFromTrash />,
      url: "/api/ExecRestoreDeleted",
      data: { ID: "id", userPrincipalName: "userPrincipalName", displayName: "displayName" },
      confirmText: "Are you sure you want to restore this object?",
      multiPost: false,
    },
    {
      label: "Permanently Delete Object",
      type: "POST",
      icon: <Warning />,
      url: "/api/RemoveDeletedObject",
      data: { ID: "id", userPrincipalName: "userPrincipalName", displayName: "displayName" },
      confirmText:
        "Are you sure you want to permanently delete this object? This action cannot be undone.",
      multiPost: false,
    },
  ];

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
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={columns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
