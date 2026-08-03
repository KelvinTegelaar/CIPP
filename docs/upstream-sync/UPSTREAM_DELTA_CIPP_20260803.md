# Upstream Delta — CIPP (frontend) — 2026-08-03

Cycle type: **Light/medium delta** (upstream **10.7.3 → 10.7.5**).
Sync base: `d72c1e21b` (upstream/main at 07-28 cycle) → `upstream/main` @ `274880fd0`.
Branch: `manage365/upstream-sync-cipp-20260803`
Backup tag: `backup/pre-upstream-sync-cipp-20260803`

3 merge commits (CyberDrain #103, #115, #132). Net: 19 files, +443 / −60.

## Commits

| SHA | Date | Subject |
|-----|------|---------|
| `f757a44fe` | 2026-07-29 | Merge PR #103 from CyberDrain/dev |
| `b49e04a51` | 2026-07-29 | Merge PR #115 from CyberDrain/dev |
| `274880fd0` | 2026-07-30 | Merge PR #132 from CyberDrain/dev → **10.7.5** |

## Triage — Apply

| Path / theme | Notes |
|---|---|
| `CippAlertSnoozeDialog.jsx`, `snooze-alert.js`, `snoozed-alerts.js` | Optional snooze reason field |
| `CippIntuneDeviceActions.jsx` | "Add to Group" action — pair with API `Invoke-EditGroup` AddDevice |
| `CippAddGroupForm.jsx` | `disableNesting` switch — pair with API `New-CIPPGroup` |
| `preferences.js`, `dashboardv2/*`, `CippReportToolbar.jsx` | Default Home test suite preference |
| `src/data/M365Licenses.json` | License catalog update |
| `partner-webhooks.js` | Stale webhook URL warning — pair with `Get-CIPPHostname` |

## Triage — Adapt

| Path | Notes |
|---|---|
| `groups/edit.jsx` | Fork redesigned page — port `disableNesting` surgically, do not replace whole file |

## Triage — Skip / Defer

| Path | Outcome | Why |
|---|---|---|
| `CippSSOSettings.jsx` | **Skip** | SSO family — SWA/Craft decision 2026-07-15 |
| `CippAppServiceDomains.jsx` | **Defer** | Fork has no custom-domains page; App Service hosting N/A |
| `package.json` / `version.json` / `manifest.json` | **Chore** | Baseline bump via `Update-Version.ps1` at end |

## Already present / N/A

- Fork already has `CippAlertSnoozeDialog`, `CippIntuneDeviceActions`, `CippReportToolbar`, `CippAddGroupForm`, partner-webhooks, preferences, dashboardv2 — taking diffs only.
