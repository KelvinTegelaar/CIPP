import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Code, TrashIcon } from "@heroicons/react/24/outline";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import tabOptions from "./tabOptions";

const Page = () => {
  const pageTitle = "MacOS Scripts";

  const actions = [
    {
      label: "Delete Script",
      type: "POST",
      url: "/api/RemoveIntuneScript",
      data: {
        ID: "id",
        displayName: "displayName",
        ScriptType: "!macOS",
      },
      confirmText: "Are you sure you want to delete this script?",
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "id",
      "fileName",
      "displayName",
      "description",
      "lastModifiedDateTime",
      "createdDateTime",
      "retryCount",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "description",
    "runAsAccount",
    "executionFrequency",
    "enforceSignatureCheck",
    "lastModifiedDateTime",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "deviceManagement/deviceShellScripts",
        $orderby: "displayName",
        manualPagination: true,
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);
export default Page;
