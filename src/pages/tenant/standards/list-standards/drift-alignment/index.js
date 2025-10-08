import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { EyeIcon } from "@heroicons/react/24/outline";
import tabOptions from "../tabOptions.json";

const Page = () => {
  const pageTitle = "Drift Alignment";

  const actions = [
    {
      label: "View Tenant Report",
      link: "/tenant/manage/applied-standards/?tenantFilter=[tenantFilter]&templateId=[standardId]",
      icon: <EyeIcon />,
      color: "info",
      target: "_self",
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
        "alignmentScore",
        "LicenseMissingPercentage",
        "combinedAlignmentScore",
      ]}
      queryKey="listDriftAlignment"
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
