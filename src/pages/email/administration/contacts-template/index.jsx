import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { Button } from "@mui/material";
import Link from "next/link";
import { RocketLaunch } from "@mui/icons-material";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { TrashIcon } from "@heroicons/react/24/outline";
import { GitHub, Edit } from "@mui/icons-material";
import { ApiGetCall } from "../../../../api/ApiCall";
import { CippDeployContactTemplateDrawer } from "../../../../components/CippComponents/CippDeployContactTemplateDrawer";

const Page = () => {
  const pageTitle = "Contact Templates";
  const cardButtonPermissions = ["Exchange.Contact.ReadWrite"];
  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const actions = [
    {
      label: "Save to GitHub",
      type: "POST",
      url: "/api/ExecCommunityRepo",
      icon: <GitHub />,
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
      url: "/api/RemoveContactTemplates",
      data: {
        ID: "GUID",
      },
      confirmText: "Do you want to delete the template?",
      icon: <TrashIcon />,
      color: "danger",
    },
    {
      label: "Edit Contact Template",
      link: "/email/administration/contacts-template/edit?id=[GUID]",
      icon: <Edit />,
      color: "success",
      target: "_self",
    },
  ];
  const simpleColumns = ["name", "contactTemplateName", "GUID"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListContactTemplates"
      queryKey="Contact Templates"
      actions={actions}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <CippDeployContactTemplateDrawer permissions={cardButtonPermissions} />
          <Button
            component={Link}
            href="/email/administration/contacts-template/add"
            startIcon={<RocketLaunch />}
          >
            New Contact Template
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
