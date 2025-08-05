import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { GlobeAltIcon, TrashIcon, UserIcon } from "@heroicons/react/24/outline";
import { Add, LaptopMac } from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Applications";

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
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListApps"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button component={Link} href="/endpoint/applications/list/add" startIcon={<Add />}>
            Add Application
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
