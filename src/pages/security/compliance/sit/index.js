import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Book } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippDeployCompliancePolicyDrawer } from "../../../../components/CippComponents/CippDeployCompliancePolicyDrawer.jsx";
import { PermissionButton } from "../../../../utils/permissions.js";

const Page = () => {
  const pageTitle = "Sensitive Information Types";
  const apiUrl = "/api/ListSensitiveInfoType";
  const cardButtonPermissions = ["Security.SensitiveInfoType.ReadWrite"];

  const actions = [
    {
      label: "Create template based on SIT",
      type: "POST",
      icon: <Book />,
      url: "/api/AddSensitiveInfoTypeTemplate",
      dataFunction: (data) => {
        return { ...data };
      },
      confirmText:
        "Are you sure you want to create a template based on this Sensitive Information Type?",
    },
    {
      label: "Delete SIT",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveSensitiveInfoType",
      data: {
        Identity: "Name",
      },
      confirmText:
        "Are you sure you want to delete this Sensitive Information Type? Built-in Microsoft types cannot be deleted.",
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "Name",
      "Description",
      "Publisher",
      "Recommended",
      "RulePackId",
      "RulePackVersion",
      "State",
      "Type",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "Name",
    "Publisher",
    "Description",
    "Recommended",
    "RulePackVersion",
    "State",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <CippDeployCompliancePolicyDrawer
          mode="SensitiveInfoType"
          requiredPermissions={cardButtonPermissions}
          PermissionButton={PermissionButton}
        />
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
