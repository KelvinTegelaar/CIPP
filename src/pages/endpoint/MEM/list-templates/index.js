import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";

const Page = () => {
  const pageTitle = "Available Endpoint Manager Templates";

  const actions = [
    {
      label: "Delete Template",
      type: "GET",
      url: "/api/RemoveIntuneTemplate",
      data: { ID: "GUID" },
      confirmText: "Do you want to delete the template?",
      multiPost: false,
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    children: (row) => <CippJsonView object={row} type={"intune"} />,
    size: "lg",
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
