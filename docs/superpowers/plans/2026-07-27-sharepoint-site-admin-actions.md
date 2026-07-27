# SharePoint Site Admin Actions Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the full SharePoint site action set to the site-details page and dashboard alert rows, and add five new admin capabilities (per-site sharing defaults, restricted access, rename, hub association, notify owner).

**Architecture:** Extract the ~19 site actions from the sites list page into a shared `useCippSiteActions()` hook (mirrors `CippUserActions.jsx`), consumed by the list table, the site-details page (via `ActionsMenu`), and the dashboard. Backend work extends the existing Admin REST PATCH endpoint (`ExecSetSiteProperty`) and adds four new PowerShell HTTP functions in CIPP-API.

**Tech Stack:** React/Next.js + MUI (CIPP repo), PowerShell Azure Functions (CIPP-API repo), SharePoint Admin REST (`SPO.Tenant`), SharePoint site REST, Microsoft Graph.

**Spec:** `docs/superpowers/specs/2026-07-27-sharepoint-site-admin-actions-design.md`

## Global Constraints

- Two repos: frontend `/Users/clint/Documents/GitHub/CIPP`, backend `/Users/clint/Documents/GitHub/CIPP-API`. Commit each task's changes in the repo it touches.
- SharePoint site-level REST (`{siteUrl}/_api/*`) must use **delegated** auth (no `-AsApp`). Admin REST (`{AdminUrl}/_api/*`) uses delegated with the AdminUrl scope, same as the existing `Invoke-ExecSetSiteProperty`.
- `-NoAuthCheck` is a boolean parameter, always pass `-NoAuthCheck $true` (never as a switch).
- All user-facing storage inputs are **GB** (backend converts to MB).
- No automated test infrastructure exists in either repo. Verification per task: `npx eslint <changed files>` in CIPP, PowerShell parse check in CIPP-API (`pwsh -NoProfile -Command "[void][System.Management.Automation.Language.Parser]::ParseFile('<file>', [ref]$null, [ref]$err); $err"` must output nothing), plus the manual smoke checks listed in each task.
- New PowerShell endpoints go in `Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/` and are auto-routed by function name (no function.json needed).
- Backend error handling: catch blocks use `Get-CippException` / `Get-NormalizedError` and classify known failures into actionable `Results` messages (existing pattern in `Invoke-ExecSetSiteProperty.ps1`).
- One **minor** version bump in `public/manage365-version.json` at the end (Task 9), not per task.

---

### Task 1: Extract shared `useCippSiteActions()` hook

**Files:**
- Create: `src/components/CippComponents/CippSiteActions.jsx`
- Modify: `src/pages/teams-share/sharepoint/index.js`

**Interfaces:**
- Produces: `useCippSiteActions()` — React hook returning the memoized actions array (same shape as CIPP table actions: `{ label, type, icon, url, data, fields, children, customDataformatter, confirmText, condition, category, ... }`). Imported by Tasks 2, 3, 5, 6, 7, 8.

- [ ] **Step 1: Create `CippSiteActions.jsx`**

Create the file with this skeleton. The three `// MOVED:` markers are filled by cutting code **verbatim** from `src/pages/teams-share/sharepoint/index.js` (line numbers refer to the file before edits):

