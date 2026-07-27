# Upstream Delta — CIPP (frontend) — 2026-07-27

Cycle type: **Major delta** (upstream 10.6.1 → **10.6.4 + v10.7.0**).
Sync base: `17ed2b396` (upstream/main at last cycle, July 13) → `upstream/main` @ `44ac45831`.
96 commits in range (48 non-merge + release squashes from the CyberDrain org
transition — see API delta doc for the squash mechanics).

Net delta: 109 files, +7,861 / −590.

## Triage — Apply (cherry-pick)

| Upstream | Subject | Notes |
|---|---|---|
| `48595d74c` | default assignment mode append | API pair `b2985a6f0` |
| `ffbca69a5` | registration campaign page + auth-methods tabs | API pair `5b42363cd`; new page |
| `082fe069c` | smart lockout Enforce | standards.json curated adapt |
| `5066c5ff6` | align standards.json with API | curated adapt |
| `0f4ddb085` | setup-node 7 | |
| `f1ce6b543` | prettier 3.9.5 | |
| `7dad7bcab` | diff 9.0.0 | |
| `16ad6b9b2` | restore typescript devDependency | eslint flat config needs it |
| `01d33ac1b` | anonymization alert for report pages | new CippAnonymizedReportAlert + report pages |
| `bfc83afd7` | SP site (in)activity report | API pair `ffab43e1a` |
| `f2f62df42` | custom test save/run UX | |
| `c7b079c97` | offcanvas markdown table scroll | |
| `21003f7af`, `54153656f`, `155b6b073` | GDAPRoles.json additions/fixes | fork still uses GDAPRoles for GDAP invites (JIT uses JitAdminRoles.json) |
| `3ac0596f0` | mailbox quota alert types | API pair `ed577f689` |
| `0b879d130` | resource accounts standard | curated standards.json adapt |
| `3bea4e3b2` | app-approval permission set refresh | API pair `fd245427d` |
| `1f4dc9175` | AllowedToCreateGroups | curated standards.json adapt |
| `c259fe4ea` | JSON validation workflow | |
| `b4373e540` | CSP licenses #6390 | API pair `d348de650` |
| `341b4555e` | GDAP age group option | API pair `4ee94dcba` |
| `01180c005` | shadow AI tools alert (alerts.json + ShadowAIReportButton) | API pair `206f9b155` |
| `c4bf26c4d` | MEM single compare policy result | API pair `e0060db51` |
| `f777572bf` | applicationTemplateId for cloud sync SP | tenants edit |
| `fcf936dd d`+`84584329f` | SharePoint templated deployments v1 + steps | new pages/components/schemas; menu wiring = adapt into fork config.js (protected) |
| `da107ebf2` | autopilot profile display name validation | API pair `d14159589` |
| `c5278d18a` | custom branding fix | inspect against fork branding (protected) before taking |
| `fc6a06db6` | cache buster version | |
| `b599f7ef6`+`bdf0a662f` | container settings | **Skip** — fork has no CippContainerManagement |

## Triage — Adapt (protected fork files)

| Upstream | File(s) | Notes |
|---|---|---|
| `ceebe9fcd` | CippAddEditUser.jsx | fork FormSection-styled page |
| `eff527422` | CippUserActions.jsx | 18 fork commits on this file |
| `35e83de15` | PrivateRoute.js | fork fast path — port 401-flash fix surgically |
| `f27ad344d` | settings/tenants.js | fork tenant workflows protected |
| squash | CippApiResults.jsx | fork error-guidance classification — surgical diff |
| squash | config.js / side-nav.js menu entries | fork nav protected — add SP templates / permissions report entries manually |
| squash | standards.json refresh | curated — only standards with fork implementations |

## Triage — squash-only content (port by path diff, paired with API)

| Area | Outcome | Notes |
|---|---|---|
| SharePoint permissions report family (`permissions-report` page, CippPdf report primitives, `PermissionsReportButton`, `SharingReportButton`, `CippSharePointPermissionEditor`, `CippLibraryPermissionsDialog`, `CippCheckUserAccessDialog`, sharepoint.svg/teams.svg logos + icons) | **Apply** | pairs with API SP permissions family |
| SP templates (builder, deploy drawer, `CippMultiQueueTracker`, `CippQueryRefreshButton`, sharePointTemplateSchemas.json, teams-share/sharepoint-templates pages) | **Apply** | |
| `CippPolicyCompareDialog` / `CippPolicyDiffTable` + compare-policies page | **Apply** | |
| Copilot pages updates (usage report, settings) | **Apply** | fork took Copilot intake 07-15 |
| Teams business-voice / teams-activity page changes | **Defer** | pairs with deferred API Teams V2 |
| SSO dialogs (`SsoMigrationDialog`, `ForcedSsoMigrationDialog`, `bcc920892`) | **Defer** | SSO family intake |
| `custom-domains.js` super-admin + `CippAppServiceDomains` | **Defer** | with API ExecAppServiceDomains |
| `dashboardv1.js` | **Skip** | fork removed dashboard v1 |
| `dashboardv2`, `CippUserActions`, mailboxes page, `CippAutocomplete`, `CippTenantSelector`, `CippFormPage`, `get-cipp-formatting` squash diffs | **Review individually** | protected/heavily customized — take only clean fixes |

## Triage — Skip / Already implemented

| Upstream | Outcome | Reason |
|---|---|---|
| `e502965a5` | Already | fork never had Detect_Duplicate_Issues.yml |
| `1b48ea16b` axios, `18400b05f` dompurify | Already | fork at 1.18.1 / 3.4.12 from July 24 security pass |
| `cc3903ce0`, `88c0487cf` | Skip | version bumps (fork versioning protected) |
| `bcc920892` | Defer | SSO |
| `b599f7ef6`, `bdf0a662f` | Skip | container management not in fork |
