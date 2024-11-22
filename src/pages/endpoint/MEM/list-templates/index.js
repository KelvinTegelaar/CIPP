import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Available Endpoint Manager Templates";

  const actions = [
    {
      label: "View Template",
      link: "/intune/templates/[id]",
      multiPost: false,
      icon: <EyeIcon />,
      color: "success",
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveIntuneTemplate",
      data: { TenantFilter: "Tenant", GUID: "id" },
      confirmText: "Do you want to delete the template?",
      multiPost: false,
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["displayName", "description", "Type"],
    actions: actions,
  };

  const simpleColumns = ["displayName", "description", "Type"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListIntuneTemplates?View=true"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
