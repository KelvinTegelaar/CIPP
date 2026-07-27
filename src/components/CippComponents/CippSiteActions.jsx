import { useMemo } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import {
  AdminPanelSettings,
  Assessment,
  CleaningServices,
  DataUsage,
  Delete,
  DriveFileRenameOutline,
  FolderShared,
  Groups,
  Hub,
  Info,
  Language,
  Lock,
  NoAccounts,
  PersonAdd,
  PersonRemove,
  QueryStats,
  RestoreFromTrash,
  Send,
  Settings,
  Share,
} from "@mui/icons-material";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import CippFormComponent from "./CippFormComponent";
import { CippFormCondition } from "./CippFormCondition";
import { CippPropertyList } from "./CippPropertyList";
import { CippEditSitePropertiesForm } from "./CippEditSitePropertiesForm";
import { CippSiteRecycleBinDialog } from "./CippSiteRecycleBinDialog";

// Friendly labels for the SharePoint version cleanup (trim) job progress fields.
const VERSION_CLEANUP_LABELS = {
  Status: "Status",
  BatchDeleteMode: "Cleanup Mode",
  RequestTimeInUTC: "Requested (UTC)",
  LastProcessTimeInUTC: "Last Processed (UTC)",
  CompleteTimeInUTC: "Completed (UTC)",
  ListsProcessed: "Lists Processed",
  ListsUpdated: "Lists Updated",
  ListsFailed: "Lists Failed",
  FilesProcessed: "Files Processed",
  VersionsProcessed: "Versions Processed",
  VersionsDeleted: "Versions Deleted",
  VersionsFailed: "Versions Failed",
  StorageReleased: "Storage Released (bytes)",
  ErrorMessage: "Error Message",
  WorkItemId: "Work Item ID",
};
// Order in which the fields are shown.
const VERSION_CLEANUP_FIELDS = Object.keys(VERSION_CLEANUP_LABELS);

// Renders the body of the status modal based on the fetched job progress.
const VersionCleanupStatusBody = ({ statusApi }) => {
  const progress = statusApi.data?.Results;

  if (statusApi.isError) {
    return <Alert severity="error">Failed to load cleanup job status.</Alert>;
  }

  // No job: either an empty/blank response, or the API's explicit "NoRequestFound" status.
  if (
    !statusApi.isFetching &&
    (progress === undefined ||
      progress === null ||
      (typeof progress === "string" && progress.trim() === "") ||
      progress?.Status === "NoRequestFound")
  ) {
    return <Alert severity="info">No cleanup job found for this site.</Alert>;
  }

  // Backend couldn't parse the payload and returned the raw string.
  if (!statusApi.isFetching && typeof progress === "string") {
    return <Alert severity="info">{progress}</Alert>;
  }

  const propertyItems = VERSION_CLEANUP_FIELDS.filter(
    (key) => progress?.[key] !== undefined && progress?.[key] !== ""
  ).map((key) => ({
    label: VERSION_CLEANUP_LABELS[key],
    value: String(progress[key]),
  }));

  return (
    <CippPropertyList
      isFetching={statusApi.isFetching}
      layout="two"
      propertyItems={
        propertyItems.length
          ? propertyItems
          : VERSION_CLEANUP_FIELDS.map((key) => ({ label: VERSION_CLEANUP_LABELS[key], value: "" }))
      }
    />
  );
};

