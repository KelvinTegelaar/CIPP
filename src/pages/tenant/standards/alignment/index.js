import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Delete, Add } from "@mui/icons-material";
import { EyeIcon } from "@heroicons/react/24/outline";
import tabOptions from "../tabOptions.json";

const Page = () => {
  const pageTitle = "Standard & Drift Alignment";

  const actions = [
    {
      label: "View Tenant Report",
      link: "/tenant/manage/applied-standards/?tenantFilter=[tenantFilter]&templateId=[standardId]",
      icon: <EyeIcon />,
      color: "info",
      target: "_self",
    },
    {
      label: "Manage Drift",
      link: "/tenant/manage/drift?templateId=[standardId]&tenantFilter=[tenantFilter]",
      icon: <EyeIcon />,
      color: "info",
      target: "_self",
      condition: (row) => row.standardType === "drift",
    },
    {
      label: "Remove Drift Customization",
      type: "POST",
      url: "/api/ExecUpdateDriftDeviation",
      icon: <Delete />,
      data: {
        RemoveDriftCustomization: "true",
        tenantFilter: "tenantFilter",
      },
      confirmText:
        "Are you sure you want to remove all drift customizations? This resets the Drift Standard to the default template, and will generate alerts for the drifted items.",
      multiPost: false,
      condition: (row) => row.standardType === "drift",
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTenantAlignment"
      tenantInTitle={false}
      actions={actions}
      simpleColumns={[
        "tenantFilter",
        "standardName",
        "standardType",
        "alignmentScore",
        "LicenseMissingPercentage",
        "combinedAlignmentScore",
      ]}
      queryKey="listTenantAlignment"
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