```jsx
import { useMemo } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import {
  Add,
  AdminPanelSettings,
  Assessment,
  CleaningServices,
  DataUsage,
  Delete,
  FolderShared,
  Groups,
  Info,
  Language,
  Lock,
  NoAccounts,
  PersonAdd,
  PersonRemove,
  QueryStats,
  RestoreFromTrash,
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

// MOVED: index.js lines 71-90 — VERSION_CLEANUP_LABELS + VERSION_CLEANUP_FIELDS constants

// MOVED: index.js lines 92-166 — VersionCleanupStatusBody + VersionCleanupStatusModal components

export const useCippSiteActions = () => {
  const tenantFilter = useSettings().currentTenant;

  return useMemo(
    () => [
      // MOVED: index.js lines 265-1009 — the full contents of the actions array
      // (everything between `() => [` and the closing `]` of the existing useMemo,
      // i.e. from `{ label: "View Details", ...` through `{ label: "Delete Site", ... },`)
    ],
    [tenantFilter]
  );
};
```

Remove the `Add` import from the icon list above if eslint flags it as unused (it is only needed if any moved action references it — none do; the final icon import list must exactly match the icons referenced by the moved code: `Info, Language, PersonAdd, PersonRemove, NoAccounts, FolderShared, AdminPanelSettings, Lock, Share, DataUsage, QueryStats, Groups, Settings, CleaningServices, Assessment, RestoreFromTrash, Delete`).

- [ ] **Step 2: Update `index.js` to consume the hook**

In `src/pages/teams-share/sharepoint/index.js`:

1. Delete lines 71–166 (`VERSION_CLEANUP_LABELS` through the end of `VersionCleanupStatusModal`).
2. Replace the entire `const actions = useMemo(...)` block (lines 263–1011 of the original file) with:

```jsx
const actions = useCippSiteActions();
```

3. Add the import:

```jsx
import { useCippSiteActions } from "../../../components/CippComponents/CippSiteActions";
```

4. Remove now-unused imports. After the edit, the remaining code (helpers, `StorageProgressBar`, `cardConfig`, `offCanvasChildren`, page JSX) still uses: `Alert`? no — remove; keep `Button, Paper, Avatar, Typography, Chip, Divider, useTheme, LinearProgress, Tooltip, useMediaQuery, IconButton` from `@mui/material`; remove `Dialog, DialogActions, DialogContent, DialogTitle`. From icons keep `Add, AddToPhotos, Language, Storage, Person, Group, Campaign, Warning, CheckCircle, OpenInNew, TrendingDown, Description, FolderShared, CalendarToday` and remove the rest. Remove imports of `CippFormComponent`, `CippFormCondition`, `CippPropertyList`, `ApiGetCall`, `CippEditSitePropertiesForm`, `CippSiteRecycleBinDialog`. Let eslint be the arbiter: any import it flags unused gets removed; any it flags missing was needed by remaining code and must stay.

- [ ] **Step 3: Lint both files**

Run: `cd /Users/clint/Documents/GitHub/CIPP && npx eslint src/components/CippComponents/CippSiteActions.jsx src/pages/teams-share/sharepoint/index.js`
Expected: no errors (warnings acceptable if pre-existing style warnings).

- [ ] **Step 4: Smoke check**

Run: `cd /Users/clint/Documents/GitHub/CIPP && npx next build --no-lint 2>&1 | tail -20` — build must succeed. (If a dev server is already running, loading `/teams-share/sharepoint` and opening the action menu on a row is an acceptable substitute.)

- [ ] **Step 5: Commit**

```bash
cd /Users/clint/Documents/GitHub/CIPP
git add src/components/CippComponents/CippSiteActions.jsx src/pages/teams-share/sharepoint/index.js
git commit -m "refactor: extract SharePoint site actions into shared useCippSiteActions hook"
```

---

### Task 2: Site-details — actions menu, storage quick actions, live refresh

**Files:**
- Modify: `src/pages/teams-share/sharepoint/site-details.js`

**Interfaces:**
- Consumes: `useCippSiteActions()` from Task 1; `ActionsMenu` from `src/components/actions-menu`; existing `/api/ListSiteLiveStorage` (GET, query params `TenantFilter`, `SiteId`; returns `{ storageUsedInGigabytes, storageAllocatedInGigabytes, storageWarningInGigabytes, storagePercentage, lockState, retrievedAt, ... }`).

- [ ] **Step 1: Add imports and the merged site row**

Add imports at top of `site-details.js`:

```jsx
import { useMemo } from "react"; // extend the existing `import { useState } from "react";`
import { ActionsMenu } from "../../../components/actions-menu";
import { useCippSiteActions } from "../../../components/CippComponents/CippSiteActions";
import { Refresh, CleaningServices } from "@mui/icons-material"; // add to existing icon import
```

Inside `Page()`, after the `groupIdForApi` declaration, add:

```jsx
const siteActions = useCippSiteActions();
const siteRow = useMemo(
  () => ({
    siteId,
    displayName,
    webUrl,
    rootWebTemplate,
    ownerPrincipalName,
    ownerDisplayName,
    storageUsedInGigabytes: storageUsed,
    storageAllocatedInGigabytes: storageAllocated,
    fileCount,
    lastActivityDate,
    createdDateTime,
    reportRefreshDate,
    Tenant: tenantFilter,
  }),
  [
    siteId,
    displayName,
    webUrl,
    rootWebTemplate,
    ownerPrincipalName,
    ownerDisplayName,
    storageUsed,
    storageAllocated,
    fileCount,
    lastActivityDate,
    createdDateTime,
    reportRefreshDate,
    tenantFilter,
  ]
);
```

- [ ] **Step 2: Render the actions menu**

Replace the lone "Back to Sites" button row (inside the main `return`, the `{/* Back */}` block) with:

```jsx
{/* Back + Actions */}
<Stack direction="row" justifyContent="space-between" alignItems="center">
  <Button component={Link} href="/teams-share/sharepoint" startIcon={<ArrowBack />}>
    Back to Sites
  </Button>
  <ActionsMenu actions={siteActions} data={siteRow} />
</Stack>
```

Exclude the two actions that make no sense here by filtering:

```jsx
const detailPageActions = useMemo(
  () => siteActions.filter((a) => !["View Details", "Open Site"].includes(a.label)),
  [siteActions]
);
```

and pass `actions={detailPageActions}` instead.

- [ ] **Step 3: Add live storage fetch and storage quick actions**

Inside `Page()`, add:

```jsx
const liveStorage = ApiGetCall({
  url: "/api/ListSiteLiveStorage",
  data: { SiteId: siteId, TenantFilter: tenantFilter },
  queryKey: `site-live-storage-${siteId}`,
  waiting: false,
});
const live = liveStorage.data;

const quotaDialog = useDialog();
const quotaAction = siteActions.find((a) => a.label === "Set Storage Quota");
const cleanupDialog = useDialog();
const cleanupAction = siteActions.find((a) => a.label === "Start Version Cleanup Job");
```

Replace the display values in the Storage panel: when `live` is truthy, use `live.storageUsedInGigabytes`, `live.storageAllocatedInGigabytes`, and `live.storagePercentage` instead of the report-derived `storageUsed` / `storageAllocated` / `storagePct`, and add two extra `InfoRow`s (`Warning Level` = `` `${live.storageWarningInGigabytes} GB` ``, `Lock State` = `live.lockState`). Concretely, at the top of the component after `storagePct` is computed:

```jsx
const shownUsed = live?.storageUsedInGigabytes ?? storageUsed;
const shownAllocated = live?.storageAllocatedInGigabytes ?? storageAllocated;
const shownPct = live ? Math.round(live.storagePercentage) : storagePct;
const shownColor = getStorageStatusColor(shownPct);
```

Use `shownUsed` / `shownAllocated` / `shownPct` / `shownColor` in the Storage panel and StatBox row (leave the hero "Storage Critical" chip on `storagePct` — it renders before any live fetch anyway).

In the Storage panel header, replace the title `Stack` with:

```jsx
<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
  <Stack direction="row" alignItems="center" spacing={1}>
    <Storage sx={{ fontSize: 16 }} color="action" />
    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
      Storage
    </Typography>
    {live && (
      <Tooltip title={`Live data from SharePoint Admin API, retrieved ${new Date(live.retrievedAt).toLocaleString()}`}>
        <Chip label="Live" size="small" color="success" variant="outlined" />
      </Tooltip>
    )}
  </Stack>
  <Stack direction="row" spacing={1}>
    <Button size="small" startIcon={<Refresh />} onClick={() => liveStorage.refetch()} disabled={liveStorage.isFetching}>
      {liveStorage.isFetching ? "Loading..." : "Refresh Live"}
    </Button>
    <Button size="small" startIcon={<DataUsage />} onClick={() => quotaDialog.handleOpen()}>
      Set Quota
    </Button>
    <Button size="small" startIcon={<CleaningServices />} onClick={() => cleanupDialog.handleOpen()}>
      Cleanup
    </Button>
  </Stack>
</Stack>
```

(`DataUsage` must be added to the icon import; `Storage` is already imported.)

- [ ] **Step 4: Add the two quick-action dialogs**

In the Dialogs section at the bottom of the JSX, add:

```jsx
{quotaAction && (
  <CippApiDialog
    createDialog={quotaDialog}
    title="Set Storage Quota"
    fields={quotaAction.fields}
    api={quotaAction}
    row={siteRow}
    relatedQueryKeys={[`site-live-storage-${siteId}`, `SharePointSiteUsage-${tenantFilter}`]}
  />
)}
{cleanupAction && (
  <CippApiDialog
    createDialog={cleanupDialog}
    title="Start Version Cleanup Job"
    api={cleanupAction}
    row={siteRow}
    defaultvalues={cleanupAction.defaultvalues}
    children={cleanupAction.children}
  />
)}
```

- [ ] **Step 5: Lint**

Run: `npx eslint src/pages/teams-share/sharepoint/site-details.js`
Expected: no errors.

- [ ] **Step 6: Manual smoke check**

With the dev server running, open a site's detail page from the sites list and verify: (a) Actions menu opens and lists Set Storage Quota, Lock / Unlock Site, Edit Site, Delete Site, etc.; (b) "Refresh Live" fetches and shows the Live chip with warning level and lock state; (c) "Set Quota" opens the dialog and a submitted value round-trips (re-run Refresh Live to confirm the new quota).

- [ ] **Step 7: Commit**

```bash
git add src/pages/teams-share/sharepoint/site-details.js
git commit -m "feat: full site actions menu, storage quick actions, and live storage refresh on site-details"
```

---

### Task 3: Dashboard — actionable storage alert rows

**Files:**
- Modify: `src/pages/teams-share/sharepoint/dashboard.js`

**Interfaces:**
- Consumes: existing `/api/ExecSetSiteProperty` (POST, body `SiteId`, `DisplayName`, `tenantFilter`, `StorageMaximumLevelGB`, `StorageWarningLevelGB`) and `/api/ExecSPOVersionCleanup` (POST, body `tenantFilter`, `SiteUrl`, `BatchDeleteMode`, `DeleteOlderThanDays`, `MajorVersionLimit`, `MajorWithMinorVersionsLimit`).
- Produces: `openSiteDialog(site, dialog)` local helper and `actionSite` state; Task 8 adds a fourth button using the same mechanism.

- [ ] **Step 1: Add state, dialogs, and helper**

Add imports to `dashboard.js`:

```jsx
import { useMemo, useState } from "react"; // extend existing
import { IconButton, Tooltip } from "@mui/material"; // extend existing
import { DataUsage, CleaningServices, Launch } from "@mui/icons-material"; // extend existing
import Link from "next/link";
```

Inside `Page()`, after `refreshDialog`:

```jsx
const [actionSite, setActionSite] = useState(null);
const quotaDialog = useDialog();
const cleanupDialog = useDialog();

const openSiteDialog = (site, dialog) => {
  setActionSite(site);
  dialog.handleOpen();
};

// Suggested new quota: current allocation + 25%, rounded up to a whole GB
const suggestedQuota = useMemo(() => {
  if (!actionSite) return {};
  const current = actionSite.storageAllocatedInGigabytes || actionSite.storageUsedInGigabytes || 1;
  const suggested = Math.ceil(current * 1.25);
  return {
    StorageMaximumLevelGB: String(suggested),
    StorageWarningLevelGB: String(Math.floor(suggested * 0.9)),
  };
}, [actionSite]);

const siteDetailsHref = (site) => {
  const params = new URLSearchParams({
    siteId: site.siteId || "",
    displayName: site.displayName || "",
    webUrl: site.webUrl || "",
    rootWebTemplate: site.rootWebTemplate || "",
    ownerPrincipalName: site.ownerPrincipalName || "",
    ownerDisplayName: site.ownerDisplayName || "",
    storageUsedInGigabytes: String(site.storageUsedInGigabytes || 0),
    storageAllocatedInGigabytes: String(site.storageAllocatedInGigabytes || 0),
    fileCount: String(site.fileCount || 0),
    lastActivityDate: site.lastActivityDate || "",
    createdDateTime: site.createdDateTime || "",
    reportRefreshDate: site.reportRefreshDate || "",
  });
  return `/teams-share/sharepoint/site-details?${params.toString()}`;
};
```

- [ ] **Step 2: Add action buttons to each alert row**

In the Storage Alerts card, inside `alertSites.map((site) => { ... })`, after the `<Box sx={{ flex: 1, minWidth: 0 }}>...</Box>` block (still inside the row `Stack`), add:

```jsx
<Stack direction="row" spacing={0.5}>
  <Tooltip title="Increase storage quota">
    <IconButton size="small" onClick={() => openSiteDialog(site, quotaDialog)}>
      <DataUsage fontSize="small" />
    </IconButton>
  </Tooltip>
  <Tooltip title="Run version cleanup">
    <IconButton size="small" onClick={() => openSiteDialog(site, cleanupDialog)}>
      <CleaningServices fontSize="small" />
    </IconButton>
  </Tooltip>
  <Tooltip title="View site details">
    <IconButton size="small" component={Link} href={siteDetailsHref(site)}>
      <Launch fontSize="small" />
    </IconButton>
  </Tooltip>
</Stack>
```

- [ ] **Step 3: Add the two dialogs**

Next to the existing refresh `CippApiDialog` at the bottom:

```jsx
<CippApiDialog
  createDialog={quotaDialog}
  title={`Increase Storage Quota${actionSite ? ` — ${actionSite.displayName}` : ""}`}
  fields={[
    { type: "textField", name: "StorageMaximumLevelGB", label: "Maximum Storage (GB)", required: true },
    { type: "textField", name: "StorageWarningLevelGB", label: "Warning Level (GB, optional — defaults to 90% of max)" },
  ]}
  defaultvalues={suggestedQuota}
  api={{
    type: "POST",
    url: "/api/ExecSetSiteProperty",
    data: {
      SiteId: actionSite?.siteId,
      DisplayName: actionSite?.displayName,
      tenantFilter: currentTenant,
    },
    confirmText: `Set a new storage quota for '${actionSite?.displayName ?? "this site"}'. Values are in GB. The suggested value is 25% above the current allocation. Note: per-site limits only apply when the tenant uses manual site storage limits.`,
    relatedQueryKeys: [`${currentTenant}-SPDashboard-SiteUsage`],
  }}
  row={actionSite ?? {}}
/>
<CippApiDialog
  createDialog={cleanupDialog}
  title={`Version Cleanup${actionSite ? ` — ${actionSite.displayName}` : ""}`}
  fields={[]}
  api={{
    type: "POST",
    url: "/api/ExecSPOVersionCleanup",
    data: {
      SiteUrl: actionSite?.webUrl,
      tenantFilter: currentTenant,
      BatchDeleteMode: 2,
      DeleteOlderThanDays: -1,
      MajorVersionLimit: -1,
      MajorWithMinorVersionsLimit: -1,
    },
    confirmText: `Start a file version cleanup job for '${actionSite?.displayName ?? "this site"}' using the site's version policy (Sync Policy mode). For other cleanup modes, use the action on the Sites page.`,
  }}
  row={actionSite ?? {}}
