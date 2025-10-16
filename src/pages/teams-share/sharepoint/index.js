import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import {
  Add,
  AddToPhotos,
  PersonAdd,
  PersonRemove,
  AdminPanelSettings,
  NoAccounts,
  Delete,
} from "@mui/icons-material";
import Link from "next/link";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { useSettings } from "/src/hooks/use-settings";

const Page = () => {
  const pageTitle = "SharePoint Sites";
  const tenantFilter = useSettings().currentTenant;

  const actions = [
    {
      label: "Add Member",
      type: "POST",
      icon: <PersonAdd />,
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
      multiPost: false,
    },
    {
      label: "Remove Member",
      type: "POST",
      icon: <PersonRemove />,
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
      multiPost: false,
    },
    {
      label: "Add Site Admin",
      type: "POST",
      icon: <AdminPanelSettings />,
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
      multiPost: false,
    },
    {
      label: "Remove Site Admin",
      type: "POST",
      icon: <NoAccounts />,
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
      multiPost: false,
    },
    {
      label: "Delete Site",
      type: "POST",
      icon: <Delete />,
      url: "/api/DeleteSharepointSite",
      data: {
        SiteId: "siteId",
      },
      confirmText: "Are you sure you want to delete this SharePoint site? This action cannot be undone.",
      color: "error",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["displayName", "description", "webUrl"],
    actions: actions,
    children: (row) => (
      <CippDataTable
        title="Site Members"
        queryKey={`site-members-${row.siteId}`}
        api={{
          url: "/api/ListGraphRequest",
          data: {
            Endpoint: `/sites/${row.siteId}/lists/User%20Information%20List/items`,
            AsApp: "true",
            expand: "fields",
            tenantFilter: tenantFilter,
          },
          dataKey: "Results",
        }}
        simpleColumns={["fields.Title", "fields.EMail", "fields.IsSiteAdmin"]}
      />
    ),
    size: "lg", // Make the offcanvas extra large
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
          <Button component={Link} href="/teams-share/sharepoint/add-site" startIcon={<Add />}>
            Add Site
          </Button>
          <Button
            component={Link}
            href="/teams-share/sharepoint/bulk-add-site"
            startIcon={<AddToPhotos />}
          >
            Bulk Add Sites
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
