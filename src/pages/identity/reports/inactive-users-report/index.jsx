import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippIcons } from "../../../../utils/icon-registry"
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";
import { useRouter } from "next/router";

const Page = () => {
  const pageTitle = "Inactive users (6 months)";
  const router = useRouter();

  const reportDB = useCippReportDB({
    apiUrl: "/api/ListInactiveAccounts",
    queryKey: "inactive-users",
    cacheName: "Users",
    syncTitle: "Sync User Cache",
    allowToggle: false,
    defaultCached: true,
    cacheColumns: ["lastRefreshedDateTime"],
    serverPagination: true,
  });

  const actions = [
    {
      label: "View User",
      link: "/identity/administration/users/user?userId=[azureAdUserId]&tenantFilter=[tenantId]",
      pinned: true,
      multiPost: false,
      icon: <CippIcons.EyeIcon />,
      color: "success",
    },
    {
      label: "Edit User",
      link: "/identity/administration/users/user/edit?userId=[azureAdUserId]&tenantFilter=[tenantId]",
      pinned: true,
      icon: <CippIcons.Edit />,
      color: "success",
      target: "_self",
    },
    {
      label: "Block Sign In",
      type: "POST",
      icon: <CippIcons.Block />,
      url: "/api/ExecDisableUser",
      data: { ID: "azureAdUserId" },
      confirmText: "Are you sure you want to block the sign-in for this user?",
      multiPost: false,
      condition: (row) => row.accountEnabled !== false,
    },
    {
      label: "Offboard User",
      icon: <CippIcons.PersonOff />,
      multiPost: true,
      noConfirm: true,
      customFunction: (rows) => {
        const users = Array.isArray(rows) ? rows : [rows];
        const tenants = [...new Set(users.map((user) => user.tenantId))];
        if (tenants.length > 1) {
          alert("The offboarding wizard runs for one tenant at a time. Select users from a single tenant.");
          return;
        }
        router.push({
          pathname: "/identity/administration/offboarding-wizard",
          query: {
            tenantFilter: tenants[0],
            users: users.map((user) => user.userPrincipalName).join(","),
          },
        });
      },
    },
    {
      label: "Delete User",
      type: "POST",
      icon: <CippIcons.Delete />,
      url: "/api/RemoveUser",
      data: { ID: "azureAdUserId" },
      confirmText: "Are you sure you want to delete this user?",
      multiPost: false,
    },
  ];

  const filters = [
    {
      filterName: "Sign-in allowed",
      value: [{ id: "accountEnabled", value: "Yes" }],
      type: "column",
    },
    {
      filterName: "Sign-in blocked",
      value: [{ id: "accountEnabled", value: "No" }],
      type: "column",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "tenantDisplayName",
      "displayName",
      "userPrincipalName",
      "accountEnabled",
      "userType",
      "createdDateTime",
      "lastSignInDateTime",
      "lastNonInteractiveSignInDateTime",
      "lastSuccessfulSignInDateTime",
      "numberOfAssignedLicenses",
      "daysSinceLastSignIn",
      "lastRefreshedDateTime",
    ],
    actions: actions,
  };

  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === "Tenant"),
    "tenantDisplayName",
    "userPrincipalName",
    "displayName",
    "accountEnabled",
    "lastSignInDateTime",
    "lastNonInteractiveSignInDateTime",
    "lastSuccessfulSignInDateTime",
    "numberOfAssignedLicenses",
    "daysSinceLastSignIn",
    ...reportDB.cacheColumns.filter((c) => c !== "Tenant"),
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        offCanvas={offCanvas}
        rowOpen={{
          link: '/identity/administration/users/user?userId=[azureAdUserId]&tenantFilter=[tenantId]',
          condition: (row) => Boolean(row?.azureAdUserId),
        }}
        simpleColumns={simpleColumns}
        filters={filters}
        dataSourceControls={reportDB.controls}
      />
      {reportDB.syncDialog}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout tenantGroupSupport={true}>{page}</DashboardLayout>;

export default Page;
