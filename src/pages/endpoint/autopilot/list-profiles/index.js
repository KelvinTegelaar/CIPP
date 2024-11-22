import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { EyeIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Autopilot Profiles";

  const actions = [
    {
      label: "View JSON",
      icon: <EyeIcon />,
      color: "success",
      offCanvas: true,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "Description",
      "language",
      "extractHardwareHash",
      "deviceNameTemplate",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "Description",
    "language",
    "extractHardwareHash",
    "deviceNameTemplate",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListAutopilotConfig?type=ApProfile"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
