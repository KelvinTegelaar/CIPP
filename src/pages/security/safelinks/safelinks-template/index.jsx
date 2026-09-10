import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippIcons } from "../../../../utils/icon-registry"
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";
import { ApiGetCall } from "../../../../api/ApiCall";

const Page = () => {
  const pageTitle = "Safe Links Policy Templates";

  // Check if GitHub integration is enabled
  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const actions = [
    {
      label: "Edit Template",
      link: "/security/safelinks/safelinks-template/edit?ID=[GUID]",
      pinned: true,
      icon: <CippIcons.Edit />,
      color: "success",
      target: "_self",
    },
    {
      label: "Save to GitHub",
      type: "POST",
      url: "/api/ExecCommunityRepo",
      icon: <CippIcons.GitHub />,
      data: {
        Action: "UploadTemplate",
        GUID: "GUID",
      },
      fields: [
        {
          label: "Repository",
          name: "FullName",
          type: "select",
          api: {
            url: "/api/ListCommunityRepos",
            data: {
              WriteAccess: true,
            },
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
          placeholder: "Enter a commit message for adding this file to GitHub",
          name: "Message",
          type: "textField",
          multiline: true,
          required: true,
          rows: 4,
        },
      ],
      confirmText: "Are you sure you want to save this template to the selected repository?",
      condition: () => integrations.isSuccess && integrations?.data?.GitHub?.Enabled,
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveSafeLinksPolicyTemplate",
      data: { ID: "GUID" },
      confirmText: "Do you want to delete the template?",
      icon: <CippIcons.Delete />,
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["TemplateName", "TemplateDescription", "GUID"],
    actions: actions,
  };

  const simpleColumns = ["TemplateName", "TemplateDescription", "GUID"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListSafeLinksPolicyTemplates"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button
            component={Link}
            href="/security/safelinks/safelinks-template/create"
            startIcon={<CippIcons.Add />}
            sx={{ mr: 1 }}
          >
            Create New Template
          </Button>
          <Button
            component={Link}
            href="/security/safelinks/safelinks-template/add"
            startIcon={<CippIcons.RocketLaunch />}
          >
            Deploy Template
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;