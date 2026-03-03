import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Roles";

  const actions = [];

  const offCanvas = {
    extendedInfoFields: [
      "DisplayName", // Role Group Name
      "Members", // Member Names
    ],
    actions: actions,
  };

  const columns = [
    "DisplayName", // Role Name
    "Description", // Description
    "Members", // Members
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListRoles"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={columns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