/>
```

- [ ] **Step 4: Lint**

Run: `npx eslint src/pages/teams-share/sharepoint/dashboard.js`
Expected: no errors.

- [ ] **Step 5: Manual smoke check**

On `/teams-share/sharepoint/dashboard` with a tenant that has alert sites: hover a row, click the quota icon → dialog opens prefilled with suggested GB values; cleanup icon → confirm dialog posts Sync Policy mode; launch icon navigates to site-details.

- [ ] **Step 6: Commit**

```bash
git add src/pages/teams-share/sharepoint/dashboard.js
git commit -m "feat: one-click quota increase, version cleanup, and details link on dashboard storage alerts"
```

---

### Task 4: Backend — extend `ExecSetSiteProperty` (sharing link defaults, restricted access)

**Files:**
- Modify: `/Users/clint/Documents/GitHub/CIPP-API/Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/Invoke-ExecSetSiteProperty.ps1`

**Interfaces:**
- Produces: `POST /api/ExecSetSiteProperty` additionally accepts `DefaultSharingLinkType` (int 0–3), `DefaultLinkPermission` (int 0–2), `AnonymousLinkExpirationInDays` (int, requires `OverrideTenantAnonymousLinkExpirationPolicy: true`), `RestrictedAccessControl` (bool). Consumed by Task 5 frontend actions.

- [ ] **Step 1: Add the new property blocks**

Insert after the Storage Quota block (before the `if ($PropertiesToSet.Count -eq 0)` check):

```powershell
        # Default Sharing Link Type (0=None/tenant default, 1=Direct, 2=Internal, 3=AnonymousAccess)
        $RawLinkType = Get-FieldValue $Request.Body.DefaultSharingLinkType
        if ($null -ne $RawLinkType -and '' -ne $RawLinkType) {
            $LinkTypeLabels = @{ 0 = 'Tenant default'; 1 = 'Direct (specific people)'; 2 = 'Internal (organization)'; 3 = 'Anyone (anonymous)' }
            $LinkTypeValue = [int]$RawLinkType
            if ($LinkTypeValue -notin 0, 1, 2, 3) {
                throw "Invalid DefaultSharingLinkType '$LinkTypeValue'. Valid values: 0 (tenant default), 1 (Direct), 2 (Internal), 3 (AnonymousAccess)"
            }
            $PropertiesToSet['DefaultSharingLinkType'] = $LinkTypeValue
            $ActionDescription = "Set default sharing link type to '$($LinkTypeLabels[$LinkTypeValue])'"
        }

        # Default Link Permission (0=None/tenant default, 1=View, 2=Edit)
        $RawLinkPerm = Get-FieldValue $Request.Body.DefaultLinkPermission
        if ($null -ne $RawLinkPerm -and '' -ne $RawLinkPerm) {
            $LinkPermLabels = @{ 0 = 'Tenant default'; 1 = 'View'; 2 = 'Edit' }
            $LinkPermValue = [int]$RawLinkPerm
            if ($LinkPermValue -notin 0, 1, 2) {
                throw "Invalid DefaultLinkPermission '$LinkPermValue'. Valid values: 0 (tenant default), 1 (View), 2 (Edit)"
            }
            $PropertiesToSet['DefaultLinkPermission'] = $LinkPermValue
            if ($ActionDescription) { $ActionDescription += "; default link permission '$($LinkPermLabels[$LinkPermValue])'" }
            else { $ActionDescription = "Set default link permission to '$($LinkPermLabels[$LinkPermValue])'" }
        }

        # Anonymous link expiration (requires override flag)
        if ($null -ne $Request.Body.AnonymousLinkExpirationInDays -and '' -ne $Request.Body.AnonymousLinkExpirationInDays) {
            $ExpDays = [int]$Request.Body.AnonymousLinkExpirationInDays
            if ($ExpDays -lt 1) { throw 'AnonymousLinkExpirationInDays must be at least 1' }
            $PropertiesToSet['OverrideTenantAnonymousLinkExpirationPolicy'] = $true
            $PropertiesToSet['AnonymousLinkExpirationInDays'] = $ExpDays
            if ($ActionDescription) { $ActionDescription += "; anonymous links expire after $ExpDays days" }
            else { $ActionDescription = "Set anonymous link expiration to $ExpDays days" }
        }

        # Restricted Access Control (requires SharePoint Advanced Management licensing)
        $RawRAC = Get-FieldValue $Request.Body.RestrictedAccessControl
        if ($null -ne $RawRAC -and '' -ne $RawRAC) {
            $RACValue = [bool]$RawRAC
            $PropertiesToSet['RestrictedAccessControl'] = $RACValue
            $ActionDescription = if ($RACValue) { 'Enabled restricted access control (members only)' } else { 'Disabled restricted access control' }
        }
