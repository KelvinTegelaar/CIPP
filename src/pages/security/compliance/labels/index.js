import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Book } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippDeployCompliancePolicyDrawer } from "../../../../components/CippComponents/CippDeployCompliancePolicyDrawer.jsx";
import { PermissionButton } from "../../../../utils/permissions.js";

const Page = () => {
  const pageTitle = "Sensitivity Labels";
  const apiUrl = "/api/ListSensitivityLabel";
  const cardButtonPermissions = ["Security.SensitivityLabel.ReadWrite"];

  const actions = [
    {
      label: "Create template based on label",
      type: "POST",
      icon: <Book />,
      url: "/api/AddSensitivityLabelTemplate",
      dataFunction: (data) => {
        return { ...data };
      },
      confirmText: "Are you sure you want to create a template based on this sensitivity label?",
    },
    {
      label: "Delete Label",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveSensitivityLabel",
      data: {
        Identity: "Guid",
      },
      confirmText:
        "Are you sure you want to delete this sensitivity label? Labels currently published to users will be removed from policies.",
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "DisplayName",
      "Name",
      "Comment",
      "Tooltip",
      "ParentId",
      "ContentType",
      "EncryptionEnabled",
      "EncryptionProtectionType",
      "ContentMarkingHeaderEnabled",
      "ContentMarkingFooterEnabled",
      "ContentMarkingWatermarkEnabled",
      "SiteAndGroupProtectionEnabled",
      "Priority",
      "Disabled",
      "PublishedInPolicies",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "DisplayName",
    "Name",
    "ContentType",
    "EncryptionEnabled",
    "ContentMarkingHeaderEnabled",
    "ContentMarkingWatermarkEnabled",
    "SiteAndGroupProtectionEnabled",
    "Priority",
    "Disabled",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      queryKey="ListSensitivityLabel"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <CippDeployCompliancePolicyDrawer
          mode="SensitivityLabel"
          requiredPermissions={cardButtonPermissions}
          PermissionButton={PermissionButton}
        />
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
