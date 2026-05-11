import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Book, Block, Check } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippDeployCompliancePolicyDrawer } from "../../../../components/CippComponents/CippDeployCompliancePolicyDrawer.jsx";
import { PermissionButton } from "../../../../utils/permissions.js";

const Page = () => {
  const pageTitle = "DLP Compliance Policies";
  const apiUrl = "/api/ListDlpCompliancePolicy";
  const cardButtonPermissions = ["Security.DlpCompliancePolicy.ReadWrite"];

  const actions = [
    {
      label: "Create template based on policy",
      type: "POST",
      icon: <Book />,
      url: "/api/AddDlpCompliancePolicyTemplate",
      dataFunction: (data) => {
        return { ...data };
      },
      confirmText: "Are you sure you want to create a template based on this DLP policy?",
    },
    {
      label: "Enable Policy",
      type: "POST",
      icon: <Check />,
      url: "/api/EditDlpCompliancePolicy",
      data: {
        State: "!enable",
        Identity: "Name",
      },
      confirmText: "Are you sure you want to enable this DLP policy?",
      condition: (row) => row.Enabled === false,
    },
    {
      label: "Disable Policy",
      type: "POST",
      icon: <Block />,
      url: "/api/EditDlpCompliancePolicy",
      data: {
        State: "!disable",
        Identity: "Name",
      },
      confirmText: "Are you sure you want to disable this DLP policy?",
      condition: (row) => row.Enabled === true,
    },
    {
      label: "Delete Policy",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveDlpCompliancePolicy",
      data: {
        Identity: "Name",
      },
      confirmText: "Are you sure you want to delete this DLP policy?",
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "Name",
      "Comment",
      "Mode",
      "Enabled",
      "Workload",
      "ExchangeLocation",
      "SharePointLocation",
      "OneDriveLocation",
      "TeamsLocation",
      "EndpointDlpLocation",
      "RuleCount",
      "CreatedBy",
      "WhenCreatedUTC",
      "WhenChangedUTC",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "Name",
    "Mode",
    "Enabled",
    "Workload",
    "RuleCount",
    "CreatedBy",
    "WhenCreatedUTC",
    "WhenChangedUTC",
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
          mode="DlpCompliancePolicy"
          requiredPermissions={cardButtonPermissions}
          PermissionButton={PermissionButton}
        />
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
