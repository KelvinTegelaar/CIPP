import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Edit, GitHub, LocalOffer, LocalOfferOutlined } from "@mui/icons-material";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { ApiGetCall } from "/src/api/ApiCall";
import { CippPolicyImportDrawer } from "/src/components/CippComponents/CippPolicyImportDrawer.jsx";
import { PermissionButton } from "/src/utils/permissions.js";

const Page = () => {
  const pageTitle = "Available Endpoint Manager Templates";
  const cardButtonPermissions = ["Endpoint.MEM.ReadWrite"];

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const actions = [
    {
      label: "Edit Template",
      link: `/endpoint/MEM/list-templates/edit?id=[GUID]`,
      icon: <Edit />,
      color: "info",
    },
    {
      label: "Edit Template Name and Description",
      type: "POST",
      url: "/api/ExecEditTemplate",
      fields: [
        {
          type: "textField",
          name: "displayName",
          label: "Display Name",
        },
        {
          type: "textField",
          name: "description",
          label: "Description",
        },
      ],
      data: { GUID: "GUID", Type: "!IntuneTemplate" },
      confirmText:
        "Enter the new name and description for the template. Warning: This will disconnect the template from a template library if applied.",
      multiPost: false,
      icon: <PencilIcon />,
      color: "info",
    },
    {
      label: "Add to package",
      type: "POST",
      url: "/api/ExecSetPackageTag",
      data: { GUID: "GUID" },
      fields: [
        {
          type: "textField",
          name: "Package",
          label: "Package Name",
          required: true,
          validators: {
            required: { value: true, message: "Package name is required" },
          },
        },
      ],
      confirmText: "Enter the package name to assign to the selected template(s).",
      multiPost: true,
      icon: <LocalOffer />,
      color: "info",
    },
    {
      label: "Remove from package",
      type: "POST",
      url: "/api/ExecSetPackageTag",
      data: { GUID: "GUID", Remove: true },
      confirmText: "Are you sure you want to remove the selected template(s) from their package?",
      multiPost: true,
      icon: <LocalOfferOutlined />,
      color: "warning",
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
      url: "/api/RemoveIntuneTemplate",
      data: { ID: "GUID" },
      confirmText: "Do you want to delete the template?",
      multiPost: false,
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    children: (row) => <CippJsonView object={row} type={"intune"} defaultOpen={true} />,
    size: "lg",
  };

  const simpleColumns = ["displayName", "package", "description", "Type"];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListIntuneTemplates?View=true"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        queryKey="ListIntuneTemplates-table"
        cardButton={
          <CippPolicyImportDrawer
            buttonText="Browse Catalog"
            requiredPermissions={cardButtonPermissions}
            PermissionButton={PermissionButton}
            mode="Intune"
          />
        }
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
