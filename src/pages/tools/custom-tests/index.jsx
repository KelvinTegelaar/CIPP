import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { CippTablePage } from "../../../components/CippComponents/CippTablePage.jsx";
import { Button, SvgIcon, Stack } from "@mui/material";
import {
  Add,
  ToggleOn,
  ToggleOff,
  NotificationsActive,
  NotificationsOff,
  GitHub,
} from "@mui/icons-material";
import { TrashIcon, PencilIcon, ClockIcon } from "@heroicons/react/24/outline";
import NextLink from "next/link";
import { ApiGetCall } from "../../../api/ApiCall";
import { CippPolicyImportDrawer } from "../../../components/CippComponents/CippPolicyImportDrawer.jsx";

const Page = () => {
  const pageTitle = "Custom Tests";

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const simpleColumns = [
    "ScriptName",
    "Description",
    "Enabled",
    "AlertOnFailure",
    "ResultMode",
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
    <CippTablePage
      title={pageTitle}
      queryKey="Custom Tests"
      cardButton={
        <Stack direction="row" spacing={1}>
          <CippPolicyImportDrawer mode="CustomTest" buttonText="Import from GitHub" />
          <Button
            variant="contained"
            color="primary"
            size="small"
            component={NextLink}
            href="/tools/custom-tests/add"
          >
            <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
              <Add />
            </SvgIcon>
            Add Test
          </Button>
        </Stack>
      }
      tenantInTitle={false}
      apiUrl="/api/ListCustomScripts"
      simpleColumns={simpleColumns}
      actions={[
        {
          label: "Edit Test",
          icon: <PencilIcon />,
          link: "/tools/custom-tests/add?ScriptGuid=[ScriptGuid]",
        },
        {
          label: "View Versions",
          icon: <ClockIcon />,
          link: "/tools/custom-tests/versions?ScriptGuid=[ScriptGuid]",
        },
        {
          label: "Enable Test",
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
          label: "Disable Test",
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
          label: "Delete Test",
          icon: <TrashIcon />,
          url: "/api/RemoveCustomScript",
          type: "POST",
          relatedquerykeys: ["ListAvailableTests"],
          data: {
            ScriptGuid: "ScriptGuid",
          },
          confirmText:
            "Are you sure you want to delete the test '[ScriptName]'? This will permanently delete ALL versions of this script.",
        },
        {
          label: "Save to GitHub",
          type: "POST",
          url: "/api/ExecCommunityRepo",
          icon: <GitHub />,
          data: {
            Action: "UploadScript",
            GUID: "ScriptGuid",
          },
          fields: [
            {
              label: "Repository",
              name: "FullName",
              type: "select",
              api: {
                url: "/api/ListCommunityRepos",
                data: { WriteAccess: true },
                queryKey: "CommunityRepos-Write",
                dataKey: "Results",
                valueField: "FullName",
                labelField: "FullName",
              },
              multiple: false,
              creatable: false,
              required: true,
              validators: {
                required: { value: true, message: "This field is required" },
              },
            },
            {
              label: "Commit Message",
              placeholder: "Enter a commit message for adding this script to GitHub",
              name: "Message",
              type: "textField",
              multiline: true,
              required: true,
              rows: 4,
            },
          ],
          confirmText: "Are you sure you want to save '[ScriptName]' to the selected repository?",
          condition: () => integrations.isSuccess && integrations?.data?.GitHub?.Enabled,
        },
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