// Custom-component action modal: opens directly (no confirmation step) and fetches the trim
// job status for the selected site, rendering it as a property list.
const VersionCleanupStatusModal = ({ row, tenantFilter, drawerVisible, setDrawerVisible }) => {
  const siteRow = Array.isArray(row) ? row[0] : row;
  const siteUrl = siteRow?.webUrl;
  const statusApi = ApiGetCall({
    url: "/api/ListSPOVersionCleanup",
    data: {
      tenantFilter: siteRow?.Tenant ?? tenantFilter,
      SiteUrl: siteUrl,
    },
    queryKey: `SPOVersionCleanupStatus-${siteUrl}`,
    waiting: !!drawerVisible && !!siteUrl,
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={!!drawerVisible} onClose={() => setDrawerVisible(false)}>
      <DialogTitle>
        Cleanup Job Status{siteRow?.displayName ? ` — ${siteRow.displayName}` : ""}
      </DialogTitle>
      <DialogContent dividers>
        <VersionCleanupStatusBody statusApi={statusApi} />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => setDrawerVisible(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const useCippSiteActions = () => {
  const tenantFilter = useSettings().currentTenant;

  return useMemo(
    () => [
      {
        label: "View Details",
        type: "link",
        icon: <Info />,
        link: "/teams-share/sharepoint/site-details?siteId=[siteId]&displayName=[displayName]&webUrl=[webUrl]&rootWebTemplate=[rootWebTemplate]&ownerPrincipalName=[ownerPrincipalName]&ownerDisplayName=[ownerDisplayName]&storageUsedInGigabytes=[storageUsedInGigabytes]&storageAllocatedInGigabytes=[storageAllocatedInGigabytes]&fileCount=[fileCount]&lastActivityDate=[lastActivityDate]&createdDateTime=[createdDateTime]&reportRefreshDate=[reportRefreshDate]",
        category: "view",
        quickAction: true,
      },
      {
        label: "Open Site",
        type: "link",
        icon: <Language />,
        link: "[webUrl]",
        external: true,
        category: "view",
        quickAction: true,
      },
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
        confirmText: "Select the User to add and the site role to add them to.",
        relatedQueryKeys: ["site-members-*"],
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
          {
            type: "radio",
            name: "Role",
            label: "Site Role",
            options: [
              { label: "Members", value: "Members" },
              { label: "Owners", value: "Owners" },
              { label: "Visitors", value: "Visitors" },
            ],
          },
        ],
        defaultvalues: {
          Role: "Members",
        },
        allowResubmit: true,
        multiPost: false,
        category: "edit",
        quickAction: true,
      },
      {
        label: "Remove Member",
        type: "POST",
        icon: <PersonRemove />,
        url: "/api/ExecSetSharePointMember",
        data: {
          groupId: "ownerPrincipalName",
          add: false,
          URL: "webUrl",
          SharePointType: "rootWebTemplate",
        },
        confirmText: "Select the user to remove from their site role.",
        relatedQueryKeys: ["site-members-*"],
        category: "edit",
        children: ({ formHook, row }) => {
          const siteRow = Array.isArray(row) ? row[0] : row;
          return (
            <CippFormComponent
              type="autoComplete"
              name="user"
              label="Select Member"
              multiple={false}
              creatable={false}
              formControl={formHook}
              validators={{ required: "Please select a member" }}
              api={{
                url: "/api/ListSiteMembers",
                data: {
                  SiteId: siteRow?.siteId,
                  SiteUrl: siteRow?.webUrl,
                  tenantFilter: siteRow?.Tenant ?? tenantFilter,
                },
                queryKey: `SiteMembersPicker-${siteRow?.siteId}`,
                dataKey: "Results",
                labelField: (member) =>
                  `${member.Title} (${member.UserPrincipalName}) — ${member.Group}`,
                valueField: "UserPrincipalName",
                addedField: {
                  Group: "Group",
                  Type: "Type",
                },
                dataFilter: (options) =>
                  options.filter(
                    (option, index, all) =>
                      option.value &&
                      ["Owners", "Members", "Visitors"].includes(option.addedFields?.Group) &&
                      all.findIndex(
                        (o) =>
                          o.value === option.value &&
                          o.addedFields?.Group === option.addedFields?.Group
                      ) === index
                  ),
                showRefresh: true,
              }}
            />
          );
        },
        allowResubmit: true,
        multiPost: false,
        quickAction: true,
      },
      {
        label: "Remove User From Site",
        type: "POST",
        icon: <NoAccounts />,
        url: "/api/ExecRemoveSiteUser",
        data: {
          SiteUrl: "webUrl",
        },
        confirmText:
          "Remove a user from the entire site: this removes them from every site group and direct permission grant at once. Sharing links they received are not revoked.",
        relatedQueryKeys: ["site-members-*"],
        category: "edit",
        children: ({ formHook, row }) => {
          const siteRow = Array.isArray(row) ? row[0] : row;
          return (
            <CippFormComponent
              type="autoComplete"
              name="user"
              label="Select User"
              multiple={false}
              creatable={false}
              formControl={formHook}
              validators={{ required: "Please select a user" }}
              api={{
                url: "/api/ListSiteMembers",
                data: {
                  SiteId: siteRow?.siteId,
                  SiteUrl: siteRow?.webUrl,
                  tenantFilter: siteRow?.Tenant ?? tenantFilter,
                },
                queryKey: `SiteMembersPicker-${siteRow?.siteId}`,
                dataKey: "Results",
                labelField: (member) =>
                  `${member.Title} (${member.UserPrincipalName})${
                    member.IsGuest ? " — Guest" : ""
                  } — ${member.Group}`,
                valueField: "UserPrincipalName",
                addedField: {
                  LoginName: "LoginName",
                  Type: "Type",
                },
                dataFilter: (options) =>
                  options.filter(
                    (option, index, all) =>
                      option.value &&
                      option.addedFields?.Type === "User" &&
                      all.findIndex((o) => o.value === option.value) === index
                  ),
                showRefresh: true,
              }}
            />
          );
        },
        multiPost: false,
      },
      {
        label: "Revoke Sharing Links",
        type: "POST",
        icon: <FolderShared />,
        url: "/api/ExecBulkRemoveSharingLinks",
        data: {
          SiteUrl: "webUrl",
        },
        confirmText:
          "Bulk revoke sharing links on [displayName]. This uses the sharing report cache: links created since the last sharing sync are not covered - run a sync from the Sharing Report page first for full coverage.",
        category: "security",
        fields: [
          {
            type: "radio",
            name: "Scope",
            label: "Which links to revoke",
            options: [
              { label: "Anonymous links only (anyone with the link)", value: "Anonymous" },
              { label: "Anonymous + external user shares", value: "External" },
              { label: "All sharing links, including internal", value: "All" },
            ],
          },
        ],
        defaultvalues: {
          Scope: "Anonymous",
        },
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
        relatedQueryKeys: ["site-members-*"],
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
        category: "security",
        quickAction: true,
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
        confirmText: "Select the Site Admin to remove from this site.",
        fields: [
          {
            type: "autoComplete",
            name: "user",
            label: "Select Site Admin",
            multiple: false,
            creatable: false,
            api: {
              url: "/api/ListGraphRequest",
              data: {
                Endpoint: "sites/[siteId]/lists/User%20Information%20List/items",
                AsApp: "true",
                $expand: "fields",
                $filter: "fields/ContentType eq 'Person'",
              },
              queryKey: "ListSiteAdminsAutoComplete",
              dataKey: "Results",
              labelField: (item) =>
                `${item.fields?.Title || "Unknown"} (${item.fields?.EMail || "No email"})`,
              valueField: (item) => item.fields?.EMail || item.fields?.UserName,
              showRefresh: true,
              // Filter for site admins client-side (IsSiteAdmin is not indexed in SharePoint)
              dataFilter: (data) =>
                data.filter((item) => {
                  const email = item.fields?.EMail;
                  const title = (item.fields?.Title || "").toLowerCase();
                  const isSiteAdmin = item.fields?.IsSiteAdmin === true || item.fields?.IsSiteAdmin === "1" || item.fields?.IsSiteAdmin === 1;
                  const excludedTitles = ["system account", "sharepoint app", "nt service", "everyone"];
                  const isSystemAccount = excludedTitles.some((ex) => title.includes(ex) || title.startsWith("nt "));
                  return email && isSiteAdmin && !isSystemAccount;
                }),
            },
          },
        ],
        multiPost: false,
        relatedQueryKeys: ["site-members-*"],
        category: "security",
        quickAction: true,
      },
      {
        label: "Lock / Unlock Site",
        type: "POST",
        icon: <Lock />,
        url: "/api/ExecSetSiteProperty",
        data: {
          SiteId: "siteId",
          DisplayName: "displayName",
        },
        confirmText:
          "Set the lock state for '[displayName]'. 'Read Only' prevents edits, 'No Access' blocks all users, and 'Unlock' restores normal access.",
        fields: [
          {
            type: "autoComplete",
            name: "LockState",
            label: "Lock State",
            multiple: false,
            creatable: false,
            options: [
              { label: "Unlock (normal access)", value: "Unlock" },
              { label: "Read Only", value: "ReadOnly" },
              { label: "No Access", value: "NoAccess" },
            ],
            required: true,
          },
        ],
        multiPost: false,
        category: "security",
        quickAction: true,
      },
      {
        label: "Set Sharing Policy",
        type: "POST",
        icon: <Share />,
        url: "/api/ExecSetSiteProperty",
        data: {
          SiteId: "siteId",
          DisplayName: "displayName",
        },
        confirmText:
          "Set the external sharing policy for '[displayName]'. This controls who can access content shared from this site.",
        fields: [
          {
            type: "autoComplete",
            name: "SharingCapability",
            label: "Sharing Policy",
            multiple: false,
            creatable: false,
            options: [
              { label: "Disabled (no external sharing)", value: 0 },
              { label: "Existing external users only", value: 3 },
              { label: "New and existing external users (sign-in required)", value: 1 },
              { label: "Anyone (including anonymous guest links)", value: 2 },
            ],
            required: true,
          },
        ],
        multiPost: false,
        category: "security",
        quickAction: true,
      },
      {
        label: "Set Default Sharing Link",
        type: "POST",
        icon: <Share />,
        url: "/api/ExecSetSiteProperty",
        data: {
          SiteId: "siteId",
          DisplayName: "displayName",
        },
        confirmText:
          "Set the default sharing link type and permission for '[displayName]'. These control what kind of link the Share dialog creates by default on this site.",
        fields: [
          {
            type: "autoComplete",
            name: "DefaultSharingLinkType",
            label: "Default Link Type",
            multiple: false,
            creatable: false,
            options: [
              { label: "Tenant default", value: 0 },
              { label: "Direct — specific people", value: 1 },
              { label: "Internal — people in the organization", value: 2 },
              { label: "Anyone — anonymous access link", value: 3 },
            ],
            required: true,
          },
          {
            type: "autoComplete",
            name: "DefaultLinkPermission",
            label: "Default Link Permission",
            multiple: false,
            creatable: false,
            options: [
              { label: "Tenant default", value: 0 },
              { label: "View", value: 1 },
              { label: "Edit", value: 2 },
            ],
          },
          {
            type: "number",
            name: "AnonymousLinkExpirationInDays",
            label: "Anonymous Link Expiration (days, optional — overrides tenant policy)",
          },
        ],
        multiPost: false,
        category: "security",
      },
      {
        label: "Restrict Access to Members",
        type: "POST",
        icon: <Lock />,
        url: "/api/ExecSetSiteProperty",
        data: {
          SiteId: "siteId",
          DisplayName: "displayName",
        },
        confirmText:
          "Toggle restricted access control for '[displayName]'. When enabled, only members of the site (or its Microsoft 365 group) can access content, even if items were shared more broadly. Requires SharePoint Advanced Management licensing.",
        fields: [
          {
            type: "radio",
            name: "RestrictedAccessControl",
            label: "Restricted Access Control",
            options: [
              { label: "Enable (members only)", value: true },
              { label: "Disable", value: false },
            ],
          },
        ],
        defaultvalues: { RestrictedAccessControl: true },
        multiPost: false,
        category: "security",
      },
      {
        label: "Set Storage Quota",
        type: "POST",
        icon: <DataUsage />,
        url: "/api/ExecSetSiteProperty",
        data: {
          SiteId: "siteId",
          DisplayName: "displayName",
        },
        confirmText:
          "Set the storage quota for '[displayName]'. Values are in GB. The warning level triggers a notification to site admins.",
        fields: [
          {
            type: "textField",
            name: "StorageMaximumLevelGB",
            label: "Maximum Storage (GB)",
            required: true,
          },
          {
            type: "textField",
            name: "StorageWarningLevelGB",
            label: "Warning Level (GB, optional — defaults to 90% of max)",
          },
        ],
        multiPost: false,
        category: "edit",
        quickAction: true,
      },
      {
        label: "Get Live Storage",
        type: "POST",
        icon: <QueryStats />,
        url: "/api/ListSiteLiveStorage",
        data: {
          SiteId: "siteId",
          DisplayName: "displayName",
        },
        confirmText:
          "Fetch real-time storage data for '[displayName]' directly from the SharePoint Admin API. This bypasses the usage reports cache and returns current values.",
        multiPost: false,
        category: "view",
        quickAction: true,
      },
      {
        label: "Notify Site Owner",
        type: "POST",
        icon: <Send />,
        url: "/api/ExecNotifySiteOwner",
        data: {
          DisplayName: "displayName",
          SiteUrl: "webUrl",
          OwnerEmail: "ownerPrincipalName",
          StorageUsedGB: "storageUsedInGigabytes",
          StorageAllocatedGB: "storageAllocatedInGigabytes",
        },
        confirmText:
          "Send a notification email to the owner of '[displayName]' ([ownerPrincipalName]) from the CIPP notification mailbox.",
        fields: [
          {
            type: "radio",
            name: "Type",
            label: "Notification Type",
            options: [
              { label: "Storage critical — ask owner to clean up", value: "StorageCritical" },
              { label: "Inactivity — ask if the site is still needed", value: "Inactivity" },
              { label: "Custom message", value: "Custom" },
            ],
          },
          {
            type: "textField",
            name: "CustomMessage",
            label: "Custom Message (required for Custom type)",
            multiline: true,
            rows: 4,
          },
        ],
        defaultvalues: { Type: "StorageCritical" },
        condition: (row) => !!row.ownerPrincipalName,
        multiPost: false,
        category: "edit",
      },
      {
        label: "Create Team from Site",
        type: "POST",
        icon: <Groups />,
        url: "/api/ExecTeamFromGroup",
        data: {
          SiteId: "siteId",
          DisplayName: "displayName",
        },
        confirmText:
          "Create a Microsoft Team for '[displayName]'? This will team-enable the existing Microsoft 365 Group behind this site, preserving the current site, membership, and content. Full Team provisioning may take a few minutes.",
        multiPost: false,
        condition: (row) => row.rootWebTemplate?.includes("Group"),
        category: "edit",
        quickAction: true,
      },
      {
        label: "Edit Site",
        type: "POST",
        icon: <Settings />,
        url: "/api/ExecSetSiteProperties",
        confirmText:
          "Edit site properties for [displayName]. Fields are prefilled with the current values.",
        children: ({ formHook, row }) => (
          <CippEditSitePropertiesForm formHook={formHook} row={row} tenantFilter={tenantFilter} />
        ),
        customDataformatter: (row, action, formData) => {
          const siteRow = Array.isArray(row) ? row[0] : row;
          const isGroupSite = siteRow?.rootWebTemplate === "Group";
          const v = (x) => (x && typeof x === "object" && "value" in x ? x.value : x);
          const payload = {
            tenantFilter: siteRow.Tenant ?? tenantFilter,
            SiteUrl: siteRow.webUrl,
            SharingCapability: v(formData.SharingCapability),
            DefaultSharingLinkType: v(formData.DefaultSharingLinkType),
            DefaultLinkPermission: v(formData.DefaultLinkPermission),
            LockState: v(formData.LockState),
          };
          if (!isGroupSite) {
            payload.Title = formData.Title;
            payload.SharingDomainRestrictionMode = v(formData.SharingDomainRestrictionMode);
            payload.OverrideTenantAnonymousLinkExpirationPolicy =
              !!formData.OverrideTenantAnonymousLinkExpirationPolicy;
            payload.InheritVersionPolicyFromTenant = !!formData.InheritVersionPolicyFromTenant;
          }
          if (!isGroupSite && v(formData.SharingDomainRestrictionMode) === "AllowList") {
            payload.SharingAllowedDomainList = formData.SharingAllowedDomainList;
          }
          if (!isGroupSite && v(formData.SharingDomainRestrictionMode) === "BlockList") {
            payload.SharingBlockedDomainList = formData.SharingBlockedDomainList;
          }
          if (!isGroupSite && formData.OverrideTenantAnonymousLinkExpirationPolicy) {
            payload.AnonymousLinkExpirationInDays = parseInt(
              formData.AnonymousLinkExpirationInDays ?? 0,
              10
            );
          }
          const storageMax = parseInt(formData.StorageMaximumLevel, 10);
          const storageWarn = parseInt(formData.StorageWarningLevel, 10);
          if (!isNaN(storageMax) && storageMax > 0) payload.StorageMaximumLevel = storageMax;
          if (!isNaN(storageWarn) && storageWarn > 0) payload.StorageWarningLevel = storageWarn;
          if (!isGroupSite && !formData.InheritVersionPolicyFromTenant) {
            payload.EnableAutoExpirationVersionTrim = !!formData.EnableAutoExpirationVersionTrim;
            if (!formData.EnableAutoExpirationVersionTrim) {
              payload.MajorVersionLimit = parseInt(formData.MajorVersionLimit ?? 0, 10);
              payload.ExpireVersionsAfterDays = parseInt(formData.ExpireVersionsAfterDays ?? 0, 10);
            }
          }
          return payload;
        },
        multiPost: false,
        allowResubmit: true,
        category: "edit",
      },
      {
        label: "Rename Site",
        type: "POST",
        icon: <DriveFileRenameOutline />,
        url: "/api/ExecSiteRename",
        data: {
          SiteId: "siteId",
          SiteUrl: "webUrl",
          DisplayName: "displayName",
        },
        confirmText:
          "Rename '[displayName]'. Leave a field empty to keep it unchanged. Changing the URL queues a background rename job — SharePoint creates a redirect from the old URL. For group-connected sites, the display name follows the Microsoft 365 group.",
        fields: [
          { type: "textField", name: "NewTitle", label: "New Site Title (optional)" },
          { type: "textField", name: "NewUrl", label: "New Site URL (optional, full URL e.g. https://contoso.sharepoint.com/sites/newname)" },
        ],
        multiPost: false,
        category: "edit",
      },
      {
        label: "Hub Site Association",
        type: "POST",
        icon: <Hub />,
        url: "/api/ExecHubSiteAssociation",
        data: {
          SiteUrl: "webUrl",
          DisplayName: "displayName",
        },
        confirmText:
          "Connect '[displayName]' to a hub site, or disconnect it from its current hub. Hub association shares navigation, branding, and search scope.",
        fields: [
          {
            type: "radio",
            name: "Disconnect",
            label: "Action",
            options: [
              { label: "Join a hub site", value: false },
              { label: "Disconnect from current hub", value: true },
            ],
          },
          {
            type: "autoComplete",
            name: "HubSiteId",
            label: "Hub Site",
            multiple: false,
            creatable: false,
            api: {
              url: "/api/ListHubSites",
              dataKey: "Results",
              labelField: (hub) => `${hub.Title} (${hub.SiteUrl})`,
              valueField: "ID",
              queryKey: "ListHubSites",
              showRefresh: true,
            },
          },
        ],
        defaultvalues: { Disconnect: false },
        multiPost: false,
        category: "edit",
      },
      {
        label: "Set Library Permission",
        type: "POST",
        icon: <FolderShared />,
        url: "/api/ExecSetLibraryPermission",
        confirmText:
          "Grant users or groups a permission level on a document library of [displayName].",
        category: "security",
        children: ({ formHook, row }) => {
          const siteRow = Array.isArray(row) ? row[0] : row;
          return (
            <>
              <CippFormComponent
                type="autoComplete"
                name="library"
                label="Document Library"
                multiple={false}
                creatable={false}
                formControl={formHook}
                validators={{ required: "Please select a document library" }}
                api={{
                  url: "/api/ListSiteLibraries",
                  data: {
                    SiteId: siteRow?.siteId,
                    SiteUrl: siteRow?.webUrl,
                    tenantFilter: siteRow?.Tenant ?? tenantFilter,
                  },
                  queryKey: `SiteLibraries-${siteRow?.siteId}`,
                  dataKey: "Results",
                  labelField: (library) => library.Title,
                  valueField: "Id",
                  showRefresh: true,
                }}
              />
              <CippFormComponent
                type="autoComplete"
                name="users"
                label="Users"
                multiple={true}
                creatable={false}
                formControl={formHook}
                api={{
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
                }}
              />
              <CippFormComponent
                type="autoComplete"
                name="groups"
                label="Groups"
                multiple={true}
                creatable={false}
                formControl={formHook}
                api={{
                  url: "/api/ListGraphRequest",
                  data: {
                    Endpoint: "groups",
                    $select: "id,displayName,mail,securityEnabled,groupTypes",
                    $top: 999,
                    $count: true,
                  },
                  queryKey: "ListGroupsAutoComplete",
                  dataKey: "Results",
                  labelField: (group) =>
                    group.mail ? `${group.displayName} (${group.mail})` : group.displayName,
                  valueField: "id",
                  addedField: {
                    securityEnabled: "securityEnabled",
                    groupTypes: "groupTypes",
                  },
                  showRefresh: true,
                }}
              />
              <CippFormComponent
                type="radio"
                name="PermissionLevel"
                label="Permission Level"
                formControl={formHook}
                options={[
                  { label: "Read", value: "read" },
                  { label: "Contribute", value: "contribute" },
                  { label: "Edit", value: "edit" },
                  { label: "Design", value: "design" },
                  { label: "Full Control", value: "fullControl" },
                ]}
              />
            </>
          );
        },
        defaultvalues: {
          PermissionLevel: "read",
        },
        customDataformatter: (row, action, formData) => {
          const siteRow = Array.isArray(row) ? row[0] : row;
          return {
            tenantFilter: siteRow.Tenant ?? tenantFilter,
            SiteUrl: siteRow.webUrl,
            ListId: formData.library?.value,
            LibraryName: formData.library?.label,
            PermissionLevel: formData.PermissionLevel,
            Users: formData.users ?? [],
            Groups: formData.groups ?? [],
          };
        },
        multiPost: false,
      },
      {
        label: "Start Version Cleanup Job",
        type: "POST",
        icon: <CleaningServices />,
        url: "/api/ExecSPOVersionCleanup",
        data: {
          SiteUrl: "webUrl",
        },
        confirmText:
          "Start a file version cleanup job for [displayName]. This will trim old file versions based on the selected mode.",
        category: "edit",
        children: ({ formHook }) => (
          <>
            <CippFormComponent
              type="radio"
              name="BatchDeleteMode"
              label="Cleanup Mode"
              formControl={formHook}
              options={[
                {
                  label: "Sync Policy — apply site version policy to existing versions",
                  value: "2",
                },
                {
                  label: "Delete Older Than Days — remove versions older than a set number of days",
                  value: "0",
                },
                { label: "Count Limits — keep a maximum number of major versions", value: "1" },
              ]}
            />
            <CippFormCondition
              field="BatchDeleteMode"
              compareType="is"
              compareValue="0"
              formControl={formHook}
            >
              <CippFormComponent
                type="number"
                name="DeleteOlderThanDays"
                label="Delete Versions Older Than (days)"
                formControl={formHook}
                validators={{
                  required: "Please enter the number of days",
                  min: { value: 30, message: "SharePoint requires at least 30 days" },
                }}
              />
            </CippFormCondition>
            <CippFormCondition
              field="BatchDeleteMode"
              compareType="is"
              compareValue="1"
              formControl={formHook}
            >
              <CippFormComponent
                type="number"
                name="MajorVersionLimit"
                label="Maximum Major Versions to Keep"
                formControl={formHook}
                validators={{ required: "Please enter the version limit" }}
              />
              <CippFormComponent
                type="number"
                name="MajorWithMinorVersionsLimit"
                label="Major Versions That Keep Their Minor Versions"
                formControl={formHook}
                validators={{ required: "Please enter the major-with-minor version limit" }}
              />
            </CippFormCondition>
          </>
        ),
        defaultvalues: {
          BatchDeleteMode: "2",
        },
        customDataformatter: (row, action, formData) => {
          const formatRow = (singleRow) => ({
            tenantFilter: singleRow.Tenant ?? tenantFilter,
            SiteUrl: singleRow.webUrl,
            BatchDeleteMode: parseInt(formData.BatchDeleteMode, 10),
            DeleteOlderThanDays:
              formData.BatchDeleteMode === "0" ? parseInt(formData.DeleteOlderThanDays, 10) : -1,
            MajorVersionLimit:
              formData.BatchDeleteMode === "1" ? parseInt(formData.MajorVersionLimit, 10) : -1,
            MajorWithMinorVersionsLimit:
              formData.BatchDeleteMode === "1"
                ? parseInt(formData.MajorWithMinorVersionsLimit, 10)
                : -1,
          });
          // When multiple rows are selected, row is an array. Returning an array
          // makes CippApiDialog send one request per row (bulk request mode).
          return Array.isArray(row) ? row.map(formatRow) : formatRow(row);
        },
        multiPost: false,
      },
      {
        label: "Check Cleanup Job Status",
        icon: <Assessment />,
        customComponent: (row, { drawerVisible, setDrawerVisible }) => (
          <VersionCleanupStatusModal
            row={row}
            tenantFilter={tenantFilter}
            drawerVisible={drawerVisible}
            setDrawerVisible={setDrawerVisible}
          />
        ),
        multiPost: false,
        category: "view",
      },
      {
        label: "Recycle Bin",
        icon: <RestoreFromTrash />,
        customComponent: (row, { drawerVisible, setDrawerVisible }) => (
          <CippSiteRecycleBinDialog
            row={row}
            tenantFilter={tenantFilter}
            drawerVisible={drawerVisible}
            setDrawerVisible={setDrawerVisible}
          />
        ),
        multiPost: false,
        category: "view",
      },
      {
        label: "Delete Site",
        type: "POST",
        icon: <Delete />,
        url: "/api/DeleteSharepointSite",
        data: {
          SiteId: "siteId",
          DisplayName: "displayName",
        },
        confirmText:
          "Are you sure you want to delete this SharePoint site? This action cannot be undone. The site will be moved to the recycle bin for 93 days before permanent deletion. Deletion runs in the background—for large sites it may take several minutes; you can continue using the app.",
        color: "error",
        multiPost: false,
        category: "danger",
        quickAction: true,
      },
    ],
    [tenantFilter]
  );
};
