<p align="center">
  <img src="public/Main%20logo%20-CMYK.png" alt="Manage365 Logo" height="80">
</p>

<h1 align="center">Manage365</h1>

<p align="center">
  An enhanced Microsoft 365 multi-tenant management portal based on the <a href="https://cipp.app">CIPP</a> open-source project.
</p>

---

> **Last synced with upstream:** August 2026 — v10.7.5 baseline; Manage365 **v5.32.0** adds MCP server capability (feature-flagged off) and removes dead super-admin tabs (CIPP Users / SSO / Container). Prior 10.7.5 sync: AzBobbyTables large-entity wrappers, Intune template drift fixes, device Add-to-Group, disableNesting, snooze reason, partner webhook hostname warning, audit log V2.
>
> Manage365 is built on top of the [CyberDrain Improved Partner Portal (CIPP)](https://cipp.app). CIPP is actively developed and may implement similar features over time. Upstream changes are merged selectively to preserve Manage365-specific UI and workflows. See [Upstream Integration](#upstream-integration) below.

## What is Manage365?

Manage365 is a Microsoft 365 multi-tenant administration portal designed for Microsoft Partners and IT administrators. It provides a centralized interface for managing users, teams, SharePoint, Exchange, security, compliance, Intune, Dynamics 365, and more across all of your Microsoft 365 tenants.

Manage365 inherits the full feature set of CIPP and extends it with additional capabilities focused on deeper Teams, SharePoint, OneDrive, and Dynamics 365 management, centralized cross-tenant access governance, external collaboration controls, and tenant-level SharePoint and Teams policy management -- areas where day-to-day administration often requires switching between multiple Microsoft portals.

For information about the upstream CIPP project, visit [cipp.app](https://cipp.app) and [docs.cipp.app](https://docs.cipp.app).

---

## Features from CIPP (Upstream)

Manage365 includes the complete CIPP feature set:

### Identity Management
- User administration (create, edit, delete, offboard with orchestrator-based batch processing and scheduler-routed task tracking)
- Schedulable user edits — apply an edit now or schedule it for a future date via the task scheduler
- Policy-aware Temporary Access Pass creation (lifetime/usage options validated against the tenant's TAP policy)
- User form validation with field-level constraints (max length, required, pattern)
- User patching with manager and sponsor property support
- Vacation mode wizard with mailbox permissions, calendar delegation, and out-of-office scheduling with timezone-aware response formatting
- Offboarding wizard with dialog mode, table view for all tenant offboarding tasks, scheduler integration for proper task tracking and alerting, and custom tests
- Bulk guest invitation
- Risky users monitoring
- Group management with templates, group detail page, and deploy group template button
- Device management (Entra ID devices with NinjaOne enrichment, cross-linked to Intune)
- Per-user device view on the View User page (Entra device cards and Intune managed devices in one place)
- Role management and JIT Admin with usage location support and TAP lifetime policy bounds
- Reports: MFA (with role-targeted CA policy detection), inactive users, sign-in logs, Entra Connect, risk detections, BEC remediation
- BEC remediation checks include inbox-rule change auditing, sent-message review, and trusted/blocked sender changes (Manage365 implements the backend data collection for the sender check)
- Copilot & AI management pages

### Tenant Administration
- Multi-tenant management and configuration
- Upgraded tenant onboarding experience with type selection and Indirect Reseller Link support
- Alert configuration and audit logs (group membership change, Defender severity filtering, inactive users, TAP creation alerts)
- Alert snooze dialog and snoozed alerts management
- Dashboard Alerts card — active and snoozed alert instances at a glance with per-item snooze
- Secure Score monitoring
- Application management, consent requests, and app management policies
- App registration and enterprise app detail pages with permissions viewer
- GDAP relationship management with GDAP trace and AI Administrator role support
- Tenant group management with usage reporting
- Standards alignment and drift detection (including device registration local admin controls, CIS7 alignment, and CA template package tags)
- Standards with custom variable support, requiredCapabilities filtering, and license capability presets
- Group-based licensing for security groups and templates
- Alert-only license exclusions (exclude licenses from alerting without removing them from standards checks)
- New standards: Restrict User Device Registration, AdminSSPR
- Standards dialog with enabled/disabled status filter and severity color mapping
- Best Practice Analyser and Domains Analyser (with DKIM selector rotation)
- Conditional Access policy management, templates, and vacation mode with authentication flow selection
- Licence reporting and management with granular control and dynamic license backfill
- CSP license reporting page for Cloud Solution Provider scenarios
- BitLocker recovery key search and caching
- Feature flags
- Reusable settings standards with templates
- Configuration backup with restore wizard (type-filtered restoration with row count reporting)
- GitHub import/export for templates and cache explorer
- Incident report and attachment options
- Log retention settings
- Dashboard v2: report toolbar, custom dashboards, responsive layout, and inline universal search (legacy Dashboard v1 removed; `/dashboardv1` redirects to v2)
- Report builder with templates and generated reports
- Executive report with menuItem variant support

### Security & Compliance
- Incident and alert management (including MDO alerts)
- Defender status, deployment, and TVM vulnerabilities
- Defender alerts with severity filtering
- Device compliance reporting
- Customer Lockbox
- eDiscovery case management with legal holds, content searches, and exports (see Manage365 features below)

### Endpoint Management
- Application management and deployment queue (including Win32/custom apps)
- Application assignment filter options
- Managed device administration with NinjaOne hardware enrichment (CPU, RAM, agent status)
- Device detail page with Intune policy setting descriptions (hover to see what each setting does) for both Settings Catalog and Administrative Templates
- DEP sync
- Autopilot device management, profiles, and status pages
- Configuration and compliance policies with templates
- Intune reusable settings deployment and templates with assignment verification
- App protection policies and assignment filters
- Script management
- Reports: device score analytics, work from anywhere, autopilot deployments, discovered apps

### Email & Exchange
- Mailbox administration (active, deleted, rules, permissions)
- Contact management with templates
- **Quarantine management** -- advanced Defender-style filtering, server-side pagination (default 7 days / 100 rows), bulk actions, CSV/JSON export, lazy detail metadata, and preserved EML preview, message trace, and Threat Explorer deep links (see [Quarantine Portal](#quarantine-portal-manage365-v5130) below)
- Restricted user management
- Tenant Allow/Block Lists
- Retention policies and tags
- Transport rules and connectors with templates
- Safe Links policies and templates
- Spam filter and connection filter management
- SendFromAlias standard (enable/disable)
- Resource management (rooms, equipment, room lists)
- Message trace, mailbox restores, message viewer
- Reports: mailbox statistics, activity, CAS settings, permissions, calendar permissions, mailbox forwarding, anti-phishing, malware filters, safe attachments, GAL
- Queue tracking for report generation

### Tools
- Graph Explorer with simple filter UI
- Universal Search v2 in the top navigation (Pages default on magnifier; Cmd+K for pages, Cmd+Shift+F for users) plus dashboard inline search
- Application approval workflow
- Tenant and IP lookup
- Domain health checks with AutoDiscover validation
- Dark web breach lookups (tenant and individual)
- Template library and community repositories
- Task scheduler with label-based action filtering
- Custom tests with result mode options (Auto, AlwaysPass, AlwaysInfo, AlwaysInvestigate)
- Guest account disable support with sign-in audit fallback
- Script editor improvements
- Super admin pages relocated to /cipp/advanced/super-admin/

### Settings & Administration
- Application settings and integrations (including PWPush with CloudFlare Tunnel and default passphrase support)
- SIEM settings with SAS token generation for log table access
- SAM service principal lock configuration
- Setup wizard and onboarding
- Enhanced bookmark management with sidebar, drag-and-drop reordering, lock, and sort options
- Compact navigation mode for denser sidebar layout
- Resizable table columns across all data tables, with upstream table virtualization and column-cache optimizations while preserving Manage365 mobile card views
- Tenant selector hotlinks support customerId (GUID) and initialDomainName in addition to defaultDomainName
- PWA support with Chrome install option for desktop app experience
- Logbook with severity color mapping
- Custom data / directory extensions
- Super admin tools (tenant mode, exchange cmdlets, timers, table maintenance)

---

## Features Unique to Manage365

The following capabilities have been developed specifically for Manage365 and are not available in upstream CIPP as of the date shown above.

### Visual Card Views & Modern UI

CIPP uses table-only views for listing data. Manage365 adds card view alternatives across every major list page -- Users, Groups, Teams, Mailboxes, Contacts, Devices, Applications, SharePoint Sites, OneDrive, and more. Cards surface key status badges, metadata, and up to 8 quick-action buttons directly on each item, so common tasks are one click away without opening a detail page. Standardized card widths, meaningful icons (OS-aware device icons, entity-type icons), and consistent badge design provide a polished, scannable interface. Card view loading is optimized to only show skeletons during initial data fetch; background refetches do not blank already-loaded cards.

### Mobile-Responsive Design

Comprehensive mobile responsiveness throughout the application: responsive data tables that adapt to screen size, mobile-friendly toolbars with compact controls, sticky wizard step buttons, a mobile tenant selector in the top navigation, and card views optimized for touch. The entire interface is usable on tablets and phones without horizontal scrolling.

### Applied Standards Enhancements

Manage365 extends upstream Applied Standards with license-aware compliance reporting:

- **Missing-license visibility** -- standards blocked by licensing show warnings and dedicated filter chips (License available / License not available)
- **Corrected scoring** -- combined compliance score uses ratio-based math (compliant + license-blocked vs scored standards) instead of additive percentages that could exceed 100%
- **Drift integration** -- drift-template types and `createDriftManagementActions` for accepted deviations and customer-specific overrides
- **Fork API compatibility** -- frontend normalizes `{ Results }` template responses so standards load reliably across API versions

### Enhanced Detail Pages

Manage365 extends upstream's detail pages with significantly richer, purpose-built interfaces for key entities:

- **SharePoint Sites** -- storage monitoring, member and administrator management (including non-group-connected sites), guest invitation with domain restriction diagnostics and one-click quick-fix, cross-linking to Teams, Create Team from Site, and direct file browser access
- **Teams** -- member/owner management, channel management (including private/shared channel members with per-channel file browsing), app management, interactive toggle-chip settings for member permissions, guest permissions, messaging, and fun settings, plus guest invitation with Teams-specific diagnostics and direct file browser access at both team and channel level
- **Groups** -- hero overview by group type, member/owner/contact management, editable properties, interactive toggle-chip settings, dynamic membership rule display, on-premises sync awareness, and add member to multiple groups at once from the groups list page (extends upstream's group page)
- **Mailboxes / User Exchange Tab** -- mailbox type identification, aliases, archive status, direct link to Exchange settings, clickable external mail restriction tiles (independently block/allow inbound or outbound external email with confirmation dialogs and consequence warnings), one-click spam block clearing when a mailbox has been flagged by Microsoft for suspected spam activity, and **interactive hold management** -- toggle Litigation Hold and Retention Hold on/off directly from the Exchange info card with confirmation dialogs, data loss warnings, and optional duration (days) for Litigation Hold; read-only holds (eDiscovery, In-Place, Compliance Tag, Purview Retention) display with Purview portal guidance
- **Contacts** -- editable properties form with on-premises sync awareness
- **Users (View User)** -- Entra device cards and Intune managed devices combined on one page (replaces the separate per-user devices tab)
- **Entra Devices** -- OS-aware hero, source presence chips (Entra, Intune, NinjaOne), NinjaOne hardware enrichment, quick actions (enable/disable, BitLocker, delete)
- **MEM Devices** -- compliance-colored hero, NinjaOne hardware enrichment, categorized quick actions (sync, reboot, rename, LAPS, BitLocker, retire, delete), NinjaOne data merged into device listings (extends upstream's device page)
- **Applications** -- assignment details, install experience, detection rules, and assignment quick actions

### Teams Business Voice Management

A comprehensive voice management section with dedicated pages for each component of the Teams telephony stack:

- **Phone Numbers** -- card and table views with assignment status, assigned user displayed prominently, number type, emergency location, and quick actions to assign/unassign users and set emergency locations
- **Call Queues** -- view all call queues with routing method, agent counts, overflow and timeout settings; detailed off-canvas view with agent list, conference mode, and music/greeting configuration
- **Auto Attendants** -- view all auto attendants with voice response status, operator, language, and timezone; detailed off-canvas view with business hours and after-hours call flows, menu options, and holiday schedules
- **Dial Plans** -- view all tenant dial plans with normalization rule counts; detailed off-canvas view with full rule list showing match patterns and translations

### File Management

- **Tenant-wide file search** -- search across all SharePoint sites and OneDrive accounts in a tenant using Microsoft's KQL syntax. Filter by file name, type, author, date, path, and more. Results include a copy-link button for sharing direct file URLs with end users, a browse-to-location button to jump into the file browser, and an open-in-SharePoint link. Built-in search tips guide users through KQL operators and combined filters.
- **File browser** for any user's OneDrive or SharePoint site -- navigate folders, download, rename, move, copy, delete files, and create folders without leaving the portal. Includes a location switcher to jump between SharePoint sites or OneDrive users without returning to the landing page. Direct "Browse Files" links are available from Team detail pages, individual channel rows, and SharePoint site detail pages, opening the file browser pre-loaded to the correct site.
- **Cross-drive transfer wizard** -- move or copy files and folders between OneDrive accounts and SharePoint sites with a visual destination browser. Supports single-item and bulk transfers with per-item progress tracking (pending, in progress, done, skipped, failed) displayed in a live status table.
- **Conflict resolution** -- three options when items already exist at the destination:
  - **Rename** (default) -- Graph API automatically appends a numeric suffix to avoid conflicts
  - **Replace** -- deletes the existing item at the destination before copying, ensuring a clean overwrite for both files and folders
  - **Skip duplicates** -- files that already exist at the destination are skipped; folders that already exist are intelligently merged rather than skipped entirely. A recursive comparison checks whether the destination folder's contents fully match the source. Fully matching folders are skipped instantly. Partially-copied folders are merged: only the missing files and subfolders are copied into place while already-existing items are left untouched. This enables resuming a previously interrupted transfer without re-copying everything.
- **Frontend pre-check optimization** -- when skip duplicates is selected, the destination contents are fetched once upfront and duplicate files are marked as skipped immediately in the UI without making individual backend calls, providing instant feedback before the transfer begins
- **Verified transfers** -- cross-drive copy and move operations poll the Graph API monitor URL for completion, then verify the destination item exists and matches the source in size before reporting success. For moves, the source is only deleted after verified copy completion to prevent data loss
- **Folder compare** -- side-by-side recursive comparison of any two folder locations (OneDrive or SharePoint). A two-panel dialog lets users pick a source and destination, then runs a depth-limited diff that returns every difference: items only in the source, items only in the destination, and files with differing sizes. Results are displayed in a flat table with status chips, size columns, and checkbox selection. Users can select any subset of differing items and copy them to the other location in bulk, with per-item progress tracking. Matching file counts are shown in summary chips so users can quickly gauge how much the two locations overlap
- **Temp file cleanup wizard** -- a guided 5-step wizard to find and remove temporary and junk files from SharePoint sites and OneDrive accounts:
  - **Flexible scope** -- scan a single SharePoint site, a specific user's OneDrive, all SharePoint sites, or all OneDrives in a tenant
  - **Configurable filters** -- select which file types to target: Office temp files (~$*), .TMP/.temp files, zero-byte files, system junk (Thumbs.db, .DS_Store, desktop.ini), and backup files (.bak, .old)
  - **Recursive scanning** -- searches all folders up to 10 levels deep with progress feedback
  - **File selection** -- review scan results in a searchable table with per-file checkboxes, bulk select/deselect, and type-based filtering
  - **Double verification** -- checkbox confirmation plus button click required before any deletion
  - **Safe deletion** -- files are moved to the SharePoint/OneDrive recycle bin (93-day recovery) rather than permanently deleted
  - **Detailed results** -- per-file success/failure status with actionable error messages

### SharePoint Admin Dashboard

A dedicated SharePoint dashboard under Teams & SharePoint > SharePoint > Dashboard providing at-a-glance visibility into tenant storage health and site administration:

- **Key Metrics** -- tenant storage used/total, total sites, total files, and inactive site count
- **Storage Charts** -- tenant quota donut (used vs free), storage breakdown by site type (Communication, Group-Connected, Classic), and top 10 sites by storage consumption as a bar chart
- **Storage Alerts** -- sites approaching storage limits (>75% and >90%) sorted by severity with colored chips
- **Inactive Sites** -- sites with no activity in 90+ days, sorted by storage used to help identify cleanup candidates
- **Sharing Configuration** -- tenant-level external sharing settings, default link type, resharing policy, and link expiration at a glance
- **Recently Created Sites** -- new sites from the last 30 days

Data is cached in the CIPP reporting database and refreshed daily during the scheduled cache cycle. A manual "Refresh Data" button triggers an on-demand cache update. The dashboard gracefully handles the first visit before any data is cached with a clear empty state and refresh prompt.

### SharePoint Recycle Bin

Manage and recover deleted SharePoint sites with retention tracking, visual expiration warnings, one-click restore, and permanent delete with appropriate safety warnings.

### Cross-Tenant Access & External Collaboration Governance

Centralized management of Microsoft Entra cross-tenant access policies, B2B collaboration settings, and external identity controls -- settings that are otherwise only manageable in the Entra portal and difficult to standardize across clients:

- **Overview Dashboard** with health scoring and policy summary
- **Default Policy Editor** for B2B Collaboration, Direct Connect, Inbound Trust, Tenant Restrictions v2, and Automatic User Consent
- **Partner Organizations** management with per-partner overrides and reverse tenant name lookup
- **External Collaboration Settings** for guest invite restrictions, guest access levels, and domain allow/deny lists
- **Configuration Health & Conflict Detection** -- automated analysis across all cross-tenant settings layers with specific recommendations and direct links to fix issues
- **Security Baseline Templates** -- create, apply, and reuse cross-tenant security configurations across tenants
- **Standards Integration** -- 9 new standards (12 total covering the full cross-tenant surface) enabling drift detection, automated remediation, and alerting through the existing CIPP Standards framework

### Tenant-Level Policy Management

Dedicated settings pages for policies that normally require switching between multiple Microsoft admin portals:

- **SharePoint Sharing Settings** -- external sharing level, domain restrictions, default link type, anonymous link controls, and resharing behavior
- **Teams Tenant Settings** -- federation and external access, guest access, cloud storage providers, meeting policy, messaging policy, and meeting background management, organized in a tabbed interface with per-section save. The meeting backgrounds tab lets administrators enable organization-wide custom backgrounds, view currently configured images, assign branding policies to individual users, and links directly to the Teams Admin Center for image upload (Microsoft does not expose a public API for background image upload). Includes image requirement guidance with dimension warnings.

### Cross-Service Context Clues

External access in Microsoft 365 is controlled by multiple independent settings layers (Cross-Tenant Access, Entra External Collaboration, SharePoint Sharing, Teams Federation) -- any one of which can block access. Manage365 adds contextual banners and cross-links throughout these settings pages so administrators can quickly identify which layer is causing an issue and navigate directly to it.

### Risk Coaching & Settings Safety

An inline risk coaching system that alerts administrators to potentially dangerous settings as they make changes. Over 30 risk rules across External Collaboration, Cross-Tenant Policy, SharePoint Sharing, Teams Settings, Offboarding Wizard, Transport Rules, and Alert Configuration highlight dangerous options, recommend safer alternatives, and require explicit confirmation before saving high-risk configurations. B2B direct connect settings include dedicated risk coaching that explains the security model -- direct connect users have no directory footprint and are not subject to Conditional Access unless inbound trust is configured -- and recommends partner-specific policies over opening the default.

### Access Type Coaching: Guest Access vs External Access

Microsoft 365 has two fundamentally different ways to collaborate with external users -- Guest Access (B2B Collaboration) and External Access (B2B Direct Connect) -- controlled by different settings layers with different capabilities and security implications. Manage365 adds consistent, context-aware coaching throughout the application so administrators understand which access type applies to what they're doing:

- **Inline chips** with educational tooltips replace generic "Guest" labels on member lists across Teams, SharePoint, and user management pages
- **Contextual banners** in all guest invitation and channel member dialogs explain which access type is being used, what it means, and which email types are supported (organizational vs personal)
- **Expandable info panels** on Teams channel detail, Cross-Tenant Access, and SharePoint pages provide a side-by-side comparison of both access types with characteristics, limitations, and links to the relevant settings pages
- **Standards helpText** for guest-related standards (Guest Invite, Teams Guest Access, External MFA Trust, SP Azure B2B) now clarifies which access type each standard controls
- **Backend messages** tag every success and error result with the access type label (e.g., "Guest Access — B2B Collaboration" or "External Access — B2B Direct Connect") so results are unambiguous
- **Actionable error guidance** when a personal email is entered for a shared channel explains why it's not supported and directs the user to use a private channel instead

All coaching content is driven by a single shared data layer (`accessTypes.js`) so terminology stays consistent across the entire application and can be updated in one place.

### Guest Invitation & Channel Member Diagnostics

Invite external guests directly from SharePoint site and Teams detail pages. Add external members to shared channels via B2B direct connect, or add guests with any email address (including personal emails like Gmail and Outlook.com) to private channels via B2B collaboration with automatic Email One-Time Passcode support. If an operation fails, the system automatically diagnoses the root cause -- checking cross-tenant access policies (B2B direct connect inbound/outbound), B2B domain restrictions, Teams guest access settings, Entra external collaboration settings, and SharePoint permissions -- and provides categorized, structured guidance with direct links to the relevant CIPP settings page. Microsoft internal error codes (e.g., "xTap") are translated to human-readable descriptions.

### Pre-flight Domain Validation & Email Intelligence

Real-time validation of guest email addresses before invitation, powered by a reusable domain intelligence API (`ExecValidateExternalDomain`). As administrators type an email address in any guest invitation dialog, the system:

- **Classifies the email domain** via OIDC discovery as consumer (Gmail, Yahoo, Outlook.com), organizational (another M365 tenant), or unresolvable
- **Checks for existing guest accounts** in the target tenant to avoid duplicate invitations
- **Evaluates tenant policies** across Entra External Collaboration, B2B domain allow/block lists, SharePoint sharing settings, Teams guest access, and Cross-Tenant Access policies
- **Returns a structured verdict** with pass/fail/warning status, recommended access type, and specific fix guidance for any blocking policies

Consumer domain detection is also integrated into the guest invite drawer and the Add Channel Member dialog for shared channels, where personal emails are blocked with an explanation of why shared channels require work/school accounts and a suggestion to use a private channel instead.

### Interactive Access Type Decision Tree

An interactive question-and-answer flow added to the `CippAccessTypeGuide` component (`variant="decision"`) helps administrators choose between Guest Access (B2B Collaboration) and External Access (B2B Direct Connect). Context-specific trees for SharePoint, Teams standard/private/shared channels, and a general-purpose flow guide users to the correct access type based on the external user's email type and the target resource, with clear lists of what is and isn't supported and concrete next steps.

### External Access Wizard

A multi-step guided wizard (`/teams-share/external-access`) that unifies the entire external user onboarding flow:

1. **Who** -- enter one or more guest email addresses with inline domain validation and real-time policy feedback
2. **Where** -- select the target resource (SharePoint site, Teams standard/private/shared channel) with context-aware access type recommendations; shared channel options are automatically hidden for personal email addresses
3. **Review** -- summary of guests, resource, access type, and any policy warnings before execution
4. **Execute** -- sends invitations with per-guest progress tracking and individual success/error results

### Sharing & Guest Troubleshooter

A comprehensive diagnostic tool (`/teams-share/troubleshooting/sharing-troubleshooter`) that performs a structured sequence of 10 checks to identify why an external user cannot access a shared resource:

1. Domain type classification (consumer vs organizational via OIDC)
2. Guest account existence in the tenant
3. Guest account status (enabled, disabled, pending acceptance)
4. Entra External Collaboration invite restrictions
5. Entra B2B domain allow/block lists
6. Email One-Time Passcode authentication method status
7. SharePoint tenant sharing settings and domain restrictions
8. Teams guest access configuration
9. Cross-Tenant Access policies (for organizational domains and shared channels)
10. Site-level membership verification (when a resource URL is provided)

Results are displayed in a visual timeline with color-coded pass/fail/warning status, detailed explanations, fix recommendations with links to the relevant settings page, and quick presets for common troubleshooting scenarios. The backend (`ExecSharingTroubleshoot`) returns a structured timeline that can be consumed by other components.

### SharePoint Document Library Sharing Links

A new backend endpoint (`ExecCreateSharingLink`) enables creation of sharing links for specific SharePoint drive items using the Microsoft Graph `createLink` API. Supports view, edit, and embed link types with anonymous, organization, or specific-people scopes, optional expiration dates, and password protection.

### Guest Lifecycle Dashboard

A dedicated guest user management page (`/identity/administration/guest-users`) providing visibility into all guest accounts across a tenant:

- **Summary cards** showing total guests and counts by status: Active, Stale (no sign-in for 90+ days), Pending Acceptance, Disabled, and Never Signed In
- **Status classification** computed from sign-in activity data via the Graph beta API
- **Filterable table** with one-click status filter buttons to quickly isolate problematic guests
- **Row actions** including re-invite for pending or stale guests

### Guest-Ready Bulk Configuration

A "Quick Setup: Guest-Ready Configuration" card on the Cross-Tenant Access page that configures a tenant for external guest collaboration in one click. Applies secure defaults across three services:

- **Entra:** Guest invite restrictions set to Admins and Guest Inviter role
- **SharePoint:** External sharing enabled for new and existing guests
- **Teams:** Guest access enabled

Includes a confirmation dialog showing exactly what will be changed and per-step success/error reporting.

### Enhanced Cross-Tenant Health Checks

Four new health checks (12-15) added to the Cross-Tenant Health endpoint:

- **Teams guest access** -- warns if guest access is disabled in Teams client configuration
- **Email OTP status** -- warns if Email One-Time Passcode authentication is not enabled, which blocks personal email guests
- **SharePoint/Entra sharing mismatch** -- detects when Entra allows guests but SharePoint sharing is disabled (or vice versa)
- **Domain restriction divergence** -- detects when Entra and SharePoint have mismatched allowed/blocked domain lists

### eDiscovery Case Management

End-to-end eDiscovery workflow for managing legal holds, content searches, and evidence exports directly from the portal -- eliminating the need to switch to the Microsoft Purview compliance portal or write PowerShell scripts for each client:

- **Case management** -- create, close, reopen, and delete eDiscovery cases per tenant with status tracking, case metadata, and external ID support for correlating with legal matter numbers
- **Legal holds** -- place litigation holds on specific user mailboxes and SharePoint sites with optional KQL content queries to narrow the scope. Supports multiple content sources per hold and displays hold status with content source counts
- **Content searches** -- create KQL-based searches across Exchange, SharePoint, Teams, and OneDrive. Run search estimates to preview result counts and data volume before committing to an export. Status polling auto-refreshes while searches are running
- **Export and production** -- initiate exports from completed searches with configurable export criteria. Export operations track progress percentage and provide download links when complete. Auto-polling updates export status in real time
- **Async operation tracking** -- long-running operations (search estimates, exports) are handled asynchronously with automatic 5-second polling that stops when the operation completes or fails
- **Setup guidance** -- a proactive setup banner on the cases page explains the one-time per-tenant prerequisites (CPV refresh for permissions and eDiscovery Administrator role assignment in Purview), plus reactive error classification that detects 403/permission and license errors and renders structured remediation steps
- **Tier support** -- uses the Microsoft Graph eDiscovery Standard API (September 2025), which works for both E3 and E5 tenants. Phase 2 will add Premium-only features (custodian management, review sets, advanced export options) for E5 tenants

Built on app-only authentication (`eDiscovery.Read.All` and `eDiscovery.ReadWrite.All`) via SAM, consistent with the rest of the CIPP architecture. Located under Security & Compliance > eDiscovery > Cases.

### Dynamics 365 Management

Read-only visibility into Power Platform / Dynamics 365 environments, users, security roles, business units, and solutions -- providing insight without needing the Power Platform Admin Center.

### NinjaOne Device Enrichment

When NinjaOne integration is configured, device views across the application are automatically enriched with hardware data (CPU, RAM, OS, agent status, last contact). Works across MEM Devices, Entra Devices, and per-user device views, with graceful degradation when NinjaOne is not available. Backend sync includes Entra-only fallback for non-Intune tenants, O(1) serial number indexing for device matching, and memory-optimized processing.

### Enhanced Error Messages & Permission Guidance

Structured error formatting throughout the application. The `FormattedResultText` renderer automatically detects and formats common error patterns: backend `Diagnostics:` sections are parsed into categorized items with `[Category]` chips and `CIPP Settings:` paths become clickable navigation buttons. SharePoint-specific error classification provides targeted diagnostics for token acquisition and access issues without misdirecting users to superadmin settings.

### Mailbox External Mail Restrictions

Control external email flow on a per-mailbox basis directly from the user's Exchange tab. Two independent toggles allow administrators to:

- **Block external inbound** -- sets `RequireSenderAuthenticationEnabled` so only internal (authenticated) senders can email the mailbox; external senders receive an NDR
- **Block external outbound** -- flags the mailbox via `CustomAttribute15` and auto-creates a tenant-wide transport rule that rejects messages sent to external recipients from any flagged mailbox

Each toggle includes a confirmation dialog with clear warnings about the consequences. Restrictions can be applied independently (inbound only, outbound only, or both) and reversed at any time. The current status is displayed as a visual tile on the Exchange info card alongside other mailbox settings.

### Email Troubleshooter

A unified email troubleshooting hub under Email & Exchange > Troubleshooting that combines message trace and quarantine management into a single search-diagnose-act workflow, eliminating the context-switching that previously required technicians to navigate between separate pages in different menus.

- **Unified search** -- a single search form queries both Exchange message trace and quarantine simultaneously, returning results in a tabbed interface with badge counts showing trace results and unreleased quarantine messages
- **Quick-filter presets** -- one-click chips for common searches: "Quarantined (24h)", "Failed Delivery (48h)", "All Recent (7d)" pre-fill the search form and execute immediately
- **Advanced filtering** -- shared quarantine filter panel with Message ID, subject (partial or exact), sender/recipient, sender/recipient domain, quarantine reason, release status, policy type/name, and message-trace-only sending IP filters
- **Contextual actions on trace results** -- View Delivery Details, View in Security Explorer, Allow Sender, Block Sender, Copy Message ID, and Release from Quarantine (appears only for quarantined messages) without leaving the page
- **Contextual actions on quarantine results** -- View Message (EML preview), View Message Trace, Release, Deny, Delete, Submit to Microsoft, Release & Allow Sender, Release & Add Allow Entry, Allow/Block Sender or Domain, and Copy Message ID
- **Cross-tab linking** -- clicking a "Quarantined" status chip in the trace tab switches to the quarantine tab and filters to the matching message
- **Bulk quarantine operations** -- select multiple quarantine entries and release, deny, release-and-allow, delete, submit to Microsoft, or block unique senders in one aggregated action with tiered confirmation guardrails (10+ and 50+ messages)
- **Delivery timeline visualization** -- an MUI Timeline-based detail panel replaces the plain table, showing color-coded delivery events (green for delivered, red for failed, amber for quarantined) with timestamps, event names, actions, and detail text
- **Partial failure resilience** -- the combined backend endpoint handles permission failures gracefully: if quarantine access is missing but trace works (or vice versa), partial results are shown with a guidance banner explaining which data source failed and how to fix it
- **Guest UPN encoding** -- sender and recipient addresses containing `#EXT#` are automatically encoded for Exchange Online API compatibility

The navigation is restructured with Troubleshooting as the first submenu under Email & Exchange, placing the most commonly used tools at the top. The standalone [Quarantine Management](#quarantine-portal-manage365-v5130) page remains available for all-tenant bulk monitoring and filtered export. Message Viewer and Mailbox Restores are relocated from Tools to Troubleshooting for better discoverability.

### Quarantine Portal (Manage365 v5.13.0)

Manage365 extends the upstream quarantine list with a Defender-style portal experience while preserving all existing quarantine, trace, EML preview, and allow/block workflows. Exchange Online PowerShell (`Get-QuarantineMessage`, `Release-QuarantineMessage`, etc.) is used throughout — not Microsoft Graph or Defender REST quarantine APIs.

**Quarantine Management page** (`/email/administration/quarantine`):

- **Server-side filters** mapped to supported `Get-QuarantineMessage` parameters: time range (default last 7 days), sender/recipient, exact subject, quarantine reason, release status, policy type/name, and message ID
- **Post-filters** for partial subject match and sender/recipient domain (applied after EXO returns results, with UI guidance when active)
- **Paginated grid** -- 100 rows per page with auto-pagination; `fetchAll=true` available for API consumers needing legacy full-dump behavior
- **Shared UI module** -- `src/components/CippComponents/quarantine/` provides filter panel, grid columns, detail panel, bulk toolbar, and row actions used by both Quarantine Management and Email Troubleshooter
- **Lazy detail metadata** -- extended message details and authentication summary load on row open via `GetMailQuarantineMessage` (not during initial grid load)
- **Export** -- filtered CSV or JSON download (up to 5,000 raw EXO rows, with truncation warning)
- **Bulk actions** -- release, deny, release & allow, delete, submit to Microsoft, block deduplicated senders, export selected rows
- **Preserved actions** -- EML preview, message trace, Threat Explorer deep link, preset column filters (Not Released / Released / Requested), and all row-level allow/block/release operations

**Backend (CIPP-API):**

- `Build-CIPPQuarantineQueryParams.ps1` -- shared filter mapper, post-filters, EXO retry/backoff, display normalization
- `ListMailQuarantine`, `GetMailQuarantineMessage`, `ExportMailQuarantine`, extended `ExecQuarantineManagement`, `ExecEmailTroubleshoot`
- `ExecMailboxSafeSender` -- backend endpoint for mailbox safe-sender list (API only; no UI yet)
- AllTenants cache paginates up to 5 × 1,000 rows per tenant (30-day window)
- Feature matrix and API limits: `CIPP-API/docs/QUARANTINE_FEATURES.md`

**Not supported / limitations** (honest API limits, not faked in UI):

- Sender/recipient display name filtering (EXO list API)
- Sending IP on quarantine list (message trace only)
- Attachment/URL sandbox verdicts in list (EML preview when available)
- Threat Explorer in-app (external deep link only)
- Release to specific users and mailbox safe sender (backend/API only)

### Reliability & Performance Hardening (Manage365 v5.15.2)

A full-app reliability audit of both repos (frontend and API) with fixes for the highest-impact bugs found:

**Quarantine & email troubleshooting:**

- **Quarantine outage fixed (module export bug)** -- the quarantine helper functions (`Invoke-CippQuarantineExoRequest`, `Get-CippQuarantinePagedResults`, and friends) were co-located in one file, but CIPPCore exports functions by file basename only, so the upstream module split (entrypoints moving to CIPPHTTP/CIPPActivityTriggers) made them invisible to every quarantine endpoint -- breaking quarantine for all tenants with "The term 'Invoke-CippQuarantineExoRequest' is not recognized". Helpers are now one-function-per-file so they export correctly
- **Post-filter pagination no longer drops rows** -- when subject/domain post-filters are active, every match from a scanned Exchange page is kept (previously matches could be silently skipped when a page filled mid-scan), and "more pages" is reported correctly even when the raw-page scan limit is hit. Covered by new Pester regression tests
- **Bulk quarantine actions endpoint repaired** -- fixed a PowerShell parse error (`return switch`) that prevented `ExecQuarantineManagement` from loading at all, and missing message identities now return a clear 400 instead of an opaque failure
- **Accurate HTTP status codes** -- quarantine read endpoints previously returned 403 for every error (including Exchange throttling); only genuine authorization failures return 403 now, everything else is 500 so retries and monitoring behave correctly
- **All-tenants cache dedupe** -- cache rows now use deterministic keys (hash of tenant + quarantine identity) so re-running the sync upserts instead of inserting duplicates
- **Stale dialog data eliminated** -- opening a second message trace or EML preview no longer flashes the previous message's data while the new request loads

**Frontend:**

- **API result severity fixed** -- structured API results were almost always rendered as errors in dialogs and wizards due to a truthiness bug in `CippApiResults`; success results now display correctly
- **Wizard crash fixed** -- wizards with conditional steps (`showStepWhen`/`hideStepWhen`) could index past the visible step list and crash; navigation now clamps to the filtered list
- **React Query v5 compliance** -- the removed `keepPreviousData` option (silently ignored) is mapped to `placeholderData`, and is now opt-in to prevent cross-tenant data flashes
- **Tenant-scoped cache keys** -- alert configuration and Dynamics 365 pages now include the tenant in their query keys, eliminating stale cross-tenant data after tenant switches
- **OAuth popup cleanup** -- navigating away mid-authentication now tears down the `BroadcastChannel`, the 10-minute timeout, and device-code polling instead of leaking them
- **Quarantine page render performance** -- the filter form subscribes only to the fields it needs instead of re-rendering the whole page on every keystroke

**Backend:**

- **Mailbox details endpoint surfaces failures** -- `ListUserMailboxDetails` returned HTTP 200 with empty data when Exchange/Graph calls failed; it now returns a proper error, and the tenant-wide user list is fetched lazily (only when Send-on-Behalf or internal forwarding resolution needs it)
- **OData injection hardening** -- group lookups in SharePoint guest-invite and member endpoints escape single quotes in user-supplied identifiers
- **Repo hygiene** -- removed 53 stray macOS duplicate files across both repos, including two duplicated live API endpoints

### Organized Navigation

Deeply nested navigation menus that group related pages together, reducing menu length and making features easier to find -- External Access with External Access Wizard and Sharing Troubleshooter; Email & Exchange Troubleshooting with Email Troubleshooter, Quarantine, Message Viewer, and Mailbox Restores; Groups with Group Templates; Users with Offboarding Wizard, Risky Users, and Guest Users; Business Voice with Phone Numbers, Call Queues, Auto Attendants, and Dial Plans; File Management with File Search, File Browser, and File Transfer; and more.

### Bulk Domain Migration

Migrate users and groups from one domain to another in bulk -- a common need when clients rebrand or consolidate domains. Available from two entry points:

- **Users page** -- select users, choose "Change Domain" from bulk actions, pick the target domain, and migrate
- **Domains page** -- click "Migrate Users to This Domain" on any verified domain, select a source domain, then pick which users and groups to migrate

The migration changes each user's UPN and primary email to the new domain while automatically preserving the old email address as an alias so inbound mail delivery is not disrupted. Groups (M365 Groups, Distribution Lists, Mail-Enabled Security Groups) are supported with an opt-in toggle. Conflict detection checks for address collisions before making changes, and per-object results report exactly which items succeeded or failed.

### Integration Templates

A template-based system for creating app registrations in client tenants, designed to streamline the setup of third-party integrations like UniFi Identity, Datto, and similar services that require Microsoft Entra app credentials.

- **Prebuilt templates** -- ships with ready-to-use templates for common integrations (UniFi Identity included) with correct API permissions pre-configured
- **Custom templates** -- create your own templates for any integration, selecting from a curated list of common Microsoft Graph permissions
- **Multi-tenant deployment** -- deploy the same app registration to multiple client tenants in a single operation with orchestrator-based parallel processing
- **Credential display** -- after deployment, credentials (Application ID, Tenant ID, Client Secret) are displayed in a table with individual copy buttons, show/hide toggle for secrets, and a "Copy All" button for bulk export
- **CSV export** -- export all deployment results including credentials for record-keeping and documentation
- **Secret expiration** -- choose secret lifetime (90 days to 2 years) during deployment; longer expirations reduce maintenance overhead
- **Built-in template protection** -- prebuilt templates show a lock icon and can be duplicated but not modified or deleted, ensuring reliable defaults
- **Automatic admin consent** -- app role assignments are created automatically, granting the configured permissions without additional manual steps in the Entra portal

Located under Tenant Administration > Applications > Integration Templates.

### Backend Enhancements

- **Stack overflow protection** in Intune policy comparison with depth-tracking recursion and O(1) index-based lookups
- **Thorough mailNickname sanitization** in group creation (M365 spec compliance: extracts local part, removes forbidden characters, enforces 64-char limit)
- **Enhanced CippEntrypoints** with function-existence validation before invocation, detailed error logging with stack traces, queue trigger support, and Premium SKU FanOut mode
- **Durable SDK 2.2.0** with fan-out/fan-in/fan-out orchestration pattern for DB cache collection
- **Channel filesFolder batch-fetch** -- Teams detail API returns per-channel SharePoint siteId/driveId via Graph batch requests, enabling direct file browsing for private/shared channels with their own SharePoint sites
- **SharePoint REST auto-elevation** -- when adding members to non-group-connected sites (Communication, classic Team), the delegated token may lack site-level permissions. The endpoint now auto-elevates the SAM user to site collection admin via CSOM `SetSiteAdmin` (app-only admin API) and retries, with a final Graph API `drive/root/invite` fallback if CSOM is unavailable. Eliminates the manual "run CPV Refresh" step for most SharePoint member operations
- **Quarantine portal API (v5.13.0)** -- shared `Build-CIPPQuarantineQueryParams` helper with EXO retry/backoff, post-filter pagination metadata, export cap semantics, and Pester tests for query mapping and endpoint response shapes (`Tests/Tools`, `Tests/Endpoint`)
- **Selective user edit body** -- only sends properties that are explicitly set, preventing accidental field clearing during inline edits
- **License backfill integration** -- missing licenses show formatted names immediately with asynchronous API backfill for accurate display names
- **Applied Standards API hardening** -- `{ Results }` wrappers, `excludedTenants` corruption repair, missing `standards` key auto-init, live `TemplateList-Tags` expansion for Intune and CA partitions, and run-manually standards included in compare
- **Power Platform Administrator** role included in GDAP role sets

---

## Upstream Integration

Manage365 tracks [KelvinTegelaar/CIPP](https://github.com/KelvinTegelaar/CIPP) and [KelvinTegelaar/CIPP-API](https://github.com/KelvinTegelaar/CIPP-API). Upstream changes are merged **selectively** (cherry-pick / surgical port), not via wholesale merge or GitHub “Discard commits” sync.

**Formal process:** [docs/upstream-sync/PROCESS.md](docs/upstream-sync/PROCESS.md) — cadence, triage rules, checkpoint docs, version bump, and deploy checklist.

| Cadence | When | Focus |
|---------|------|--------|
| **Light delta** | Monthly | Low-risk bugfixes, JSON data, tests |
| **Major cycle** | Quarterly | Full delta inventory + dependency review |
| **Feature intake** | Backlog | New capabilities (e.g. SSO, MCP) — design first |
| **Hotfix** | As needed | Critical upstream security fixes |

Start a cycle: `./Tools/Start-UpstreamSyncCycle.ps1 -Repo CIPP` (and the same script from CIPP-API with `-Repo CIPP-API`).

All intakes are **selective** — upstream fixes and improvements are ported surgically rather than merging whole files, so fork-specific behavior stays intact.

### Taken from upstream (v10.6.1 intake series — July 2026)

The July 2026 cycle absorbed the upstream 10.6.x line as a major delta plus nine
dedicated feature intakes (checkpoint docs in `docs/upstream-sync/`):

| Intake | What changed |
|--------|----------------|
| **Copilot & AI** (v5.18.0) | Copilot & AI management pages and menu section |
| **SAM certificate auth** | Certificate-based SAM authentication support (API) |
| **SharePoint suite** (v5.19.0) | Upstream SharePoint improvements merged into fork's site management |
| **BEC UI family** (v5.20.0) | Compact accordion check cards, inbox-rule change auditing, Sent Messages check, Trusted & Blocked Senders check (fork implemented the missing backend data producer), updated PDF report; fork's rich page states preserved |
| **Exchange/Mailbox family** (v5.21.0) | Mailbox Access card, proxy-address drift (Source column), mail-enabled security groups in permission pickers, SMTP Auth chip on the Exchange info card, report-DB mailbox permissions page; guest-UPN retry logic preserved in `ExecModifyMBPerms` |
| **UserActions + nested groups** (v5.22.0) | Policy-aware TAP creation form, pre-selection + no-op guards on Sign-In State and Source of Authority actions, users-and-groups member picker for group edit (nested group memberships) |
| **MEM devices + component fixes** (v5.23.0) | Shared `CippIntuneDeviceActions` (built from the fork's richer action list) consumed by both device pages; defanged-URL rendering fix; bar-chart tooltip fix; AllTenants tenant-scoping fix on row actions; stale dialog results cleared on reopen |
| **Scheduled edit + dashboard alerts** (v5.24.0) | Dashboard Alerts card (active + snoozed alert instances with per-item snooze), schedulable user edits via new shared `Set-CIPPUser` (API), bulk API results rolled up per action with an X-of-Y summary alert |
| **Odds & ends** (v5.25.0) | Menu section permission fixes (Device Management, Transport, Spam Filter, Resource Management), top-nav tooltips + shortcut hints, Next.js build-trace skip (~67s → ~24s builds), dependency bumps (react-query family, apexcharts, mui-tiptap, reduxjs/toolkit, dompurify as direct dep) |

**Deferred from this cycle:** the SSO/CIPP-users family (architecturally
incompatible — upstream's implementation depends on a container runtime and
EasyAuth migration that don't exist in the fork's Static Web Apps + Function App
deployment), MCP support, Custom Test Alerting overhaul, Purview DLP standard,
Intune policy sync, Sherweb client changes, and assorted small items listed in
the checkpoint docs.

### Taken from upstream (v10.5 / v10.5.1 — June 2026)

| Area | What changed |
|------|----------------|
| **Applied Standards** | Corrected compliance scoring math (ratio-based combined score, capped at 100%); license-missing filter includes `LicenseAvailable: false` standards; template lookup respects `{ Results }` API wrappers; removed debug logging |
| **Policies Deployed** | CA template GUIDs resolve to display names via `ListCATemplates` |
| **Standards API** | Compare includes run-manually templates; `ExecStandardsRun` accepts `templateId` or `TemplateId`; CA `TemplateList-Tags` expand from the `CATemplate` partition |
| **Universal Search** | `CippUniversalSearchV2` in top nav (hybrid — frosted-glass header preserved); legacy `CippCentralSearch` removed |
| **Dashboard** | Dashboard v2 only; v1 and History tab removed with redirect |
| **CippDataTable** | Virtualization, schema-key column cache, regex filter fixes, off-canvas click guard — mobile card view and quick actions preserved |
| **Identity / Email** | Group-based licensing; alert-only license exclusions; quarantine deny fix; dual-schema CAS mailbox endpoint; autocomplete and report-builder `tenantFilter` fixes |
| **Auth / CI** | OAuth broadcast channel for reliable popup completion; superseded SWA deploy cancellation |
| **Dependencies** | Low-risk package bumps aligned with upstream 10.5.1 |

### Preserved Manage365 customizations

- Dual **Run Standard** actions and drift-template workflows on Applied Standards (not replaced with upstream single-action tenant selector)
- **LicenseAvailable** warnings and scoring UI on Applied Standards
- `createDriftManagementActions` and fork drift logic on Applied Standards / Policies Deployed
- `{ Results: ... }` API response wrappers and fork hardening in standards endpoints
- **CippDataTable** mobile card view, lazy-load pagination, and `mobileQuickActions`
- Dashboard inline universal search (mobile landing-page search kept alongside top-nav search)
- Fork `excludedTenants` corruption guards and missing `standards` key auto-init in `listStandardTemplates`

### Deferred (not merged)

Full-file replacements for Applied Standards, CippDataTable, top-nav, and `package.json` were skipped where they would remove the items above. Worker health, MCP UI, and SSO migration repair were not taken (no fork UI or dependencies for those features).

### Version tracking and out-of-date alerts

Manage365 tracks **two** version numbers:

| File | Purpose |
|------|---------|
| `public/manage365-version.json` | Manage365 fork release (shown as the primary version in Application Settings) |
| `public/version.json` | Upstream CIPP baseline absorbed — used by `GetVersion` / `GetCippAlerts` to suppress false "out of date" toasts |

After each upstream intake, bump both and redeploy:

```powershell
# Frontend (CIPP repo)
./Tools/Update-Version.ps1 -UpstreamVersion 10.6.1 -Manage365Version 5.25.0

# Backend (CIPP-API repo) — set both copies to the same upstream baseline
# version_latest.txt
# Config/version_latest.txt
```

Then **redeploy the Static Web App and every Function App slot** (main API, processor, standards, audit log, user tasks). Until redeployed, the settings page may still show old versions and function apps may appear "out of sync" in the Version table.

Out-of-date toast notifications compare your deployed `version.json` / `version_latest.txt` against [KelvinTegelaar/CIPP](https://github.com/KelvinTegelaar/CIPP) and [KelvinTegelaar/CIPP-API](https://github.com/KelvinTegelaar/CIPP-API) on GitHub. They clear once your deployed baseline matches upstream (currently **10.6.1**).

### GitHub "Sync fork" button

This is **separate** from in-app version alerts. GitHub compares commit history between `Celeratec/CIPP` and `KelvinTegelaar/CIPP`. Selective cherry-pick intake leaves the fork hundreds of commits "behind" upstream even when you have absorbed the relevant changes — GitHub will keep offering **Sync fork**.

Options:

1. **Ignore it** (recommended for day-to-day work) — the badge is cosmetic when you cherry-pick intentionally.
2. **Merge upstream periodically** — `git fetch upstream && git merge upstream/main` (resolve conflicts, preserve fork customizations). Clears the behind count but is a large merge.
3. **Do not use "Sync fork" → Discard commits** — that would overwrite Manage365-specific work.

---

## Technology Stack

- **Frontend:** React / Next.js 16 with Material-UI (MUI v7)
- **Backend:** PowerShell Azure Functions
- **API:** Microsoft Graph API (including eDiscovery API), SharePoint Admin API, SharePoint REST API, Teams PowerShell cmdlets (via `New-TeamsRequest`, including meeting branding policy management), Power Platform BAP API, Dataverse Web API, NinjaOne API (via CIPP extension)
- **Hosting:** Azure Static Web Apps + Azure Functions
- **Data:** React Query for caching and state management

---

## Acknowledgments

Manage365 is built on the [CIPP](https://cipp.app) open-source project created by [Kelvin Tegelaar](https://github.com/KelvinTegelaar) and the CIPP community. We are grateful for their foundational work that makes this project possible.
