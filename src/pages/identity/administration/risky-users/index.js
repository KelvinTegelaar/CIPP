import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Clear, Search } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Risky Users";

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
    {
      label: "Research Compromised Account",
      type: "GET",
      icon: <Search />,
      link: "/identity/administration/users/user/bec?userId=[id]",
      confirmText: "Are you sure you want to research this compromised account?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "id",
      "userDisplayName",
      "userPrincipalName",
      "riskLastUpdatedDateTime",
      "riskLevel",
      "riskState",
      "riskDetail",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "userDisplayName",
    "userPrincipalName",
    "riskLevel",
    "riskState",
    "riskDetail",
    "riskLastUpdatedDateTime",
  ];

  const filterList = [
    {
      filterName: "Users at Risk",
      value: [{ id: "riskState", value: "atRisk" }],
      type: "column",
    },
    {
      filterName: "Dismissed Users",
      value: [{ id: "riskState", value: "dismissed" }],
      type: "column",
    },
    {
      filterName: "Remediated Users",
      value: [{ id: "riskState", value: "remediated" }],
      type: "column",
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "identityProtection/riskyUsers",
        manualPagination: true,
        $count: true,
        $orderby: "riskLastUpdatedDateTime desc",
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
