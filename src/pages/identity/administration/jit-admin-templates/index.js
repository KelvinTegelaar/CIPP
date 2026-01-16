import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { AddBox, Delete, GitHub, Edit } from "@mui/icons-material";
import Link from "next/link";
import { ApiGetCall } from "/src/api/ApiCall";
import { CippPropertyListCard } from "../../../../components/CippCards/CippPropertyListCard";
import { getCippTranslation } from "../../../../utils/get-cipp-translation";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { useSettings } from "../../../../hooks/use-settings";

const Page = () => {
  const pageTitle = "JIT Admin Templates";
  const tenantFilter = useSettings()?.currentTenant;
  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const actions = [
    {
      label: "Edit Template",
      icon: <Edit />,
      link: "/identity/administration/jit-admin-templates/edit?id=[GUID]",
    },
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
      url: "/api/RemoveJITAdminTemplate",
      icon: <Delete />,
      data: {
        ID: "GUID",
      },
      confirmText: "Do you want to delete the template?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    children: (data) => {
      const keys = Object.keys(data).filter(
        (key) => !key.includes("@odata") && !key.includes("@data")
      );
      const properties = [];
      keys.forEach((key) => {
        if (data[key] && data[key].length > 0) {
          properties.push({
            label: getCippTranslation(key),
            value: getCippFormatting(data[key], key),
          });
        }
      });
      return (
        <CippPropertyListCard
          cardSx={{ p: 0, m: -2 }}
          title="Template Details"
          propertyItems={properties}
          actionItems={actions}
          data={data}
        />
      );
    },
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListJITAdminTemplates"
      queryKey={`ListJITAdminTemplates-${tenantFilter}`}
      tenantInTitle={false}
      actions={actions}
      cardButton={
        <Button component={Link} href="jit-admin-templates/add" startIcon={<AddBox />}>
          Add JIT Admin Template
        </Button>
      }
      offCanvas={offCanvas}
      simpleColumns={[
        "templateName",
        "defaultForTenant",
        "tenantFilter",
        "defaultDuration.label",
        "defaultRoles",
        "generateTAPByDefault",
        "defaultExpireAction.label",
        "defaultNotificationActions",
        "reasonTemplate"
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
