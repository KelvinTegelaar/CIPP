import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Code, TrashIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Scripts";

  const actions = [
    {
      label: "Delete Script",
      type: "POST",
      url: "/api/RemoveIntuneScript",
      data: {
        ID: "id",
        displayName: "displayName",
        ScriptType: "scriptType",
      },
      confirmText: "Are you sure you want to delete this script?",
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "scriptType",
      "id",
      "fileName",
      "displayName",
      "description",
      "lastModifiedDateTime",
      "runAsAccount",
      "createdDateTime",
      "runAs32Bit",
      "executionFrequency",
      "enforceSignatureCheck",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "scriptType",
    "displayName",
    "description",
    "runAsAccount",
    "lastModifiedDateTime",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListIntuneScript"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
