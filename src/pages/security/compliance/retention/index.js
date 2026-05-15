import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Book, Block, Check } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippDeployCompliancePolicyDrawer } from "../../../../components/CippComponents/CippDeployCompliancePolicyDrawer.jsx";
import { PermissionButton } from "../../../../utils/permissions.js";

const Page = () => {
  const pageTitle = "Purview Retention Policies";
  const apiUrl = "/api/ListRetentionCompliancePolicy";
  const cardButtonPermissions = ["Security.RetentionCompliancePolicy.ReadWrite"];

  const actions = [
    {
      label: "Create template based on policy",
      type: "POST",
      icon: <Book />,
      url: "/api/AddRetentionCompliancePolicyTemplate",
      data: { Identity: "Name" },
      confirmText: "Are you sure you want to create a template based on this retention policy?",
    },
    {
      label: "Enable Policy",
      type: "POST",
      icon: <Check />,
      url: "/api/EditRetentionCompliancePolicy",
      data: {
        State: "!enable",
        Identity: "Name",
      },
      confirmText: "Are you sure you want to enable this retention policy?",
      condition: (row) => row.Enabled === false,
    },
    {
      label: "Disable Policy",
      type: "POST",
      icon: <Block />,
      url: "/api/EditRetentionCompliancePolicy",
      data: {
        State: "!disable",
        Identity: "Name",
      },
      confirmText: "Are you sure you want to disable this retention policy?",
      condition: (row) => row.Enabled === true,
    },
    {
      label: "Delete Policy",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveRetentionCompliancePolicy",
      data: {
        Identity: "Name",
      },
      confirmText: "Are you sure you want to delete this retention policy?",
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "Name",
      "Comment",
      "Enabled",
      "Workload",
      "RestrictiveRetention",
      "ExchangeLocation",
      "SharePointLocation",
      "OneDriveLocation",
      "ModernGroupLocation",
      "TeamsChannelLocation",
      "TeamsChatLocation",
      "RuleCount",
      "CreatedBy",
      "WhenCreatedUTC",
      "WhenChangedUTC",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "Name",
    "Enabled",
    "Workload",
    "RuleCount",
    "RestrictiveRetention",
    "CreatedBy",
    "WhenCreatedUTC",
    "WhenChangedUTC",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      queryKey="ListRetentionCompliancePolicy"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <CippDeployCompliancePolicyDrawer
          mode="RetentionCompliancePolicy"
          requiredPermissions={cardButtonPermissions}
          PermissionButton={PermissionButton}
        />
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
