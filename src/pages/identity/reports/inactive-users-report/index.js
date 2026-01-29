import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Edit, Block } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Inactive users (6 months)";
  const apiUrl = "/api/ListInactiveAccounts";
  const actions = [
    {
      label: "View User",
      link: "/identity/administration/users/user?userId=[azureAdUserId]",
      multiPost: false,
      icon: <EyeIcon />,
      color: "success",
    },
    {
      label: "Edit User",
      link: "/identity/administration/users/user/edit?userId=[azureAdUserId]",
      icon: <Edit />,
      color: "success",
      target: "_self",
    },
    {
      label: "Block Sign In",
      type: "POST",
      icon: <Block />,
      url: "/api/ExecDisableUser",
      data: { ID: "azureAdUserId" },
      confirmText: "Are you sure you want to block the sign-in for this user?",
      multiPost: false,
    },
    {
      label: "Delete User",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveUser",
      data: { ID: "azureAdUserId" },
      confirmText: "Are you sure you want to delete this user?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "tenantDisplayName",
      "displayName",
      "userPrincipalName",
      "userType",
      "createdDateTime",
      "lastSignInDateTime",
      "lastNonInteractiveSignInDateTime",
      "numberOfAssignedLicenses",
      "lastRefreshedDateTime",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "tenantDisplayName",
    "userPrincipalName",
    "displayName",
    "lastSignInDateTime",
    "lastNonInteractiveSignInDateTime",
    "numberOfAssignedLicenses",
    "lastRefreshedDateTime",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      // apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
