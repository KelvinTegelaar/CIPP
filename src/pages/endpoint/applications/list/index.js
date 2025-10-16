import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog.jsx";
import { GlobeAltIcon, TrashIcon, UserIcon } from "@heroicons/react/24/outline";
import { LaptopMac, Sync } from "@mui/icons-material";
import { CippApplicationDeployDrawer } from "/src/components/CippComponents/CippApplicationDeployDrawer";
import { Button, Box } from "@mui/material";
import { useSettings } from "/src/hooks/use-settings.js";
import { useDialog } from "/src/hooks/use-dialog.js";

const Page = () => {
  const pageTitle = "Applications";
  const syncDialog = useDialog();
  const tenant = useSettings().currentTenant;

  const actions = [
    {
      label: "Assign to All Users",
      type: "POST",
      url: "/api/ExecAssignApp",
      data: {
        AssignTo: "!AllUsers",
        ID: "id",
      },
      confirmText: "Are you sure you want to assign this app to all users?",
      icon: <UserIcon />,
      color: "info",
    },
    {
      label: "Assign to All Devices",
      type: "POST",
      url: "/api/ExecAssignApp",
      data: {
        AssignTo: "!AllDevices",
        ID: "id",
      },
      confirmText: "Are you sure you want to assign this app to all devices?",
      icon: <LaptopMac />,
      color: "info",
    },
    {
      label: "Assign Globally (All Users / All Devices)",
      type: "POST",
      url: "/api/ExecAssignApp",
      data: {
        AssignTo: "!Both",
        ID: "id",
      },
      confirmText: "Are you sure you want to assign this app to all users and devices?",
      icon: <GlobeAltIcon />,
      color: "info",
    },
    {
      label: "Delete Application",
      type: "POST",
      url: "/api/RemoveApp",
      data: {
        ID: "id",
      },
      confirmText: "Are you sure you want to delete this application?",
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "installExperience.runAsAccount",
      "installExperience.deviceRestartBehavior",
      "isAssigned",
      "createdDateTime",
      "lastModifiedDateTime",
      "isFeatured",
      "publishingState",
      "dependentAppCount",
      "rules.0.ruleType",
      "rules.0.fileOrFolderName",
      "rules.0.path",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "publishingState",
    "installCommandLine",
    "uninstallCommandLine",
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListApps"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        cardButton={
          <Box sx={{ display: "flex", gap: 1 }}>
            <CippApplicationDeployDrawer />
            <Button onClick={syncDialog.handleOpen} startIcon={<Sync />}>
              Sync VPP
            </Button>
          </Box>
        }
      />
      <CippApiDialog
        title="Sync VPP Tokens"
        createDialog={syncDialog}
        api={{
          type: "POST",
          url: "/api/ExecSyncVPP",
          data: {},
          confirmText: `Are you sure you want to sync Apple Volume Purchase Program (VPP) tokens? This will sync all VPP tokens for ${tenant}.`,
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
