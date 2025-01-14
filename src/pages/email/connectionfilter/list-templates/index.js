import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Connection filter Templates";

  const actions = [
    {
      label: "View Template",
      icon: <EyeIcon />, // Placeholder for the view icon
      color: "success",
      offCanvas: true,
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveConnectionfilterTemplate",
      data: { ID: "GUID" },
      confirmText: "Do you want to delete the template?",
      icon: <TrashIcon />, // Placeholder for the delete icon
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "name",
      "IsDefault",
      "IPAllowList",
      "IPBlockList",
      "EnableSafeList",
      "GUID",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "name",
    "IsDefault",
    "IPAllowList",
    "IPBlockList",
    "EnableSafeList",
    "GUID",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListConnectionfilterTemplates"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
