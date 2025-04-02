import { BuildingOfficeIcon, HomeIcon, UsersIcon, WrenchIcon } from "@heroicons/react/24/outline";
import {
  Cloud,
  CloudOutlined,
  DeviceHub,
  HomeRepairService,
  Laptop,
  MailOutline,
  Shield,
  ShieldOutlined,
} from "@mui/icons-material";
import { SvgIcon } from "@mui/material";

export const nativeMenuItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: (
      <SvgIcon>
        <HomeIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Identity Management",
    type: "header",
    icon: (
      <SvgIcon>
        <UsersIcon />
      </SvgIcon>
    ),
    items: [
      {
        title: "Administration",
        path: "/identity/administration",
        items: [
          { title: "Users", path: "/identity/administration/users" },
          { title: "Risky Users", path: "/identity/administration/risky-users" },
          { title: "Groups", path: "/identity/administration/groups" },
          {
            title: "Group Templates",
            path: "/identity/administration/group-templates",
          },
          { title: "Devices", path: "/identity/administration/devices" },
          { title: "Deleted Items", path: "/identity/administration/deleted-items" },
          { title: "Roles", path: "/identity/administration/roles" },
          { title: "JIT Admin", path: "/identity/administration/jit-admin" },
          {
            title: "Offboarding Wizard",
            path: "/identity/administration/offboarding-wizard",
          },
        ],
      },
      {
        title: "Reports",
        path: "/identity/reports",
        items: [
          { title: "MFA Report", path: "/identity/reports/mfa-report" },
          { title: "Inactive Users", path: "/identity/reports/inactive-users-report" },
          { title: "Sign-in Report", path: "/identity/reports/signin-report" },
          {
            title: "AAD Connect Report",
            path: "/identity/reports/azure-ad-connect-report",
          },
          { title: "Risk Detections", path: "/identity/reports/risk-detections" },
        ],
      },
    ],
  },
  {
    title: "Tenant Administration",
    type: "header",
    icon: (
      <SvgIcon>
        <BuildingOfficeIcon />
      </SvgIcon>
    ),
    items: [
      {
        title: "Administration",
        path: "/tenant/administration",
        items: [
          { title: "Tenants", path: "/tenant/administration/tenants" },
          {
            title: "Alert Configuration",
            path: "/tenant/administration/alert-configuration",
          },
          { title: "Audit Logs", path: "/tenant/administration/audit-logs" },
          {
            title: "Enterprise Applications",
            path: "/tenant/administration/enterprise-apps",
          },
          { title: "Secure Score", path: "/tenant/administration/securescore" },
          {
            title: "App Consent Requests",
            path: "/tenant/administration/app-consent-requests",
          },
          {
            title: "Authentication Methods",
            path: "/tenant/administration/authentication-methods",
          },
          {
            title: "Partner Relationships",
            path: "/tenant/administration/partner-relationships",
          },
        ],
      },
      {
        title: "GDAP Management",
        path: "/tenant/gdap-management/",
      },
      {
        title: "Configuration Backup",
        path: "/tenant/backup",
        items: [{ title: "Backups", path: "/tenant/backup/backup-wizard" }],
      },
      {
        title: "Standards",
        path: "/tenant/standards",
        items: [
          { title: "Standards", path: "/tenant/standards/list-standards" },
          {
            title: "Best Practice Analyser",
            path: "/tenant/standards/bpa-report",
          },
          {
            title: "Domains Analyser",
            path: "/tenant/standards/domains-analyser",
          },
        ],
      },
      {
        title: "Conditional Access",
        path: "/tenant/conditional",
        items: [
          { title: "CA Policies", path: "/tenant/conditional/list-policies" },
          {
            title: "CA Vacation Mode",
            path: "/tenant/conditional/deploy-vacation",
          },
          {
            title: "CA Templates",
            path: "/tenant/conditional/list-template",
          },
          {
            title: "Named Locations",
            path: "/tenant/conditional/list-named-locations",
          },
        ],
      },
      {
        title: "Reports",
        path: "/tenant/reports",
        items: [
          {
            title: "Licence Report",
            path: "/tenant/reports/list-licenses",
          },
          {
            title: "Sherweb Licence Report",
            path: "/tenant/reports/list-csp-licenses",
          },
          {
            title: "Consented Applications",
            path: "/tenant/reports/application-consent",
          },
        ],
      },
    ],
  },
  {
    title: "Security & Compliance",
    type: "header",
    icon: (
      <SvgIcon>
        <ShieldOutlined />
      </SvgIcon>
    ),
    items: [
      {
        title: "Incidents & Alerts",
        path: "/security/incidents",
        items: [
          { title: "Incidents", path: "/security/incidents/list-incidents" },
          { title: "Alerts", path: "/security/incidents/list-alerts" },
        ],
      },
      {
        title: "Defender",
        path: "/security/defender",
        items: [
          { title: "Defender Status", path: "/security/defender/list-defender" },
          {
            title: "Defender Deployment",
            path: "/security/defender/deployment",
          },
          {
            title: "Vulnerabilities",
            path: "/security/defender/list-defender-tvm",
          },
        ],
      },
      {
        title: "Reports",
        path: "/security/reports",
        items: [
          {
            title: "Device Compliance",
            path: "/security/reports/list-device-compliance",
          },
        ],
      },
    ],
  },
  {
    title: "Intune",
    type: "header",
    icon: (
      <SvgIcon>
        <Laptop />
      </SvgIcon>
    ),
    items: [
      {
        title: "Applications",
        path: "/endpoint/applications",
        items: [
          { title: "Applications", path: "/endpoint/applications/list" },
          { title: "Application Queue", path: "/endpoint/applications/queue" },
        ],
      },
      {
        title: "Autopilot",
        path: "/endpoint/autopilot",
        items: [
          { title: "Autopilot Devices", path: "/endpoint/autopilot/list-devices" },
          { title: "Add Autopilot Device", path: "/endpoint/autopilot/add-device" },
          { title: "Profiles", path: "/endpoint/autopilot/list-profiles" },
          { title: "Status Pages", path: "/endpoint/autopilot/list-status-pages" },
          { title: "Add Status Page", path: "/endpoint/autopilot/add-status-page" },
        ],
      },
      {
        title: "Device Management",
        path: "/endpoint/MEM",
        items: [
          { title: "Devices", path: "/endpoint/MEM/devices" },
          { title: "Configuration Policies", path: "/endpoint/MEM/list-policies" },
          { title: "Compliance Policies", path: "/endpoint/MEM/list-compliance-policies" },
          { title: "Protection Policies", path: "/endpoint/MEM/list-appprotection-policies" },
          { title: "Apply Policy", path: "/endpoint/MEM/add-policy" },
          { title: "Policy Templates", path: "/endpoint/MEM/list-templates" },
          { title: "Scripts", path: "/endpoint/MEM/list-scripts" },
        ],
      },
      {
        title: "Reports",
        path: "/endpoint/reports",
        items: [
          { title: "Analytics Device Score", path: "/endpoint/reports/analyticsdevicescore" },
        ],
      },
    ],
  },
  {
    title: "Teams & SharePoint",
    type: "header",
    icon: (
      <SvgIcon>
        <CloudOutlined />
      </SvgIcon>
    ),
    items: [
      {
        title: "OneDrive",
        path: "/teams-share/onedrive",
      },
      {
        title: "SharePoint",
        path: "/teams-share/sharepoint",
      },
      {
        title: "Teams",
        path: "/teams-share/teams",
        items: [
          { title: "Teams", path: "/teams-share/teams/list-team" },
          { title: "Teams Activity", path: "/teams-share/teams/teams-activity" },
          { title: "Business Voice", path: "/teams-share/teams/business-voice" },
        ],
      },
    ],
  },
  {
    title: "Email & Exchange",
    type: "header",
    icon: (
      <SvgIcon>
        <MailOutline />
      </SvgIcon>
    ),
    items: [
      {
        title: "Administration",
        path: "/email/administration",
        items: [
          { title: "Mailboxes", path: "/email/administration/mailboxes" },
          { title: "Deleted Mailboxes", path: "/email/administration/deleted-mailboxes" },
          { title: "Mailbox Rules", path: "/email/administration/mailbox-rules" },
          { title: "Contacts", path: "/email/administration/contacts" },
          { title: "Quarantine", path: "/email/administration/quarantine" },
          {
            title: "Tenant Allow/Block Lists",
            path: "/email/administration/tenant-allow-block-lists",
          },
        ],
      },
      {
        title: "Transport",
        path: "/email/transport",
        items: [
          { title: "Transport rules", path: "/email/transport/list-rules" },
          {
            title: "Transport Templates",
            path: "/email/transport/list-templates",
          },
          { title: "Connectors", path: "/email/transport/list-connectors" },
          {
            title: "Connector Templates",
            path: "/email/transport/list-connector-templates",
          },
        ],
      },
      {
        title: "Spamfilter",
        path: "/email/spamfilter",
        items: [
          { title: "Spamfilter", path: "/email/spamfilter/list-spamfilter" },
          { title: "Spamfilter templates", path: "/email/spamfilter/list-templates" },
          { title: "Connection filter", path: "/email/spamfilter/list-connectionfilter" },
          {
            title: "Connection filter templates",
            path: "/email/spamfilter/list-connectionfilter-templates",
          },
        ],
      },
      {
        title: "Resource Management",
        path: "/email/resources/management",
        items: [
          { title: "Rooms", path: "/email/resources/management/list-rooms" },
          { title: "Room Lists", path: "/email/resources/management/room-lists" },
        ],
      },
      {
        title: "Reports",
        path: "/email/reports",
        items: [
          {
            title: "Mailbox Statistics",
            path: "/email/reports/mailbox-statistics",
          },
          {
            title: "Mailbox Client Access Settings",
            path: "/email/reports/mailbox-cas-settings",
          },
          {
            title: "Anti-Phishing Filters",
            path: "/email/reports/antiphishing-filters",
          },
          { title: "Malware Filters", path: "/email/reports/malware-filters" },
          {
            title: "Safe Links Filters",
            path: "/email/reports/safelinks-filters",
          },
          {
            title: "Safe Attachments Filters",
            path: "/email/reports/safeattachments-filters",
          },
          {
            title: "Shared Mailbox with Enabled Account",
            path: "/email/reports/SharedMailboxEnabledAccount",
          },
          {
            title: "Global Address List",
            path: "/email/reports/global-address-list",
          },
        ],
      },
    ],
  },
  {
    title: "Tools",
    type: "header",
    icon: (
      <SvgIcon>
        <HomeRepairService />
      </SvgIcon>
    ),
    items: [
      {
        title: "Tenant Tools",
        path: "/tenant/tools",
        items: [
          {
            title: "Graph Explorer",
            path: "/tenant/tools/graph-explorer",
          },
          {
            title: "Application Approval",
            path: "/tenant/tools/appapproval",
          },
          { title: "Tenant Lookup", path: "/tenant/tools/tenantlookup" },

          { title: "IP Database", path: "/tenant/tools/geoiplookup" },

          {
            title: "Individual Domain Check",
            path: "/tenant/tools/individual-domains",
          },
        ],
      },
      {
        title: "Email Tools",
        path: "/email/tools",
        items: [
          { title: "Message Trace", path: "/email/tools/message-trace" },
          { title: "Mailbox Restores", path: "/email/tools/mailbox-restores" },
          { title: "Message Viewer", path: "/email/tools/message-viewer" },
        ],
      },
      {
        title: "Dark Web Tools",
        path: "/tools/darkweb",
        items: [
          { title: "Tenant Breach Lookup", path: "/tools/tenantbreachlookup" },
          { title: "Breach Lookup", path: "/tools/breachlookup" },
        ],
      },
      {
        title: "Template Library",
        path: "/tools/templatelib",
        roles: ["editor", "admin", "superadmin"],
      },
      {
        title: "Community Repositories",
        path: "/tools/community-repos",
        roles: ["editor", "admin", "superadmin"],
      },
      {
        title: "Scheduler",
        path: "/cipp/scheduler",
        roles: ["editor", "admin", "superadmin"],
      },
    ],
  },
  {
    title: "CIPP",
    type: "header",
    icon: (
      <SvgIcon>
        <WrenchIcon />
      </SvgIcon>
    ),
    items: [
      { title: "Application Settings", path: "/cipp/settings", roles: ["admin", "superadmin"] },
      { title: "Logbook", path: "/cipp/logs", roles: ["editor", "admin", "superadmin"] },
      { title: "SAM Setup Wizard", path: "/onboarding", roles: ["admin", "superadmin"] },
      { title: "Integrations", path: "/cipp/integrations", roles: ["admin", "superadmin"] },
      {
        title: "Custom Data",
        path: "/cipp/custom-data/directory-extensions",
        roles: ["admin", "superadmin"]
      },
      {
        title: "Advanced",
        roles: ["superadmin"],
        items: [
          { title: "Super Admin", path: "/cipp/super-admin/tenant-mode", roles: ["superadmin"] },
          {
            title: "Exchange Cmdlets",
            path: "/cipp/advanced/exchange-cmdlets",
            roles: ["superadmin"],
          },
          {
            title: "Timers",
            path: "/cipp/advanced/timers",
            roles: ["superadmin"],
          },
          {
            title: "Table Maintenance",
            path: "/cipp/advanced/table-maintenance",
            roles: ["superadmin"],
          },
        ],
      },
    ],
  },
];
