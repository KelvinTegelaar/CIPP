# SharePoint Site Admin Actions Expansion — Design

**Date:** 2026-07-27
**Repos:** CIPP (frontend), CIPP-API (backend)
**Status:** Approved

## Problem

Site storage management actions (Set Storage Quota, Get Live Storage, Lock/Unlock, etc.) exist only on the SharePoint sites list page (`/teams-share/sharepoint`). The site-details page has none of them, and the dashboard's "Storage Alerts" card lists critical sites with no way to act on them. Additionally, several high-value admin capabilities (rename, hub association, per-site sharing defaults, restricted access, owner notification) are missing entirely.

## Goals

1. Full site-action parity on the site-details page, without duplicating action definitions.
2. One-click remediation from the dashboard's Storage Alerts card.
3. On-demand live (authoritative) storage data on site-details.
4. New admin actions: default sharing link settings, restricted access, site rename/URL change, hub site association, notify site owner.

## Non-Goals

- Per-site CIPP alert scripts (tenant-level `SharePointQuota` alert remains the only scheduled alert; dashboard remediation covers the per-site case for now).
- A standard enforcing default site storage limits.
- Changes to the MB-based `CippEditSitePropertiesForm` (stays as-is; GB-based quota dialog is the primary path).

## Design

### 1. Shared site actions module (frontend)

- New `src/components/CippComponents/CippSiteActions.jsx` exporting `useSiteActions()`, returning the actions array currently defined inline in `src/pages/teams-share/sharepoint/index.js` (~19 actions).
- `index.js` consumes it unchanged as table actions.
- `site-details.js` renders the same array via an "Actions" button in the hero (menu → `CippApiDialog` per action, `row` = the merged site object the page already builds from query params + `ListSites` cache).
- Row-dependent fields (`SiteId`, `webUrl`, `rootWebTemplate`, `ownerPrincipalName`, `displayName`) already exist on site-details' merged object.
- Existing bespoke dialogs on site-details (Invite Guest, Member Audit) are untouched.

### 2. Site-details storage panel upgrades

- Quick action buttons on the Storage card: **Set Storage Quota** and **Version Cleanup**.
- **"Refresh Live" button**: calls `/api/ListSiteLiveStorage` on demand; panel swaps to authoritative Admin-API values (used, quota, warning level, lock state) with a "Live" chip and timestamp. Report values remain the default on page load.

### 3. Actionable dashboard storage alerts

Each row in the "Storage Alerts" card on `/teams-share/sharepoint/dashboard` gets four inline icon actions:

- **Increase Quota** — Set Storage Quota dialog, prefilled with suggested new limit (current allocation +~25% rounded, warning at 90%).
- **Version Cleanup** — existing `ExecSPOVersionCleanup` dialog.
- **Notify Owner** — new `ExecNotifySiteOwner` endpoint (see §5).
- **View Details** — link to site-details with row query params.

No data changes needed; cache rows carry `siteId` and `displayName`.

### 4. Extended per-site properties (extend `ExecSetSiteProperty`)

Two new actions via the existing Admin REST PATCH `SPO.Tenant/sites('{id}')` (delegated, AdminUrl scope):

- **Set Default Sharing Link** — `DefaultSharingLinkType`, `DefaultLinkPermission`, anonymous-link expiration.
- **Restrict Access to Members** — `RestrictedAccessControl` toggle. Requires SharePoint Advanced Management licensing; backend classifies the license error and `CippApiResults` renders remediation guidance.

### 5. New backend endpoints (CIPP-API)

| Endpoint | Purpose | API / auth |
|---|---|---|
| `Invoke-ExecSiteRename` | Change title and/or URL. Title-only → existing property PATCH; URL change → `SiteRenameJobs` Admin REST job with status reporting. | Admin REST, delegated |
| `Invoke-ListHubSites` | List hub sites for the picker. | Admin/site REST |
| `Invoke-ExecHubSiteAssociation` | Join a hub (`JoinHubSite`) or disconnect (empty GUID). | Site REST |
| `Invoke-ExecNotifySiteOwner` | Email the owner a templated notice (storage critical / inactivity / custom) with current usage numbers, via Graph `sendMail`. | Graph, app-only |

Frontend actions: **Rename Site**, **Hub Association** (hub picker + disconnect option), **Notify Owner** (site-details + dashboard alert rows).

Permissions: verify Graph `Mail.Send` (Role) in `SAMManifest.json`; add if missing and note CPV refresh requirement. Exact SPO REST endpoint versions pinned during implementation planning.

### 6. Error handling and units

- All new actions classify known failures in backend catch blocks (license missing, rename job conflicts, hub permission errors, quota set on automatic-storage-management tenants) into actionable messages per the error-guidance pattern.
- All user-facing quota inputs are **GB**.
- Quota dialog help text states that per-site limits only apply when the tenant uses manual site storage limits.

### 7. Testing checklist

- Every action against both group-connected and non-group sites.
- Guest-owner sites (UPNs with `#EXT#`).
- Tenant on automatic storage management → quota action returns classified guidance.
- Rename job on a group-connected site; hub join/leave round-trip; notify-owner where owner is a shared mailbox.
- Version bump: one **minor** bump in `public/manage365-version.json` for the full feature set.

## Rollout order

1. Shared actions module + site-details actions/storage panel + dashboard alert actions (pure frontend).
2. Extended per-site properties (sharing defaults, restricted access).
3. New endpoints (rename, hub, notify owner) + their frontend actions.
