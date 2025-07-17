import { BuildingOfficeIcon, HomeIcon, UsersIcon, WrenchIcon } from "@heroicons/react/24/outline";
import {
  CloudOutlined,
  HomeRepairService,
  Laptop,
  MailOutline,
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
    permissions: ["CIPP.Core.*"],
  },
  {
    title: "Identity Management",
    type: "header",
    icon: (
      <SvgIcon>
        <UsersIcon />
      </SvgIcon>
    ),
    permissions: ["Identity.*"],
    items: [
      {
        title: "Administration",
        path: "/identity/administration",
        permissions: ["Identity.User.*"],
        items: [
          {
            title: "Users",
            path: "/identity/administration/users",
            permissions: ["Identity.User.*"],
          },
          {
            title: "Risky Users",
            path: "/identity/administration/risky-users",
            permissions: ["Identity.User.*"],
          },
          {
            title: "Groups",
            path: "/identity/administration/groups",
            permissions: ["Identity.Group.*"],
          },
          {
            title: "Group Templates",
            path: "/identity/administration/group-templates",
            permissions: ["Identity.Group.*"],
          },
          {
            title: "Devices",
            path: "/identity/administration/devices",
            permissions: ["Identity.Device.*"],
          },
          {
            title: "Deleted Items",
            path: "/identity/administration/deleted-items",
            permissions: ["Identity.User.*"],
          },
          {
            title: "Roles",
            path: "/identity/administration/roles",
            permissions: ["Identity.Role.*"],
          },
          {
            title: "JIT Admin",
            path: "/identity/administration/jit-admin",
            permissions: ["Identity.Role.*"],
          },
          {
            title: "Offboarding Wizard",
            path: "/identity/administration/offboarding-wizard",
            permissions: ["Identity.User.*"],
          },
        ],
      },
      {
        title: "Reports",
        path: "/identity/reports",
        permissions: [
          "Identity.User.*",
          "Identity.Group.*",
          "Identity.Device.*",
          "Identity.Role.*",
          "Identity.AuditLog.*",
        ],
        items: [
          {
            title: "MFA Report",
            path: "/identity/reports/mfa-report",
            permissions: ["Identity.User.*"],
          },
          {
            title: "Inactive Users",
            path: "/identity/reports/inactive-users-report",
            permissions: ["Identity.User.*"],
          },
          {
            title: "Sign-in Report",
            path: "/identity/reports/signin-report",
            permissions: ["Identity.User.*"],
          },
          {
            title: "AAD Connect Report",
            path: "/identity/reports/azure-ad-connect-report",
            permissions: ["Identity.User.*"],
          },
          {
            title: "Risk Detections",
            path: "/identity/reports/risk-detections",
            permissions: ["Identity.User.*"],
          },
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
    permissions: ["Tenant.*", "Identity.AuditLog.*", "CIPP.Backup.*", "Scheduler.Billing.*"],
    items: [
      {
        title: "Administration",
        path: "/tenant/administration",
        permissions: ["Tenant.Administration.*"],
        items: [
          {
            title: "Tenants",
            path: "/tenant/administration/tenants",
            permissions: ["Tenant.Administration.*"],
          },
          {
            title: "Alert Configuration",
            path: "/tenant/administration/alert-configuration",
            permissions: ["Tenant.Alert.*"],
          },
          {
            title: "Audit Logs",
            path: "/tenant/administration/audit-logs",
            permissions: ["Identity.AuditLog.*"],
          },
          {
            title: "Applications",
            path: "/tenant/administration/applications/enterprise-apps",
            permissions: ["Tenant.Application.*"],
          },
          {
            title: "Secure Score",
            path: "/tenant/administration/securescore",
            permissions: ["Tenant.Administration.*"],
          },
          {
            title: "App Consent Requests",
            path: "/tenant/administration/app-consent-requests",
            permissions: ["Tenant.Application.*"],
          },
          {
            title: "Authentication Methods",
            path: "/tenant/administration/authentication-methods",
            permissions: ["Tenant.Config.*"],
          },
          {
            title: "Partner Relationships",
            path: "/tenant/administration/partner-relationships",
            permissions: ["Tenant.Relationship.*"],
          },
        ],
      },
      {
        title: "GDAP Management",
        path: "/tenant/gdap-management/",
        permissions: ["Tenant.Relationship.*"],
      },
      {
        title: "Configuration Backup",
        path: "/tenant/backup",
        permissions: ["CIPP.Backup.*"],
        items: [
          {
            title: "Backups",
            path: "/tenant/backup/backup-wizard",
            permissions: ["CIPP.Backup.*"],
          },
        ],
      },
      {
        title: "Standards",
        path: "/tenant/standards",
        permissions: [
          "Tenant.Standards.*",
          "Tenant.BestPracticeAnalyser.*",
          "Tenant.DomainAnalyser.*",
        ],
        items: [
          {
            title: "Standard Templates",
            path: "/tenant/standards/list-standards",
            permissions: ["Tenant.Standards.*"],
          },
          {
            title: "Tenant Alignment",
            path: "/tenant/standards/tenant-alignment",
            permissions: ["Tenant.Standards.*"],
          },
          {
            title: "Best Practice Analyser",
            path: "/tenant/standards/bpa-report",
            permissions: ["Tenant.BestPracticeAnalyser.*"],
          },
          {
            title: "Domains Analyser",
            path: "/tenant/standards/domains-analyser",
            permissions: ["Tenant.DomainAnalyser.*"],
          },
        ],
      },
      {
        title: "Conditional Access",
        path: "/tenant/conditional",
        permissions: ["Tenant.ConditionalAccess.*"],
        items: [
          {
            title: "CA Policies",
            path: "/tenant/conditional/list-policies",
            permissions: ["Tenant.ConditionalAccess.*"],
          },
          {
            title: "CA Vacation Mode",
            path: "/tenant/conditional/deploy-vacation",
            permissions: ["Tenant.ConditionalAccess.*"],
          },
          {
            title: "CA Templates",
            path: "/tenant/conditional/list-template",
            permissions: ["Tenant.ConditionalAccess.*"],
          },
          {
            title: "Named Locations",
            path: "/tenant/conditional/list-named-locations",
            permissions: ["Tenant.ConditionalAccess.*"],
          },
        ],
      },
      {
        title: "Reports",
        path: "/tenant/reports",
        permissions: ["Tenant.Administration.*", "Scheduler.Billing.*", "Tenant.Application.*"],
        items: [
          {
            title: "Licence Report",
            path: "/tenant/reports/list-licenses",
            permissions: ["Tenant.Administration.*"],
          },
          {
            title: "Sherweb Licence Report",
            path: "/tenant/reports/list-csp-licenses",
            permissions: ["Tenant.Directory.*"],
          },
          {
            title: "Consented Applications",
            path: "/tenant/reports/application-consent",
            permissions: ["Tenant.Application.*"],
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
    permissions: [
      "Security.Incident.*",
      "Security.Alert.*",
      "Tenant.DeviceCompliance.*",
      "Security.SafeLinksPolicy.*",
    ],
    items: [
      {
        title: "Incidents & Alerts",
        path: "/security/incidents",
        permissions: ["Security.Incident.*"],
        items: [
          {
            title: "Incidents",
            path: "/security/incidents/list-incidents",
            permissions: ["Security.Incident.*"],
          },
          {
            title: "Alerts",
            path: "/security/incidents/list-alerts",
            permissions: ["Security.Alert.*"],
          },
        ],
      },
      {
        title: "Defender",
        path: "/security/defender",
        permissions: ["Security.Alert.*"],
        items: [
          {
            title: "Defender Status",
            path: "/security/defender/list-defender",
            permissions: ["Security.Alert.*"],
          },
          {
            title: "Defender Deployment",
            path: "/security/defender/deployment",
            permissions: ["Security.Alert.*"],
          },
          {
            title: "Vulnerabilities",
            path: "/security/defender/list-defender-tvm",
            permissions: ["Security.Alert.*"],
          },
        ],
      },
      {
        title: "Reports",
        path: "/security/reports",
        permissions: ["Tenant.DeviceCompliance.*"],
        items: [
          {
            title: "Device Compliance",
            path: "/security/reports/list-device-compliance",
            permissions: ["Tenant.DeviceCompliance.*"],
          },
        ],
      },
      {
        title: "Safe Links",
        path: "/security/safelinks",
        permissions: ["Security.SafeLinksPolicy.*"],
        items: [
          {
            title: "Safe Links Policies",
            path: "/security/safelinks/safelinks",
            permissions: ["Security.SafeLinksPolicy.*"],
          },
          {
            title: "Safe Links Templates",
            path: "/security/safelinks/safelinks-template",
            permissions: ["Security.SafeLinksPolicy.*"],
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
    permissions: [
      "Endpoint.Application.*",
      "Endpoint.Autopilot.*",
      "Endpoint.MEM.*",
      "Endpoint.Device.*",
      "Endpoint.Device.Read",
    ],
    items: [
      {
        title: "Applications",
        path: "/endpoint/applications",
        permissions: ["Endpoint.Application.*"],
        items: [
          {
            title: "Applications",
            path: "/endpoint/applications/list",
            permissions: ["Endpoint.Application.*"],
          },
          {
            title: "Application Queue",
            path: "/endpoint/applications/queue",
            permissions: ["Endpoint.Application.*"],
          },
        ],
      },
      {
        title: "Autopilot",
        path: "/endpoint/autopilot",
        permissions: ["Endpoint.Autopilot.*"],
        items: [
          {
            title: "Autopilot Devices",
            path: "/endpoint/autopilot/list-devices",
            permissions: ["Endpoint.Autopilot.*"],
          },
          {
            title: "Add Autopilot Device",
            path: "/endpoint/autopilot/add-device",
            permissions: ["Endpoint.Autopilot.*"],
          },
          {
            title: "Profiles",
            path: "/endpoint/autopilot/list-profiles",
            permissions: ["Endpoint.Autopilot.*"],
          },
          {
            title: "Status Pages",
            path: "/endpoint/autopilot/list-status-pages",
            permissions: ["Endpoint.Autopilot.*"],
          },
          {
            title: "Add Status Page",
            path: "/endpoint/autopilot/add-status-page",
            permissions: ["Endpoint.Autopilot.*"],
          },
        ],
      },
      {
        title: "Device Management",
        path: "/endpoint/MEM",
        permissions: ["Endpoint.MEM.*"],
        items: [
          {
            title: "Devices",
            path: "/endpoint/MEM/devices",
            permissions: ["Endpoint.Device.*"],
          },
          {
            title: "Configuration Policies",
            path: "/endpoint/MEM/list-policies",
            permissions: ["Endpoint.MEM.*"],
          },
          {
            title: "Compliance Policies",
            path: "/endpoint/MEM/list-compliance-policies",
            permissions: ["Endpoint.MEM.*"],
          },
          {
            title: "Protection Policies",
            path: "/endpoint/MEM/list-appprotection-policies",
            permissions: ["Endpoint.MEM.*"],
          },
          {
            title: "Apply Policy",
            path: "/endpoint/MEM/add-policy",
            permissions: ["Endpoint.MEM.*"],
          },
          {
            title: "Policy Templates",
            path: "/endpoint/MEM/list-templates",
            permissions: ["Endpoint.MEM.*"],
          },
          {
            title: "Scripts",
            path: "/endpoint/MEM/list-scripts",
            permissions: ["Endpoint.MEM.*"],
          },
        ],
      },
      {
        title: "Reports",
        path: "/endpoint/reports",
        permissions: ["Endpoint.Device.*", "Endpoint.Autopilot.*"],
        items: [
          {
            title: "Analytics Device Score",
            path: "/endpoint/reports/analyticsdevicescore",
            permissions: ["Endpoint.Device.*"],
          },
          {
            title: "Work from anywhere",
            path: "/endpoint/reports/workfromanywhere",
            permissions: ["Endpoint.Device.*"],
          },
          {
            title: "Autopilot Deployments",
            path: "/endpoint/reports/autopilot-deployment",
            permissions: ["Endpoint.Autopilot.*"],
          },
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
    permissions: [
      "Sharepoint.Site.*",
      "Sharepoint.Admin.*",
      "Teams.Group.*",
      "Teams.Activity.*",
      "Teams.Voice.*",
    ],
    items: [
      {
        title: "OneDrive",
        path: "/teams-share/onedrive",
        permissions: ["Sharepoint.Site.*"],
      },
      {
        title: "SharePoint",
        path: "/teams-share/sharepoint",
        permissions: ["Sharepoint.Admin.*"],
      },
      {
        title: "Teams",
        path: "/teams-share/teams",
        permissions: ["Teams.Group.*"],
        items: [
          {
            title: "Teams",
            path: "/teams-share/teams/list-team",
            permissions: ["Teams.Group.*"],
          },
          {
            title: "Teams Activity",
            path: "/teams-share/teams/teams-activity",
            permissions: ["Teams.Activity.*"],
          },
          {
            title: "Business Voice",
            path: "/teams-share/teams/business-voice",
            permissions: ["Teams.Voice.*"],
          },
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
    permissions: [
      "Exchange.Mailbox.*",
      "Exchange.Contact.*",
      "Exchange.SpamFilter.*",
      "Exchange.TransportRule.*",
      "Exchange.Connector.*",
      "Exchange.ConnectionFilter.*",
      "Exchange.Equipment.*",
      "Exchange.Room.*",
      "Exchange.SafeLinks.*",
      "Exchange.Group.*",
    ],
    items: [
      {
        title: "Administration",
        path: "/email/administration",
        permissions: ["Exchange.Mailbox.*"],
        items: [
          {
            title: "Mailboxes",
            path: "/email/administration/mailboxes",
            permissions: ["Exchange.Mailbox.*"],
          },
          {
            title: "Deleted Mailboxes",
            path: "/email/administration/deleted-mailboxes",
            permissions: ["Exchange.Mailbox.*"],
          },
          {
            title: "Mailbox Rules",
            path: "/email/administration/mailbox-rules",
            permissions: ["Exchange.Mailbox.*"],
          },
          {
            title: "Contacts",
            path: "/email/administration/contacts",
            permissions: ["Exchange.Contact.*"],
          },
          {
            title: "Contact Templates",
            path: "/email/administration/contacts-template",
            permissions: ["Exchange.Contact.*"],
          },
          {
            title: "Quarantine",
            path: "/email/administration/quarantine",
            permissions: ["Exchange.SpamFilter.*"],
          },
          {
            title: "Tenant Allow/Block Lists",
            path: "/email/administration/tenant-allow-block-lists",
            permissions: ["Exchange.SpamFilter.*"],
          },
        ],
      },
      {
        title: "Transport",
        path: "/email/transport",
        permissions: ["Exchange.TransportRule.*"],
        items: [
          {
            title: "Transport rules",
            path: "/email/transport/list-rules",
            permissions: ["Exchange.TransportRule.*"],
          },
          {
            title: "Transport Templates",
            path: "/email/transport/list-templates",
            permissions: ["Exchange.TransportRule.*"],
          },
          {
            title: "Connectors",
            path: "/email/transport/list-connectors",
            permissions: ["Exchange.Connector.*"],
          },
          {
            title: "Connector Templates",
            path: "/email/transport/list-connector-templates",
            permissions: ["Exchange.Connector.*"],
          },
        ],
      },
      {
        title: "Spamfilter",
        path: "/email/spamfilter",
        permissions: ["Exchange.SpamFilter.*"],
        items: [
          {
            title: "Spamfilter",
            path: "/email/spamfilter/list-spamfilter",
            permissions: ["Exchange.SpamFilter.*"],
          },
          {
            title: "Spamfilter templates",
            path: "/email/spamfilter/list-templates",
            permissions: ["Exchange.SpamFilter.*"],
          },
          {
            title: "Connection filter",
            path: "/email/spamfilter/list-connectionfilter",
            permissions: ["Exchange.ConnectionFilter.*"],
          },
          {
            title: "Connection filter templates",
            path: "/email/spamfilter/list-connectionfilter-templates",
            permissions: ["Exchange.ConnectionFilter.*"],
          },
          {
            title: "Quarantine Policies",
            path: "/email/spamfilter/list-quarantine-policies",
            permissions: ["Exchange.SpamFilter.*"],
          },
        ],
      },
      {
        title: "Resource Management",
        path: "/email/resources/management",
        permissions: ["Exchange.Equipment.*"],
        items: [
          {
            title: "Equipment",
            path: "/email/resources/management/equipment",
            permissions: ["Exchange.Equipment.*"],
          },
          {
            title: "Rooms",
            path: "/email/resources/management/list-rooms",
            permissions: ["Exchange.Room.*"],
          },
          {
            title: "Room Lists",
            path: "/email/resources/management/room-lists",
            permissions: ["Exchange.Room.*"],
          },
        ],
      },
      {
        title: "Reports",
        path: "/email/reports",
        permissions: [
          "Exchange.Mailbox.*",
          "Exchange.SpamFilter.*",
          "Exchange.SafeLinks.*",
          "Exchange.Group.*",
        ],
        items: [
          {
            title: "Mailbox Statistics",
            path: "/email/reports/mailbox-statistics",
            permissions: ["Exchange.Mailbox.*"],
          },
          {
            title: "Mailbox Activity",
            path: "/email/reports/mailbox-activity",
            permissions: ["Exchange.Mailbox.*"],
          },
          {
            title: "Mailbox Client Access Settings",
            path: "/email/reports/mailbox-cas-settings",
            permissions: ["Exchange.Mailbox.*"],
          },
          {
            title: "Anti-Phishing Filters",
            path: "/email/reports/antiphishing-filters",
            permissions: ["Exchange.SpamFilter.*"],
          },
          {
            title: "Malware Filters",
            path: "/email/reports/malware-filters",
            permissions: ["Exchange.SpamFilter.*"],
          },
          {
            title: "Safe Links Filters",
            path: "/email/reports/safelinks-filters",
            permissions: ["Exchange.SafeLinks.*"],
          },
          {
            title: "Safe Attachments Filters",
            path: "/email/reports/safeattachments-filters",
            permissions: ["Exchange.SafeLinks.*"],
          },
          {
            title: "Shared Mailbox with Enabled Account",
            path: "/email/reports/SharedMailboxEnabledAccount",
            permissions: ["Exchange.Mailbox.*"],
          },
          {
            title: "Global Address List",
            path: "/email/reports/global-address-list",
            permissions: ["Exchange.Group.*"],
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
    permissions: [
      "CIPP.*",
      "Tenant.Administration.*",
      "Tenant.Application.*",
      "Tenant.DomainAnalyser.*",
      "Exchange.Mailbox.*",
    ],
    items: [
      {
        title: "Tenant Tools",
        path: "/tenant/tools",
        permissions: ["Tenant.Administration.*"],
        items: [
          {
            title: "Graph Explorer",
            path: "/tenant/tools/graph-explorer",
            permissions: ["Tenant.Administration.*"],
          },
          {
            title: "Application Approval",
            path: "/tenant/tools/appapproval",
            permissions: ["Tenant.Application.*"],
          },
          {
            title: "Tenant Lookup",
            path: "/tenant/tools/tenantlookup",
            permissions: ["Tenant.Administration.*"],
          },

          {
            title: "IP Database",
            path: "/tenant/tools/geoiplookup",
            permissions: ["CIPP.Core.*"],
          },

          {
            title: "Individual Domain Check",
            path: "/tenant/tools/individual-domains",
            permissions: ["Tenant.DomainAnalyser.*"],
          },
        ],
      },
      {
        title: "Email Tools",
        path: "/email/tools",
        permissions: ["Exchange.Mailbox.*"],
        items: [
          {
            title: "Message Trace",
            path: "/email/tools/message-trace",
            permissions: ["Exchange.Mailbox.*"],
          },
          {
            title: "Mailbox Restores",
            path: "/email/tools/mailbox-restores",
            permissions: ["Exchange.Mailbox.*"],
          },
          {
            title: "Message Viewer",
            path: "/email/tools/message-viewer",
            permissions: ["Exchange.Mailbox.*"],
          },
        ],
      },
      {
        title: "Dark Web Tools",
        path: "/tools/darkweb",
        permissions: ["CIPP.Core.*"],
        items: [
          {
            title: "Tenant Breach Lookup",
            path: "/tools/tenantbreachlookup",
            permissions: ["CIPP.Core.*"],
          },
          {
            title: "Breach Lookup",
            path: "/tools/breachlookup",
            permissions: ["CIPP.Core.*"],
          },
        ],
      },
      {
        title: "Template Library",
        path: "/tools/templatelib",
        roles: ["editor", "admin", "superadmin"],
        permissions: ["CIPP.Core.*"],
      },
      {
        title: "Community Repositories",
        path: "/tools/community-repos",
        roles: ["editor", "admin", "superadmin"],
        permissions: ["CIPP.Core.*"],
      },
      {
        title: "Scheduler",
        path: "/cipp/scheduler",
        roles: ["editor", "admin", "superadmin"],
        permissions: ["CIPP.Scheduler.*"],
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
    permissions: [
      "CIPP.*", // Pattern matching - matches any CIPP permission
    ],
    items: [
      {
        title: "Application Settings",
        path: "/cipp/settings",
        roles: ["admin", "superadmin"],
        permissions: ["CIPP.AppSettings.*"],
      },
      {
        title: "Logbook",
        path: "/cipp/logs",
        roles: ["editor", "admin", "superadmin"],
        permissions: ["CIPP.Core.*"],
      },
      {
        title: "Setup Wizard",
        path: "/onboardingv2",
        roles: ["admin", "superadmin"],
        permissions: ["CIPP.Core.*"],
      },
      {
        title: "Integrations",
        path: "/cipp/integrations",
        roles: ["admin", "superadmin"],
        permissions: ["CIPP.Extension.*"],
      },
      {
        title: "Custom Data",
        path: "/cipp/custom-data/directory-extensions",
        roles: ["admin", "superadmin"],
        permissions: ["CIPP.Core.*"],
      },
      {
        title: "Advanced",
        roles: ["superadmin"],
        permissions: ["CIPP.SuperAdmin.*"],
        items: [
          {
            title: "Super Admin",
            path: "/cipp/super-admin/tenant-mode",
            roles: ["superadmin"],
            permissions: ["CIPP.SuperAdmin.*"],
          },
          {
            title: "Exchange Cmdlets",
            path: "/cipp/advanced/exchange-cmdlets",
            roles: ["superadmin"],
            permissions: ["CIPP.SuperAdmin.*"],
          },
          {
            title: "Timers",
            path: "/cipp/advanced/timers",
            roles: ["superadmin"],
            permissions: ["CIPP.SuperAdmin.*"],
          },
          {
            title: "Table Maintenance",
            path: "/cipp/advanced/table-maintenance",
            roles: ["superadmin"],
            permissions: ["CIPP.SuperAdmin.*"],
          },
        ],
      },
    ],
  },
];