```

- [ ] **Step 2: Update the no-properties error and classify the license error**

Change the `No valid properties specified` throw message to:

```powershell
            throw 'No valid properties specified. Provide one of: LockState, SharingCapability, StorageMaximumLevelGB, DefaultSharingLinkType, DefaultLinkPermission, AnonymousLinkExpirationInDays, RestrictedAccessControl'
```

In the catch block, before building `$Results`, add classification:

```powershell
        if ($ErrorText -match 'license|Advanced Management|not enabled for this tenant') {
            $ErrorText = "This setting requires SharePoint Advanced Management licensing, which this tenant does not appear to have. Original error: $ErrorText"
        }
```

- [ ] **Step 3: Parse check**

Run: `pwsh -NoProfile -Command "$err=$null; [void][System.Management.Automation.Language.Parser]::ParseFile('/Users/clint/Documents/GitHub/CIPP-API/Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/Invoke-ExecSetSiteProperty.ps1', [ref]$null, [ref]$err); $err"`
Expected: no output (no parse errors).

- [ ] **Step 4: Commit (CIPP-API repo)**

```bash
cd /Users/clint/Documents/GitHub/CIPP-API
git add "Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/Invoke-ExecSetSiteProperty.ps1"
git commit -m "feat: ExecSetSiteProperty supports default sharing link, anonymous link expiration, restricted access control"
```

---

### Task 5: Frontend actions — Set Default Sharing Link, Restrict Access

**Files:**
- Modify: `src/components/CippComponents/CippSiteActions.jsx`

**Interfaces:**
- Consumes: Task 4's extended `POST /api/ExecSetSiteProperty`.

- [ ] **Step 1: Add two actions**

In `useCippSiteActions()`, insert after the "Set Sharing Policy" action:

```jsx
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
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/components/CippComponents/CippSiteActions.jsx`
Expected: no errors.

- [ ] **Step 3: Manual smoke check**

From the sites list or site-details actions menu: "Set Default Sharing Link" on a test site succeeds; "Restrict Access to Members" on a tenant **without** Advanced Management returns the classified license guidance message (not a raw error).

- [ ] **Step 4: Commit**

```bash
cd /Users/clint/Documents/GitHub/CIPP
git add src/components/CippComponents/CippSiteActions.jsx
git commit -m "feat: site actions for default sharing link settings and restricted access control"
```

---

### Task 6: Rename site / change URL

**Files:**
- Create: `/Users/clint/Documents/GitHub/CIPP-API/Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/Invoke-ExecSiteRename.ps1`
- Modify: `src/components/CippComponents/CippSiteActions.jsx`

**Interfaces:**
- Produces: `POST /api/ExecSiteRename` — body: `tenantFilter`, `SiteId`, `SiteUrl`, `DisplayName`, optional `NewTitle` (string), optional `NewUrl` (full URL string). Returns `{ Results: "<message>" }`.

- [ ] **Step 1: Create the endpoint**

```powershell
function Invoke-ExecSiteRename {
    <#
    .FUNCTIONALITY
        Entrypoint
    .ROLE
        Sharepoint.Site.ReadWrite
    #>
    [CmdletBinding()]
    param($Request, $TriggerMetadata)

    $APIName = $Request.Params.CIPPEndpoint
    $Headers = $Request.Headers
    $TenantFilter = $Request.Body.tenantFilter
    $SiteId = $Request.Body.SiteId
    $SiteUrl = $Request.Body.SiteUrl
    $DisplayName = $Request.Body.DisplayName
    $NewTitle = $Request.Body.NewTitle
    $NewUrl = $Request.Body.NewUrl
    $SiteLabel = if ($DisplayName) { $DisplayName } else { $SiteUrl }

    try {
        if (-not $TenantFilter) { throw 'tenantFilter is required' }
        if (-not $NewTitle -and -not $NewUrl) { throw 'Provide NewTitle, NewUrl, or both' }

        $SharePointInfo = Get-SharePointAdminLink -Public $false -tenantFilter $TenantFilter
        $ExtraHeaders = @{
            'accept'        = 'application/json'
            'content-type'  = 'application/json'
            'odata-version' = '4.0'
        }
        $Messages = [System.Collections.Generic.List[string]]::new()

        if ($NewTitle) {
            if (-not $SiteId) { throw 'SiteId is required to change the title' }
            $PatchBody = @{ Title = $NewTitle } | ConvertTo-Json -Compress
            $null = New-GraphPOSTRequest `
                -scope "$($SharePointInfo.AdminUrl)/.default" `
                -uri "$($SharePointInfo.AdminUrl)/_api/SPO.Tenant/sites('$SiteId')" `
                -body $PatchBody `
                -tenantid $TenantFilter `
                -type PATCH `
                -AddedHeaders $ExtraHeaders
            $Messages.Add("Title changed to '$NewTitle'. For group-connected sites the site name follows the Microsoft 365 group; rename the group to keep them in sync.")
        }

        if ($NewUrl) {
            if (-not $SiteUrl) { throw 'SiteUrl is required to change the URL' }
            $RenameBody = @{
                SourceSiteUrl = $SiteUrl
                TargetSiteUrl = $NewUrl
            } | ConvertTo-Json -Compress
            $RenameJob = New-GraphPOSTRequest `
                -scope "$($SharePointInfo.AdminUrl)/.default" `
                -uri "$($SharePointInfo.AdminUrl)/_api/SiteRenameJobs?api-version=1.4.7" `
                -body $RenameBody `
                -tenantid $TenantFilter `
                -type POST `
                -AddedHeaders $ExtraHeaders
            $JobState = $RenameJob.JobState
            $Messages.Add("URL change to '$NewUrl' queued (job state: $JobState). SharePoint renames the site in the background; a redirect is created at the old URL. Large sites can take a while.")
        }

        $Results = "Site '$SiteLabel': $($Messages -join ' ')"
        Write-LogMessage -headers $Headers -API $APIName -tenant $TenantFilter -message $Results -sev Info

        return ([HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::OK
            Body       = @{ Results = $Results }
        })
    } catch {
        $ErrorMessage = Get-CippException -Exception $_
        $ErrorText = $ErrorMessage.NormalizedError
        if ($ErrorText -match 'already exists|SiteMoveInProgress|rename job') {
            $ErrorText = "A site already exists at the target URL or a rename is already in progress. Original error: $ErrorText"
        }
        $Results = "Failed to rename site '$SiteLabel'. Error: $ErrorText"
        Write-LogMessage -headers $Headers -API $APIName -tenant $TenantFilter -message $Results -sev Error -LogData $ErrorMessage

        return ([HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::InternalServerError
            Body       = @{ Results = $Results }
        })
    }
}
```

- [ ] **Step 2: Parse check**

Run the parser one-liner from Global Constraints against `Invoke-ExecSiteRename.ps1`. Expected: no output.

- [ ] **Step 3: Add the frontend action**

In `useCippSiteActions()`, insert after the "Edit Site" action:

```jsx
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
```

Add `DriveFileRenameOutline` to the `@mui/icons-material` import in `CippSiteActions.jsx`.

- [ ] **Step 4: Lint + smoke check**

Run: `npx eslint src/components/CippComponents/CippSiteActions.jsx` — no errors.
Manual: rename a test site's title only (verify title changes in SPO admin); queue a URL change on a disposable test site and confirm the job-queued message.

- [ ] **Step 5: Commit (both repos)**

```bash
cd /Users/clint/Documents/GitHub/CIPP-API
git add "Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/Invoke-ExecSiteRename.ps1"
git commit -m "feat: ExecSiteRename endpoint for site title and URL changes"
cd /Users/clint/Documents/GitHub/CIPP
git add src/components/CippComponents/CippSiteActions.jsx
git commit -m "feat: Rename Site action"
```

---

### Task 7: Hub site association

**Files:**
- Create: `/Users/clint/Documents/GitHub/CIPP-API/Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/Invoke-ListHubSites.ps1`
- Create: `/Users/clint/Documents/GitHub/CIPP-API/Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/Invoke-ExecHubSiteAssociation.ps1`
- Modify: `src/components/CippComponents/CippSiteActions.jsx`

**Interfaces:**
- Produces: `GET /api/ListHubSites?tenantFilter=...` → `{ Results: [{ ID, Title, SiteUrl }] }`; `POST /api/ExecHubSiteAssociation` — body `tenantFilter`, `SiteUrl`, `DisplayName`, `HubSiteId` (GUID string) or `Disconnect: true`.

- [ ] **Step 1: Create `Invoke-ListHubSites.ps1`**

```powershell
function Invoke-ListHubSites {
    <#
    .FUNCTIONALITY
        Entrypoint
    .ROLE
        Sharepoint.Site.Read
    #>
    [CmdletBinding()]
    param($Request, $TriggerMetadata)

    $TenantFilter = $Request.Query.tenantFilter ?? $Request.Body.tenantFilter

    try {
        if (-not $TenantFilter) { throw 'tenantFilter is required' }

        $SharePointInfo = Get-SharePointAdminLink -Public $false -tenantFilter $TenantFilter
        # Site-level REST: delegated only (no -AsApp)
        $HubSites = New-GraphGETRequest `
            -scope "$($SharePointInfo.SharePointUrl)/.default" `
            -uri "$($SharePointInfo.SharePointUrl)/_api/hubsites" `
            -tenantid $TenantFilter `
            -extraHeaders @{ 'accept' = 'application/json' }

        $Results = @($HubSites | Select-Object ID, Title, SiteUrl)

        return ([HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::OK
            Body       = @{ Results = $Results }
        })
    } catch {
        $ErrorMessage = Get-NormalizedError -Message $_.Exception.Message
        return ([HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::InternalServerError
            Body       = @{ Results = "Failed to list hub sites: $ErrorMessage" }
        })
    }
}
```

Note: `New-GraphGETRequest` unwraps `value` arrays automatically; if smoke testing shows the raw object instead, use `$HubSites.value`.

- [ ] **Step 2: Create `Invoke-ExecHubSiteAssociation.ps1`**

```powershell
function Invoke-ExecHubSiteAssociation {
    <#
    .FUNCTIONALITY
        Entrypoint
    .ROLE
        Sharepoint.Site.ReadWrite
    #>
    [CmdletBinding()]
    param($Request, $TriggerMetadata)

    $APIName = $Request.Params.CIPPEndpoint
    $Headers = $Request.Headers
    $TenantFilter = $Request.Body.tenantFilter
    $SiteUrl = $Request.Body.SiteUrl
    $DisplayName = $Request.Body.DisplayName
    $Disconnect = [bool]$Request.Body.Disconnect
    $RawHubId = $Request.Body.HubSiteId
    # autoComplete fields may arrive as { label, value }
    $HubSiteId = if ($RawHubId -is [PSCustomObject] -and $null -ne $RawHubId.value) { $RawHubId.value } else { $RawHubId }
    $SiteLabel = if ($DisplayName) { $DisplayName } else { $SiteUrl }

    try {
        if (-not $TenantFilter) { throw 'tenantFilter is required' }
        if (-not $SiteUrl) { throw 'SiteUrl is required' }
        if (-not $Disconnect -and -not $HubSiteId) { throw 'Provide HubSiteId to join a hub, or Disconnect: true to leave' }

        $SharePointInfo = Get-SharePointAdminLink -Public $false -tenantFilter $TenantFilter
        $TargetHubId = if ($Disconnect) { '00000000-0000-0000-0000-000000000000' } else { $HubSiteId }

        # Site-level REST: delegated only (no -AsApp)
        $null = New-GraphPOSTRequest `
            -scope "$($SharePointInfo.SharePointUrl)/.default" `
            -uri "$SiteUrl/_api/site/JoinHubSite('$TargetHubId')" `
            -body '{}' `
            -tenantid $TenantFilter `
            -type POST `
            -AddedHeaders @{ 'accept' = 'application/json' }

        $Results = if ($Disconnect) {
            "Successfully disconnected '$SiteLabel' from its hub site."
        } else {
            "Successfully connected '$SiteLabel' to the selected hub site."
        }
        Write-LogMessage -headers $Headers -API $APIName -tenant $TenantFilter -message $Results -sev Info

        return ([HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::OK
            Body       = @{ Results = $Results }
        })
    } catch {
        $ErrorMessage = Get-CippException -Exception $_
        $ErrorText = $ErrorMessage.NormalizedError
        if ($ErrorText -match 'approval|permission to join') {
            $ErrorText = "This hub requires approval to join, or the connecting account lacks join permission on the hub. Original error: $ErrorText"
        }
        $Results = "Failed to update hub association for '$SiteLabel'. Error: $ErrorText"
        Write-LogMessage -headers $Headers -API $APIName -tenant $TenantFilter -message $Results -sev Error -LogData $ErrorMessage

        return ([HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::InternalServerError
            Body       = @{ Results = $Results }
        })
    }
}
```

- [ ] **Step 3: Parse check both files**

Run the parser one-liner against both new files. Expected: no output for either.

- [ ] **Step 4: Add the frontend action**

In `useCippSiteActions()`, insert after the "Rename Site" action (uses the already-imported `Hub` icon — add `Hub` to the icon import):

```jsx
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
```

- [ ] **Step 5: Lint + smoke check**

`npx eslint src/components/CippComponents/CippSiteActions.jsx` — no errors.
Manual: hub picker populates from a tenant with at least one hub site; join a test site to a hub, verify in SPO admin, then disconnect.

- [ ] **Step 6: Commit (both repos)**

```bash
cd /Users/clint/Documents/GitHub/CIPP-API
git add "Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/Invoke-ListHubSites.ps1" "Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/Invoke-ExecHubSiteAssociation.ps1"
git commit -m "feat: hub site listing and association endpoints"
cd /Users/clint/Documents/GitHub/CIPP
git add src/components/CippComponents/CippSiteActions.jsx
git commit -m "feat: Hub Site Association action"
```

---

### Task 8: Notify site owner

**Files:**
- Create: `/Users/clint/Documents/GitHub/CIPP-API/Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/Invoke-ExecNotifySiteOwner.ps1`
- Modify: `src/components/CippComponents/CippSiteActions.jsx`
- Modify: `src/pages/teams-share/sharepoint/dashboard.js`

**Interfaces:**
- Produces: `POST /api/ExecNotifySiteOwner` — body: `tenantFilter`, `DisplayName`, `SiteUrl`, `OwnerEmail`, `Type` (`StorageCritical` | `Inactivity` | `Custom`), optional `CustomMessage`, optional `StorageUsedGB`, `StorageAllocatedGB`. Sends from the CIPP notification mailbox (partner tenant `me/sendMail`, same as `Send-CIPPAlert`).

- [ ] **Step 1: Create the endpoint**

```powershell
function Invoke-ExecNotifySiteOwner {
    <#
    .FUNCTIONALITY
        Entrypoint
    .ROLE
        Sharepoint.Site.ReadWrite
    #>
    [CmdletBinding()]
    param($Request, $TriggerMetadata)

    $APIName = $Request.Params.CIPPEndpoint
    $Headers = $Request.Headers
    $TenantFilter = $Request.Body.tenantFilter
    $DisplayName = $Request.Body.DisplayName
    $SiteUrl = $Request.Body.SiteUrl
    $OwnerEmail = $Request.Body.OwnerEmail
    $Type = $Request.Body.Type
    $CustomMessage = $Request.Body.CustomMessage
    $UsedGB = $Request.Body.StorageUsedGB
    $AllocatedGB = $Request.Body.StorageAllocatedGB

    try {
        if (-not $TenantFilter) { throw 'tenantFilter is required' }
        if (-not $OwnerEmail) { throw 'OwnerEmail is required — this site has no resolvable owner email' }
        if ($Type -eq 'Custom' -and -not $CustomMessage) { throw 'CustomMessage is required when Type is Custom' }

        $SiteLabel = if ($DisplayName) { $DisplayName } else { $SiteUrl }
        $StorageLine = if ($UsedGB -and $AllocatedGB) {
            $Pct = [math]::Round(([double]$UsedGB / [double]$AllocatedGB) * 100)
            "<p>Current usage: <strong>$UsedGB GB of $AllocatedGB GB allocated ($Pct%)</strong>.</p>"
        } else { '' }

        $Subject, $BodyHtml = switch ($Type) {
            'StorageCritical' {
                "Action needed: SharePoint site '$SiteLabel' is running out of storage",
                "<p>Hello,</p><p>You are listed as the owner of the SharePoint site <a href='$SiteUrl'>$SiteLabel</a>, which is approaching its storage limit.</p>$StorageLine<p>Please review the site's content and delete or archive files that are no longer needed. Old file versions and large media files are common culprits. If the site genuinely needs more space, reply to this email to request a storage increase.</p><p>Thank you,<br/>Your IT team</p>"
            }
            'Inactivity' {
                "Is the SharePoint site '$SiteLabel' still needed?",
                "<p>Hello,</p><p>You are listed as the owner of the SharePoint site <a href='$SiteUrl'>$SiteLabel</a>, which has had no activity for more than 90 days.</p><p>If the site is no longer needed, please let us know so it can be archived or removed. If it is still in use, no action is required.</p><p>Thank you,<br/>Your IT team</p>"
            }
            'Custom' {
                "A message about your SharePoint site '$SiteLabel'",
                "<p>Hello,</p><p>You are listed as the owner of the SharePoint site <a href='$SiteUrl'>$SiteLabel</a>.</p><p>$CustomMessage</p>$StorageLine<p>Thank you,<br/>Your IT team</p>"
            }
            default { throw "Invalid Type '$Type'. Valid values: StorageCritical, Inactivity, Custom" }
        }

        $MailBody = [pscustomobject]@{
            message         = @{
                subject      = $Subject
                body         = @{ contentType = 'HTML'; content = $BodyHtml }
                toRecipients = @(@{ emailAddress = @{ address = $OwnerEmail } })
            }
            saveToSentItems = 'false'
        }
        $JSONBody = ConvertTo-Json -Compress -Depth 10 -InputObject $MailBody
        $null = New-GraphPostRequest -uri 'https://graph.microsoft.com/v1.0/me/sendMail' -tenantid $env:TenantID -NoAuthCheck $true -type POST -body $JSONBody

        $Results = "Notification email ($Type) sent to $OwnerEmail for site '$SiteLabel'."
        Write-LogMessage -headers $Headers -API $APIName -tenant $TenantFilter -message $Results -sev Info

        return ([HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::OK
            Body       = @{ Results = $Results }
        })
    } catch {
        $ErrorMessage = Get-CippException -Exception $_
        $ErrorText = $ErrorMessage.NormalizedError
        if ($ErrorText -match 'MailboxNotEnabledForRESTAPI|mailbox') {
            $ErrorText = "The CIPP service account does not have a usable mailbox to send from. Original error: $ErrorText"
        }
        $Results = "Failed to send owner notification. Error: $ErrorText"
        Write-LogMessage -headers $Headers -API $APIName -tenant $TenantFilter -message $Results -sev Error -LogData $ErrorMessage

        return ([HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::InternalServerError
            Body       = @{ Results = $Results }
        })
    }
}
```

- [ ] **Step 2: Parse check**

Run the parser one-liner against `Invoke-ExecNotifySiteOwner.ps1`. Expected: no output.

- [ ] **Step 3: Add the site action**

In `useCippSiteActions()`, insert after "Get Live Storage" (add `Send` to the icon import):

```jsx
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
```

- [ ] **Step 4: Add the dashboard alert-row button**

In `dashboard.js` (building on Task 3's structure): add `Send` to the icon import, add `const notifyDialog = useDialog();`, add a fourth icon button between Cleanup and View Details:

```jsx
{site.ownerPrincipalName && (
  <Tooltip title="Notify site owner">
    <IconButton size="small" onClick={() => openSiteDialog(site, notifyDialog)}>
      <Send fontSize="small" />
    </IconButton>
  </Tooltip>
)}
```

and the dialog next to the other two:

```jsx
<CippApiDialog
  createDialog={notifyDialog}
  title={`Notify Owner${actionSite ? ` — ${actionSite.displayName}` : ""}`}
  fields={[]}
  api={{
    type: "POST",
    url: "/api/ExecNotifySiteOwner",
    data: {
      tenantFilter: currentTenant,
      DisplayName: actionSite?.displayName,
      SiteUrl: actionSite?.webUrl,
      OwnerEmail: actionSite?.ownerPrincipalName,
      Type: "StorageCritical",
      StorageUsedGB: actionSite?.storageUsedInGigabytes,
      StorageAllocatedGB: actionSite?.storageAllocatedInGigabytes,
    },
    confirmText: `Send a storage-critical notification email to ${actionSite?.ownerPrincipalName ?? "the site owner"} from the CIPP notification mailbox?`,
  }}
  row={actionSite ?? {}}
