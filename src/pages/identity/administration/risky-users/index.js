import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Risky Users";

  // Actions from the source file
  const actions = [
    {
      label: "Dismiss Risk",
      color: "info",
      modal: true,
      modalUrl: `/api/ExecDismissRiskyUser?TenantFilter=Tenant&userid=!id&userDisplayName=!userDisplayName`,
    },
  ];

  // OffCanvas details based on the source file
  const offCanvas = {
    extendedInfoFields: [
      "id", // User ID
      "userDisplayName", // Display Name
      "userPrincipalName", // User Principal
      "riskLastUpdatedDateTime", // Risk Last Updated
      "riskLevel", // Risk Level
      "riskState", // Risk State
      "riskDetail", // Risk Detail
    ],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "identityProtection/riskyUsers",
        manualPagination: true,
        $select:
          "id,userDisplayName,userPrincipalName,riskLevel,riskState,riskDetail,riskLastUpdatedDateTime",
        $count: true,
        $orderby: "riskLastUpdatedDateTime desc",
        $top: 500,
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "id",
        "userDisplayName",
        "userPrincipalName",
        "riskLevel",
        "riskState",
        "riskDetail",
        "riskLastUpdatedDateTime",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
