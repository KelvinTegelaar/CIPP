import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Risk Detection Report";
  const apiUrl = "/api/ListGraphRequest";

  const actions = [
    {
      label: "Research Compromised Account",
      type: "GET",
      icon: <MagnifyingGlassIcon />,
      link: "/identity/administration/users/user/bec?userId=[userId]",
      confirmText: "Are you sure you want to research this compromised account?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "userId",
      "userDisplayName",
      "userPrincipalName",
      "detectedDateTime",
      "location",
      "ipAddress",
      "riskLevel",
      "riskState",
      "riskDetail",
      "riskEventType",
      "detectionTimingType",
      "activity",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "detectedDateTime",
    "userPrincipalName",
    "location",
    "ipAddress",
    "riskState",
    "riskDetail",
    "riskLevel",
    "riskType",
    "riskEventType",
    "detectionTimingType",
    "activity",
  ];

  const filterList = [
    {
      filterName: "Users at Risk",
      value: [{ id: "riskState", value: "atRisk" }],
      type: "column",
    },
    {
      filterName: "Confirmed Compromised",
      value: [{ id: "riskState", value: "confirmedCompromised" }],
      type: "column",
    },
    {
      filterName: "Confirmed Safe",
      value: [{ id: "riskState", value: "confirmedSafe" }],
      type: "column",
    },
    {
      filterName: "Remediated",
      value: [{ id: "riskState", value: "remediated" }],
      type: "column",
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiData={{
        Endpoint: "identityProtection/riskDetections",
        manualPagination: true,
        $count: true,
        $orderby: "detectedDateTime desc",
        $top: 500,
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      filters={filterList}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
