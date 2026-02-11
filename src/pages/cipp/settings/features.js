import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { TabbedLayout } from "../../../layouts/TabbedLayout";
import tabOptions from "./tabOptions";
import { CippTablePage } from "../../../components/CippComponents/CippTablePage";
import { CheckCircle, Cancel } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Features";

  const actions = [
    {
      label: "Enable Feature",
      type: "POST",
      url: "/api/ExecFeatureFlag",
      data: {
        Action: "Set",
        Id: "Id",
        Enabled: true,
      },
      confirmText: "Are you sure you want to enable this feature?",
      condition: (item) => item.AllowUserToggle && !item.Enabled,
      icon: <CheckCircle />,
    },
    {
      label: "Disable Feature",
      type: "POST",
      url: "/api/ExecFeatureFlag",
      data: {
        Action: "Set",
        Id: "Id",
        Enabled: false,
      },
      confirmText: "Are you sure you want to disable this feature?",
      condition: (item) => item.AllowUserToggle && item.Enabled,
      icon: <Cancel />,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "Name",
      "Description",
      "Enabled",
      "AllowUserToggle",
      "Timers",
      "Endpoints",
      "Pages",
    ],
    actions: actions,
  };

  const simpleColumns = ["Name", "Enabled", "Description"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListFeatureFlags"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      tenantInTitle={false}
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
