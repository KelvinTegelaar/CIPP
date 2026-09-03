import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippIcons } from "../../../../utils/icon-registry"

const Page = () => {
  const pageTitle = "Risky Users";

  const actions = [
    {
      label: "Dismiss Risk",
      type: "POST",
      icon: <CippIcons.Clear />,
      url: "/api/ExecDismissRiskyUser",
      data: { userId: "id", userDisplayName: "userDisplayName" },
      confirmText: "Are you sure you want to dismiss the risk for this user?",
      multiPost: false,
    },
    {
      label: "Research Compromised Account",
      type: "GET",
      icon: <CippIcons.MagnifyingGlassIcon />,
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
      value: [{ id: "riskState", value: "at Risk" }],
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
