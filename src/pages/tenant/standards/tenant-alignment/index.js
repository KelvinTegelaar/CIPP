import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { EyeIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Tenant Alignment";

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
      queryKey="listTenantAlignment"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
