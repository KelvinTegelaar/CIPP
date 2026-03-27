import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { CippTablePage } from "../../../components/CippComponents/CippTablePage.jsx";
import { Alert, Button, SvgIcon, Typography } from "@mui/material";
import {
  Add,
  ToggleOn,
  ToggleOff,
  NotificationsActive,
  NotificationsOff,
} from "@mui/icons-material";
import { TrashIcon, PencilIcon, ClockIcon } from "@heroicons/react/24/outline";
import NextLink from "next/link";

const Page = () => {
  const pageTitle = "Custom PowerShell Scripts";
  const simpleColumns = [
    "ScriptName",
    "Description",
    "Enabled",
    "AlertOnFailure",
    "ReturnType",
    "Category",
    "Pillar",
    "Risk",
    "UserImpact",
    "ImplementationEffort",
    "Version",
    "CreatedBy",
    "CreatedDate",
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        queryKey="Custom PowerShell Scripts"
        cardButton={
          <Button
            variant="contained"
            color="primary"
            size="small"
            component={NextLink}
            href="/cipp/custom-scripts/add"
          >
            <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
              <Add />
            </SvgIcon>
            Add Script
          </Button>
        }
        tenantInTitle={false}
        apiUrl="/api/ListCustomScripts"
        simpleColumns={simpleColumns}
        actions={[
          {
            label: "Edit Script",
            icon: <PencilIcon />,
            link: "/cipp/custom-scripts/add?ScriptGuid=[ScriptGuid]",
          },
          {
            label: "View Versions",
            icon: <ClockIcon />,
            link: "/cipp/custom-scripts/versions?ScriptGuid=[ScriptGuid]",
          },
          {
            label: "Enable Script",
            icon: <ToggleOn />,
            type: "POST",
            url: "/api/AddCustomScript",
            multiPost: false,
            data: {
              ScriptGuid: "ScriptGuid",
              Action: "!EnableScript",
            },
            condition: (row) => row.Enabled !== true,
            confirmText: "Enable script '[ScriptName]'?",
          },
          {
            label: "Disable Script",
            icon: <ToggleOff />,
            type: "POST",
            url: "/api/AddCustomScript",
            multiPost: false,
            data: {
              ScriptGuid: "ScriptGuid",
              Action: "!DisableScript",
            },
            condition: (row) => row.Enabled === true,
            confirmText: "Disable script '[ScriptName]'?",
          },
          {
            label: "Enable Alerts",
            icon: <NotificationsActive />,
            type: "POST",
            url: "/api/AddCustomScript",
            multiPost: false,
            data: {
              ScriptGuid: "ScriptGuid",
              Action: "!EnableAlerts",
            },
            condition: (row) => row.AlertOnFailure !== true,
            confirmText: "Enable alerts for '[ScriptName]'?",
          },
          {
            label: "Disable Alerts",
            icon: <NotificationsOff />,
            type: "POST",
            url: "/api/AddCustomScript",
            multiPost: false,
            data: {
              ScriptGuid: "ScriptGuid",
              Action: "!DisableAlerts",
            },
            condition: (row) => row.AlertOnFailure === true,
            confirmText: "Disable alerts for '[ScriptName]'?",
          },
          {
            label: "Delete Script",
            icon: <TrashIcon />,
            url: "/api/RemoveCustomScript",
            type: "GET",
            data: {
              ScriptGuid: "ScriptGuid",
            },
            confirmText:
              "Are you sure you want to delete the script '[ScriptName]'? This will permanently delete ALL versions of this script.",
          },
        ]}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
