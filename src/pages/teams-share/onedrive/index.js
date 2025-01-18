import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "OneDrive";

  const actions = [
    {
      label: "Add permissions to OneDrive",
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
    {
      label: "Remove permissions from OneDrive",
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

  const offCanvas = {
    extendedInfoFields: ["UPN"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListSites?type=OneDriveUsageAccount"
      actions={actions}
      offCanvas={offCanvas}
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