/>
```

- [ ] **Step 5: Lint + smoke check**

`npx eslint src/components/CippComponents/CippSiteActions.jsx src/pages/teams-share/sharepoint/dashboard.js` — no errors.
Manual: send a StorageCritical notification to a site you own; confirm the email arrives with correct site name, link, and usage numbers. Verify a site with no owner hides the action (list menu) and button (dashboard).

- [ ] **Step 6: Commit (both repos)**

```bash
cd /Users/clint/Documents/GitHub/CIPP-API
git add "Modules/CIPPHTTP/Public/Entrypoints/HTTP Functions/Teams-Sharepoint/Invoke-ExecNotifySiteOwner.ps1"
git commit -m "feat: ExecNotifySiteOwner endpoint — templated owner emails via CIPP notification mailbox"
cd /Users/clint/Documents/GitHub/CIPP
git add src/components/CippComponents/CippSiteActions.jsx src/pages/teams-share/sharepoint/dashboard.js
git commit -m "feat: Notify Site Owner action on sites and dashboard storage alerts"
```

---

### Task 9: Final verification and version bump

**Files:**
- Modify: `public/manage365-version.json`

- [ ] **Step 1: Full build**

Run: `cd /Users/clint/Documents/GitHub/CIPP && npx next build --no-lint 2>&1 | tail -5`
Expected: build succeeds.

- [ ] **Step 2: Regression checklist (manual, against a test tenant)**

- Sites list page: every pre-existing action still works (spot-check Add Member, Set Storage Quota, Edit Site, Recycle Bin — these cover fields/children/customDataformatter/customComponent action variants).
- Site-details: actions menu against a **group-connected** site and a **non-group** site; guest-owner site (`#EXT#` in owner UPN) doesn't break the page.
- Quota action on a tenant using **automatic** storage management returns a readable message.
- Dashboard: all four alert-row buttons.

- [ ] **Step 3: Bump version**

Read `public/manage365-version.json` and bump the **minor** version (e.g. `5.6.1` → `5.7.0`), keeping the file's existing shape.

- [ ] **Step 4: Commit**

```bash
cd /Users/clint/Documents/GitHub/CIPP
git add public/manage365-version.json
git commit -m "chore: bump Manage365 version for SharePoint site admin actions expansion"
```
