import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Risk Detection Report";
  const apiUrl = "/api/ListGraphRequest";

  const actions = [
    {
      label: "Research Compromised Account",
      link: "/identity/administration/users/user/bec?userId=[userId]&tenantFilter=[Tenant]",
      color: "info",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "userId",
      "userDisplayName",
      "userPrincipalName",
      "detectedDateTime",
      "location.city",
      "location.countryOrRegion",
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
    "location.city",
    "location.countryOrRegion",
    "ipAddress",
    "riskState",
    "riskDetail",
    "riskLevel",
    "riskType",
    "riskEventType",
    "detectionTimingType",
    "activity",
  ];

  // Note to Developer: Add necessary filter logic here
  // Filters previously defined:
  /*
    filterlist: [
      { filterName: 'State: atRisk', filter: 'Complex: riskState eq atRisk' },
      { filterName: 'State: confirmedCompromised', filter: 'Complex: riskState eq confirmedCompromised' },
      { filterName: 'State: confirmedSafe', filter: 'Complex: riskState eq confirmedSafe' },
      { filterName: 'State: dismissed', filter: 'Complex: riskState eq dismissed' },
      { filterName: 'State: remediated', filter: 'Complex: riskState eq remediated' },
      { filterName: 'State: unknownFutureValue', filter: 'Complex: riskState eq unknownFutureValue' },
    ]
  */

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
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
