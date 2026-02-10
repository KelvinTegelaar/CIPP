import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Edit, Block, Sync, Info } from "@mui/icons-material";
import {
  Button,
  SvgIcon,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useSettings } from "../../../../hooks/use-settings";
import { useDialog } from "../../../../hooks/use-dialog";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";

const Page = () => {
  const pageTitle = "Inactive users (6 months)";
  const apiUrl = "/api/ListInactiveAccounts";
  const currentTenant = useSettings().currentTenant;
  const syncDialog = useDialog();

  const isAllTenants = currentTenant === "AllTenants";

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
      "daysSinceLastSignIn",
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
    "daysSinceLastSignIn",
    "lastRefreshedDateTime",
  ];

  const pageActions = [
    <Stack direction="row" spacing={2} alignItems="center" key="actions-stack">
      <Tooltip title="This report displays cached data from the CIPP reporting database. Cache timestamps are shown in the table. Click the Sync button to update the user cache for the current tenant.">
        <IconButton size="small">
          <Info fontSize="small" />
        </IconButton>
      </Tooltip>
      <Button
        startIcon={
          <SvgIcon fontSize="small">
            <Sync />
          </SvgIcon>
        }
        size="xs"
        onClick={syncDialog.handleOpen}
        disabled={isAllTenants}
      >
        Sync
      </Button>
    </Stack>,
  ];

  return (
    <>
      {currentTenant && currentTenant !== "" ? (
        <CippTablePage
          title={pageTitle}
          apiUrl={apiUrl}
          queryKey={["inactive-users", currentTenant]}
          actions={actions}
          offCanvas={offCanvas}
          simpleColumns={simpleColumns}
          cardButton={pageActions}
        />
      ) : (
        <Alert severity="warning">Please select a tenant to view inactive users.</Alert>
      )}
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync User Cache"
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText: `Run user cache sync for ${currentTenant}? This will update user data including sign-in activity immediately.`,
          relatedQueryKeys: ["inactive-users"],
          data: {
            Name: "Users",
          },
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
