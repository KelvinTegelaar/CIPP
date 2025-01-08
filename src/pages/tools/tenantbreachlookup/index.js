import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { EyeIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Potential Breaches";
  const apiUrl = "/api/ListBreachesTenant";
  const actions = [
    {
      label: "View User",
      link: "/tools/breachlookup?account=[email]",
      multiPost: false,
      icon: <EyeIcon />,
      color: "success",
    },
  ];
  return (
    <CippTablePage
      actions={actions}
      title={pageTitle}
      apiUrl={apiUrl}
      simpleColumns={["email", "password", "sources"]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
