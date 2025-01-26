import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "SharePoint Sites";

  const actions = [
    {
      label: "Add Member",
      type: "POST",
      url: "/api/ExecSetSharePointMember",
      data: {
        groupId: "ownerPrincipalName",
        add: true,
        URL: "webUrl",
        SharePointType: "rootWebTemplate",
      },
      confirmText: "Select the User to add as a member.",
      fields: [
        {
          type: "autoComplete",
          name: "user",
          label: "Select User",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/listUsers",
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: "userPrincipalName",
            addedField: {
              id: "id",
            },
          },
        },
      ],
      multiPost: false,
    },
    {
      label: "Remove Member",
      type: "POST",
      url: "/api/ExecSetSharePointMember",
      data: {
        groupId: "ownerPrincipalName",
        add: false,
        URL: "URL",
        SharePointType: "rootWebTemplate",
      },
      confirmText: "Select the User to remove as a member.",
      fields: [
        {
          type: "autoComplete",
          name: "user",
          label: "Select User",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/listUsers",
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: "userPrincipalName",
            addedField: {
              id: "id",
            },
          },
        },
      ],
      multiPost: false,
    },
    {
      label: "Add Site Admin",
      type: "POST",
      url: "/api/ExecSharePointPerms",
      data: {
        UPN: "ownerPrincipalName",
        RemovePermission: false,
        URL: "webUrl",
      },
      confirmText: "Select the User to add to the Site Admins permissions",
      fields: [
        {
          type: "autoComplete",
          name: "user",
          label: "Select User",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/listUsers",
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: "userPrincipalName",
            addedField: {
              id: "id",
            },
          },
        },
      ],
      multiPost: false,
    },
    {
      label: "Remove Site Admin",
      type: "POST",
      url: "/api/ExecSharePointPerms",
      data: {
        UPN: "ownerPrincipalName",
        RemovePermission: true,
        URL: "webUrl",
      },
      confirmText: "Select the User to remove from the Site Admins permissions",
      fields: [
        {
          type: "autoComplete",
          name: "user",
          label: "Select User",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/listUsers",
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: "userPrincipalName",
            addedFields: {
              id: "id",
            },
          },
        },
      ],
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["displayName", "description", "webUrl"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListSites?type=SharePointSiteUsage"
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
      cardButton={
        <>
          <Button component={Link} href="/teams-share/sharepoint/add-site">
            Add Site
          </Button>
          <Button component={Link} href="/teams-share/sharepoint/bulk-add-site">
            Bulk Add Sites
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
