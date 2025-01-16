import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Clear } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Risky Users";

  // Actions from the source file
  const actions = [
    {
      label: "Dismiss Risk",
      type: "GET",
      icon: <Clear />,
      url: "/api/ExecDismissRiskyUser",
      data: { userId: "id", userDisplayName: "userDisplayName" },
      confirmText: "Are you sure you want to dismiss the risk for this user?",
      multiPost: false,
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
