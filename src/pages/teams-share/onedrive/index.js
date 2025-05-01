import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { PersonAdd, PersonRemove } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "OneDrive";

  const actions = [
    {
      label: "Add permissions to OneDrive",
      icon: <PersonAdd />,
      type: "POST",
      url: "/api/ExecSharePointPerms",
      data: {
        UPN: "ownerPrincipalName",
        URL: "webUrl",
        RemovePermission: false,
      },
      confirmText: "Select the User to add to this user's OneDrive permissions",
      fields: [
        {
          type: "autoComplete",
          name: "onedriveAccessUser",
          label: "Select User",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/ListGraphRequest",
            data: {
              Endpoint: "users",
              $select: "id,displayName,userPrincipalName",
              $top: 999,
              $count: true,
            },
            queryKey: "ListUsersAutoComplete",
            dataKey: "Results",
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: "userPrincipalName",
            addedField: {
              id: "id",
            },
            showRefresh: true,
          },
        },
      ],
    },
    {
      label: "Remove permissions from OneDrive",
      icon: <PersonRemove />,
      type: "POST",
      url: "/api/ExecSharePointPerms",
      data: {
        UPN: "ownerPrincipalName",
        URL: "webUrl",
        RemovePermission: true,
      },
      confirmText: "Select the User to remove from this user's OneDrive permissions",
      fields: [
        {
          type: "autoComplete",
          name: "onedriveAccessUser",
          label: "Select User",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/listUsers",
            labelField: (onedriveAccessUser) =>
              `${onedriveAccessUser.displayName} (${onedriveAccessUser.userPrincipalName})`,
            valueField: "userPrincipalName",
            addedField: {
              displayName: "displayName",
            },
          },
        },
      ],
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListSites?type=OneDriveUsageAccount"
      actions={actions}
      simpleColumns={[
        "displayName",
        "createdDateTime",
        "ownerPrincipalName",
        "lastActivityDate",
        "fileCount",
        "storageUsedInGigabytes",
        "storageAllocatedInGigabytes",
        "reportRefreshDate",
        "webUrl",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
