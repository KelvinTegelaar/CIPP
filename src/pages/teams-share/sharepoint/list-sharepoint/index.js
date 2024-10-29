import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "SharePoint List";

  const actions = [
    {
      label: "Add Member",
      type: "POST",
      url: "/api/ExecSetSharePointMember",
      data: {
        groupId: "UPN",
        TenantFilter: "TenantFilter",
        add: true,
        URL: "URL",
        SharePointType: "Template",
      },
      confirmText: "Select the User to add as a member.",
      dropdown: {
        url: "/api/listUsers?TenantFilter=TenantFilter",
        labelField: "displayName",
        valueField: "userPrincipalName",
      },
    },
    {
      label: "Remove Member",
      type: "POST",
      url: "/api/ExecSetSharePointMember",
      data: {
        groupId: "UPN",
        TenantFilter: "TenantFilter",
        add: false,
        URL: "URL",
        SharePointType: "Template",
      },
      confirmText: "Select the User to remove as a member.",
      dropdown: {
        url: "/api/listUsers?TenantFilter=TenantFilter",
        labelField: "displayName",
        valueField: "userPrincipalName",
      },
    },
    {
      label: "Add Site Admin",
      type: "POST",
      url: "/api/ExecSharePointPerms",
      data: {
        UPN: "UPN",
        TenantFilter: "TenantFilter",
        RemovePermission: false,
        URL: "URL",
      },
      confirmText: "Select the User to add to the Site Admins permissions",
      dropdown: {
        url: "/api/listUsers?TenantFilter=TenantFilter",
        labelField: "displayName",
        valueField: "userPrincipalName",
      },
    },
    {
      label: "Remove Site Admin",
      type: "POST",
      url: "/api/ExecSharePointPerms",
      data: {
        UPN: "UPN",
        TenantFilter: "TenantFilter",
        RemovePermission: true,
        URL: "URL",
      },
      confirmText: "Select the User to remove from the Site Admins permissions",
      dropdown: {
        url: "/api/listUsers?TenantFilter=TenantFilter",
        labelField: "displayName",
        valueField: "userPrincipalName",
      },
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["URL"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListSites?type=SharePointSiteUsage"
      apiData={{
        TenantFilter: "TenantFilter",
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "URL",
        "displayName",
        "LastActive",
        "FileCount",
        "UsedGB",
        "Allocated",
        "Template",
        "AutoMapUrl",
      ]}
      cardButton={
        <>
          <Button component={Link} href="/teams-share/sharepoint/addsite">
            Add Site
          </Button>
          <Button component={Link} href="/teams-share/sharepoint/addsitebulk">
            Bulk Add Sites
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
