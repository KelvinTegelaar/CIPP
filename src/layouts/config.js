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
    permissions: ["CIPP.Core.Read", "CIPP.Core.ReadWrite"],
  },
  {
    title: "Identity Management",
    type: "header",
    icon: (
      <SvgIcon>
        <UsersIcon />
      </SvgIcon>
    ),
    permissions: [
      "Identity.User.ReadWrite",
      "Identity.User.Read",
      "Identity.Group.ReadWrite",
      "Identity.Group.Read",
      "Identity.Device.ReadWrite",
      "Identity.Device.Read",
      "Identity.Role.ReadWrite",
      "Identity.Role.Read",
      "Identity.AuditLog.ReadWrite",
      "Identity.AuditLog.Read",
    ],
    items: [
      {
        title: "Administration",
        path: "/identity/administration",
        permissions: ["Identity.User.ReadWrite", "Identity.User.Read"],
        items: [
          {
            title: "Users",
            path: "/identity/administration/users",
            permissions: ["Identity.User.ReadWrite", "Identity.User.Read"],
          },
          {
            title: "Risky Users",
            path: "/identity/administration/risky-users",
            permissions: ["Identity.User.ReadWrite", "Identity.User.Read"],
          },
          {
            title: "Groups",
            path: "/identity/administration/groups",
            permissions: ["Identity.Group.ReadWrite", "Identity.Group.Read"],
          },
          {
            title: "Group Templates",
            path: "/identity/administration/group-templates",
            permissions: ["Identity.Group.ReadWrite", "Identity.Group.Read"],
          },
          {
            title: "Devices",
            path: "/identity/administration/devices",
            permissions: ["Identity.Device.ReadWrite", "Identity.Device.Read"],
          },
          {
            title: "Deleted Items",
            path: "/identity/administration/deleted-items",
            permissions: ["Identity.User.ReadWrite", "Identity.User.Read"],
          },
          {
            title: "Roles",
            path: "/identity/administration/roles",
            permissions: ["Identity.Role.ReadWrite", "Identity.Role.Read"],
          },
          {
            title: "JIT Admin",
            path: "/identity/administration/jit-admin",
            permissions: ["Identity.Role.ReadWrite", "Identity.Role.Read"],
          },
          {
            title: "Offboarding Wizard",
            path: "/identity/administration/offboarding-wizard",
            permissions: ["Identity.User.ReadWrite", "Identity.User.Read"],
          },
        ],
      },
      {
        title: "Reports",
        path: "/identity/reports",
        permissions: [
          "Identity.User.ReadWrite",
          "Identity.User.Read",
          "Identity.Group.ReadWrite",
          "Identity.Group.Read",
          "Identity.Device.ReadWrite",
          "Identity.Device.Read",
          "Identity.Role.ReadWrite",
          "Identity.Role.Read",
          "Identity.AuditLog.ReadWrite",
          "Identity.AuditLog.Read",
        ],
        items: [
          {
            title: "MFA Report",
            path: "/identity/reports/mfa-report",
            permissions: ["Identity.User.ReadWrite", "Identity.User.Read"],
          },
          {
            title: "Inactive Users",
            path: "/identity/reports/inactive-users-report",
            permissions: ["Identity.User.ReadWrite", "Identity.User.Read"],
          },
          {
            title: "Sign-in Report",
            path: "/identity/reports/signin-report",
            permissions: ["Identity.User.ReadWrite", "Identity.User.Read"],
          },
          {
            title: "AAD Connect Report",
            path: "/identity/reports/azure-ad-connect-report",
            permissions: ["Identity.User.ReadWrite", "Identity.User.Read"],
          },
          {
            title: "Risk Detections",
            path: "/identity/reports/risk-detections",
            permissions: ["Identity.User.ReadWrite", "Identity.User.Read"],
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
    permissions: [
      "Tenant.Administration.ReadWrite",
      "Tenant.Administration.Read",
      "Tenant.Alert.ReadWrite",
      "Tenant.Alert.Read",
      "Identity.AuditLog.ReadWrite",
      "Identity.AuditLog.Read",
      "Tenant.Application.ReadWrite",
      "Tenant.Application.Read",
      "Tenant.Config.ReadWrite",
      "Tenant.Config.Read",
      "Tenant.Relationship.ReadWrite",
      "Tenant.Relationship.Read",
      "CIPP.Backup.ReadWrite",
      "CIPP.Backup.Read",
      "Tenant.Standards.ReadWrite",
      "Tenant.Standards.Read",
      "Tenant.BestPracticeAnalyser.ReadWrite",
      "Tenant.BestPracticeAnalyser.Read",
      "Tenant.DomainAnalyser.ReadWrite",
      "Tenant.DomainAnalyser.Read",
      "Tenant.ConditionalAccess.ReadWrite",
      "Tenant.ConditionalAccess.Read",
      "Scheduler.Billing.ReadWrite",
      "Scheduler.Billing.Read",
    ],
    items: [
      {
        title: "Administration",
        path: "/tenant/administration",
        permissions: ["Tenant.Administration.ReadWrite", "Tenant.Administration.Read"],
        items: [
          {
            title: "Tenants",
            path: "/tenant/administration/tenants",
            permissions: ["Tenant.Administration.ReadWrite", "Tenant.Administration.Read"],
          },
          {
            title: "Alert Configuration",
            path: "/tenant/administration/alert-configuration",
            permissions: ["Tenant.Alert.ReadWrite", "Tenant.Alert.Read"],
          },
          {
            title: "Audit Logs",
            path: "/tenant/administration/audit-logs",
            permissions: ["Identity.AuditLog.ReadWrite", "Identity.AuditLog.Read"],
          },
          {
            title: "Applications",
            path: "/tenant/administration/applications/enterprise-apps",
            permissions: ["Tenant.Application.ReadWrite", "Tenant.Application.Read"],
          },
          {
            title: "Secure Score",
            path: "/tenant/administration/securescore",
            permissions: ["Tenant.Administration.Read"],
          },
          {
            title: "App Consent Requests",
            path: "/tenant/administration/app-consent-requests",
            permissions: ["Tenant.Application.ReadWrite", "Tenant.Application.Read"],
          },
          {
            title: "Authentication Methods",
            path: "/tenant/administration/authentication-methods",
            permissions: ["Tenant.Config.ReadWrite", "Tenant.Config.Read"],
          },
          {
            title: "Partner Relationships",
            path: "/tenant/administration/partner-relationships",
            permissions: ["Tenant.Relationship.ReadWrite", "Tenant.Relationship.Read"],
          },
        ],
      },
      {
        title: "GDAP Management",
        path: "/tenant/gdap-management/",
        permissions: ["Tenant.Relationship.ReadWrite", "Tenant.Relationship.Read"],
      },
      {
        title: "Configuration Backup",
        path: "/tenant/backup",
        permissions: ["CIPP.Backup.ReadWrite", "CIPP.Backup.Read"],
        items: [
          {
            title: "Backups",
            path: "/tenant/backup/backup-wizard",
            permissions: ["CIPP.Backup.ReadWrite", "CIPP.Backup.Read"],
          },
        ],
      },
      {
        title: "Standards",
        path: "/tenant/standards",
        permissions: [
          "Tenant.Standards.ReadWrite",
          "Tenant.Standards.Read",
          "Tenant.BestPracticeAnalyser.ReadWrite",
          "Tenant.BestPracticeAnalyser.Read",
          "Tenant.DomainAnalyser.ReadWrite",
          "Tenant.DomainAnalyser.Read",
        ],
        items: [
          {
            title: "Standards",
            path: "/tenant/standards/list-standards",
            permissions: ["Tenant.Standards.ReadWrite", "Tenant.Standards.Read"],
          },
          {
            title: "Best Practice Analyser",
            path: "/tenant/standards/bpa-report",
            permissions: [
              "Tenant.BestPracticeAnalyser.ReadWrite",
              "Tenant.BestPracticeAnalyser.Read",
            ],
          },
          {
            title: "Domains Analyser",
            path: "/tenant/standards/domains-analyser",
            permissions: ["Tenant.DomainAnalyser.ReadWrite", "Tenant.DomainAnalyser.Read"],
          },
        ],
      },
      {
        title: "Conditional Access",
        path: "/tenant/conditional",
        permissions: ["Tenant.ConditionalAccess.ReadWrite", "Tenant.ConditionalAccess.Read"],
        items: [
          {
            title: "CA Policies",
            path: "/tenant/conditional/list-policies",
            permissions: ["Tenant.ConditionalAccess.ReadWrite", "Tenant.ConditionalAccess.Read"],
          },
          {
            title: "CA Vacation Mode",
            path: "/tenant/conditional/deploy-vacation",
            permissions: ["Tenant.ConditionalAccess.ReadWrite", "Tenant.ConditionalAccess.Read"],
          },
          {
            title: "CA Templates",
            path: "/tenant/conditional/list-template",
            permissions: ["Tenant.ConditionalAccess.ReadWrite", "Tenant.ConditionalAccess.Read"],
          },
          {
            title: "Named Locations",
            path: "/tenant/conditional/list-named-locations",
            permissions: ["Tenant.ConditionalAccess.ReadWrite", "Tenant.ConditionalAccess.Read"],
          },
        ],
      },
      {
        title: "Reports",
        path: "/tenant/reports",
        permissions: [
          "Tenant.Administration.ReadWrite",
          "Tenant.Administration.Read",
          "Scheduler.Billing.ReadWrite",
          "Scheduler.Billing.Read",
          "Tenant.Application.ReadWrite",
          "Tenant.Application.Read",
        ],
        items: [
          {
            title: "Licence Report",
            path: "/tenant/reports/list-licenses",
            permissions: ["Tenant.Administration.ReadWrite", "Tenant.Administration.Read"],
          },
          {
            title: "Sherweb Licence Report",
            path: "/tenant/reports/list-csp-licenses",
            permissions: [
              "Scheduler.Billing.ReadWrite",
              "Scheduler.Billing.Read",
              "Tenant.Application.ReadWrite",
              "Tenant.Application.Read",
              "Tenant.Administration.Read",
              "Tenant.Administration.ReadWrite",
            ],
          },
          {
            title: "Consented Applications",
            path: "/tenant/reports/application-consent",
            permissions: ["Tenant.Application.ReadWrite", "Tenant.Application.Read"],
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
      "Security.Incident.ReadWrite",
      "Security.Incident.Read",
      "Security.Alert.ReadWrite",
      "Security.Alert.Read",
      "Tenant.DeviceCompliance.ReadWrite",
      "Tenant.DeviceCompliance.Read",
      "Security.SafeLinksPolicy.ReadWrite",
      "Security.SafeLinksPolicy.Read",
    ],
    items: [
      {
        title: "Incidents & Alerts",
        path: "/security/incidents",
        permissions: ["Security.Incident.ReadWrite", "Security.Incident.Read"],
        items: [
          {
            title: "Incidents",
            path: "/security/incidents/list-incidents",
            permissions: ["Security.Incident.ReadWrite", "Security.Incident.Read"],
          },
          {
            title: "Alerts",
            path: "/security/incidents/list-alerts",
            permissions: ["Security.Alert.ReadWrite", "Security.Alert.Read"],
          },
        ],
      },
      {
        title: "Defender",
        path: "/security/defender",
        permissions: ["Security.Alert.ReadWrite", "Security.Alert.Read"],
        items: [
          {
            title: "Defender Status",
            path: "/security/defender/list-defender",
            permissions: ["Security.Alert.ReadWrite", "Security.Alert.Read"],
          },
          {
            title: "Defender Deployment",
            path: "/security/defender/deployment",
            permissions: ["Security.Alert.ReadWrite", "Security.Alert.Read"],
          },
          {
            title: "Vulnerabilities",
            path: "/security/defender/list-defender-tvm",
            permissions: ["Security.Alert.ReadWrite", "Security.Alert.Read"],
          },
        ],
      },
      {
        title: "Reports",
        path: "/security/reports",
        permissions: ["Tenant.DeviceCompliance.ReadWrite", "Tenant.DeviceCompliance.Read"],
        items: [
          {
            title: "Device Compliance",
            path: "/security/reports/list-device-compliance",
            permissions: ["Tenant.DeviceCompliance.ReadWrite", "Tenant.DeviceCompliance.Read"],
          },
        ],
      },
      {
        title: "Safe Links",
        path: "/security/safelinks",
        permissions: ["Security.SafeLinksPolicy.ReadWrite", "Security.SafeLinksPolicy.Read"],
        items: [
          {
            title: "Safe Links Policies",
            path: "/security/safelinks/safelinks",
            permissions: ["Security.SafeLinksPolicy.ReadWrite", "Security.SafeLinksPolicy.Read"],
          },
          {
            title: "Safe Links Templates",
            path: "/security/safelinks/safelinks-template",
            permissions: ["Security.SafeLinksPolicy.ReadWrite", "Security.SafeLinksPolicy.Read"],
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
      "Endpoint.Application.ReadWrite",
      "Endpoint.Application.Read",
      "Endpoint.Autopilot.ReadWrite",
      "Endpoint.Autopilot.Read",
      "Endpoint.MEM.ReadWrite",
      "Endpoint.MEM.Read",
      "Endpoint.Device.ReadWrite",
      "Endpoint.Device.Read",
    ],
    items: [
      {
        title: "Applications",
        path: "/endpoint/applications",
        permissions: ["Endpoint.Application.ReadWrite", "Endpoint.Application.Read"],
        items: [
          {
            title: "Applications",
            path: "/endpoint/applications/list",
            permissions: ["Endpoint.Application.ReadWrite", "Endpoint.Application.Read"],
          },
          {
            title: "Application Queue",
            path: "/endpoint/applications/queue",
            permissions: ["Endpoint.Application.ReadWrite", "Endpoint.Application.Read"],
          },
        ],
      },
      {
        title: "Autopilot",
        path: "/endpoint/autopilot",
        permissions: ["Endpoint.Autopilot.ReadWrite", "Endpoint.Autopilot.Read"],
        items: [
          {
            title: "Autopilot Devices",
            path: "/endpoint/autopilot/list-devices",
            permissions: ["Endpoint.Autopilot.ReadWrite", "Endpoint.Autopilot.Read"],
          },
          {
            title: "Add Autopilot Device",
            path: "/endpoint/autopilot/add-device",
            permissions: ["Endpoint.Autopilot.ReadWrite", "Endpoint.Autopilot.Read"],
          },
          {
            title: "Profiles",
            path: "/endpoint/autopilot/list-profiles",
            permissions: ["Endpoint.Autopilot.ReadWrite", "Endpoint.Autopilot.Read"],
          },
          {
            title: "Status Pages",
            path: "/endpoint/autopilot/list-status-pages",
            permissions: ["Endpoint.Autopilot.ReadWrite", "Endpoint.Autopilot.Read"],
          },
          {
            title: "Add Status Page",
            path: "/endpoint/autopilot/add-status-page",
            permissions: ["Endpoint.Autopilot.ReadWrite", "Endpoint.Autopilot.Read"],
          },
        ],
      },
      {
        title: "Device Management",
        path: "/endpoint/MEM",
        permissions: ["Endpoint.MEM.ReadWrite", "Endpoint.MEM.Read"],
        items: [
          {
            title: "Devices",
            path: "/endpoint/MEM/devices",
            permissions: ["Endpoint.Device.ReadWrite", "Endpoint.Device.Read"],
          },
          {
            title: "Configuration Policies",
            path: "/endpoint/MEM/list-policies",
            permissions: ["Endpoint.MEM.ReadWrite", "Endpoint.MEM.Read"],
          },
          {
            title: "Compliance Policies",
            path: "/endpoint/MEM/list-compliance-policies",
            permissions: ["Endpoint.MEM.ReadWrite", "Endpoint.MEM.Read"],
          },
          {
            title: "Protection Policies",
            path: "/endpoint/MEM/list-appprotection-policies",
            permissions: ["Endpoint.MEM.ReadWrite", "Endpoint.MEM.Read"],
          },
          {
            title: "Apply Policy",
            path: "/endpoint/MEM/add-policy",
            permissions: ["Endpoint.MEM.ReadWrite", "Endpoint.MEM.Read"],
          },
          {
            title: "Policy Templates",
            path: "/endpoint/MEM/list-templates",
            permissions: ["Endpoint.MEM.ReadWrite", "Endpoint.MEM.Read"],
          },
          {
            title: "Scripts",
            path: "/endpoint/MEM/list-scripts",
            permissions: ["Endpoint.MEM.ReadWrite", "Endpoint.MEM.Read"],
          },
        ],
      },
      {
        title: "Reports",
        path: "/endpoint/reports",
        permissions: [
          "Endpoint.Device.ReadWrite",
          "Endpoint.Device.Read",
          "Endpoint.Autopilot.ReadWrite",
          "Endpoint.Autopilot.Read",
        ],
        items: [
          {
            title: "Analytics Device Score",
            path: "/endpoint/reports/analyticsdevicescore",
            permissions: ["Endpoint.Device.ReadWrite", "Endpoint.Device.Read"],
          },
          {
            title: "Work from anywhere",
            path: "/endpoint/reports/workfromanywhere",
            permissions: ["Endpoint.Device.ReadWrite", "Endpoint.Device.Read"],
          },
          {
            title: "Autopilot Deployments",
            path: "/endpoint/reports/autopilot-deployment",
            permissions: ["Endpoint.Autopilot.ReadWrite", "Endpoint.Autopilot.Read"],
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
      "Sharepoint.Site.ReadWrite",
      "Sharepoint.Site.Read",
      "Sharepoint.Admin.ReadWrite",
      "Sharepoint.Admin.Read",
      "Teams.Group.ReadWrite",
      "Teams.Group.Read",
      "Teams.Activity.ReadWrite",
      "Teams.Activity.Read",
      "Teams.Voice.ReadWrite",
      "Teams.Voice.Read",
    ],
    items: [
      {
        title: "OneDrive",
        path: "/teams-share/onedrive",
        permissions: ["Sharepoint.Site.ReadWrite", "Sharepoint.Site.Read"],
      },
      {
        title: "SharePoint",
        path: "/teams-share/sharepoint",
        permissions: ["Sharepoint.Admin.ReadWrite", "Sharepoint.Admin.Read"],
      },
      {
        title: "Teams",
        path: "/teams-share/teams",
        permissions: ["Teams.Group.ReadWrite", "Teams.Group.Read"],
        items: [
          {
            title: "Teams",
            path: "/teams-share/teams/list-team",
            permissions: ["Teams.Group.ReadWrite", "Teams.Group.Read"],
          },
          {
            title: "Teams Activity",
            path: "/teams-share/teams/teams-activity",
            permissions: ["Teams.Activity.ReadWrite", "Teams.Activity.Read"],
          },
          {
            title: "Business Voice",
            path: "/teams-share/teams/business-voice",
            permissions: ["Teams.Voice.ReadWrite", "Teams.Voice.Read"],
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
      "Exchange.Mailbox.ReadWrite",
      "Exchange.Mailbox.Read",
      "Exchange.Contact.ReadWrite",
      "Exchange.Contact.Read",
      "Exchange.SpamFilter.ReadWrite",
      "Exchange.SpamFilter.Read",
      "Exchange.TransportRule.ReadWrite",
      "Exchange.TransportRule.Read",
      "Exchange.Connector.ReadWrite",
      "Exchange.Connector.Read",
      "Exchange.ConnectionFilter.ReadWrite",
      "Exchange.ConnectionFilter.Read",
      "Exchange.Equipment.ReadWrite",
      "Exchange.Equipment.Read",
      "Exchange.Room.ReadWrite",
      "Exchange.Room.Read",
      "Exchange.SafeLinks.ReadWrite",
      "Exchange.SafeLinks.Read",
      "Exchange.Group.ReadWrite",
      "Exchange.Group.Read",
    ],
    items: [
      {
        title: "Administration",
        path: "/email/administration",
        permissions: ["Exchange.Mailbox.ReadWrite", "Exchange.Mailbox.Read"],
        items: [
          {
            title: "Mailboxes",
            path: "/email/administration/mailboxes",
            permissions: ["Exchange.Mailbox.ReadWrite", "Exchange.Mailbox.Read"],
          },
          {
            title: "Deleted Mailboxes",
            path: "/email/administration/deleted-mailboxes",
            permissions: ["Exchange.Mailbox.ReadWrite", "Exchange.Mailbox.Read"],
          },
          {
            title: "Mailbox Rules",
            path: "/email/administration/mailbox-rules",
            permissions: ["Exchange.Mailbox.ReadWrite", "Exchange.Mailbox.Read"],
          },
          {
            title: "Contacts",
            path: "/email/administration/contacts",
            permissions: ["Exchange.Contact.ReadWrite", "Exchange.Contact.Read"],
          },
          {
            title: "Contact Templates",
            path: "/email/administration/contacts-template",
            permissions: ["Exchange.Contact.ReadWrite", "Exchange.Contact.Read"],
          },
          {
            title: "Quarantine",
            path: "/email/administration/quarantine",
            permissions: ["Exchange.SpamFilter.ReadWrite", "Exchange.SpamFilter.Read"],
          },
          {
            title: "Tenant Allow/Block Lists",
            path: "/email/administration/tenant-allow-block-lists",
            permissions: ["Exchange.SpamFilter.ReadWrite", "Exchange.SpamFilter.Read"],
          },
        ],
      },
      {
        title: "Transport",
        path: "/email/transport",
        permissions: ["Exchange.TransportRule.ReadWrite", "Exchange.TransportRule.Read"],
        items: [
          {
            title: "Transport rules",
            path: "/email/transport/list-rules",
            permissions: ["Exchange.TransportRule.ReadWrite", "Exchange.TransportRule.Read"],
          },
          {
            title: "Transport Templates",
            path: "/email/transport/list-templates",
            permissions: ["Exchange.TransportRule.ReadWrite", "Exchange.TransportRule.Read"],
          },
          {
            title: "Connectors",
            path: "/email/transport/list-connectors",
            permissions: ["Exchange.Connector.ReadWrite", "Exchange.Connector.Read"],
          },
          {
            title: "Connector Templates",
            path: "/email/transport/list-connector-templates",
            permissions: ["Exchange.Connector.ReadWrite", "Exchange.Connector.Read"],
          },
        ],
      },
      {
        title: "Spamfilter",
        path: "/email/spamfilter",
        permissions: ["Exchange.SpamFilter.ReadWrite", "Exchange.SpamFilter.Read"],
        items: [
          {
            title: "Spamfilter",
            path: "/email/spamfilter/list-spamfilter",
            permissions: ["Exchange.SpamFilter.ReadWrite", "Exchange.SpamFilter.Read"],
          },
          {
            title: "Spamfilter templates",
            path: "/email/spamfilter/list-templates",
            permissions: ["Exchange.SpamFilter.ReadWrite", "Exchange.SpamFilter.Read"],
          },
          {
            title: "Connection filter",
            path: "/email/spamfilter/list-connectionfilter",
            permissions: ["Exchange.ConnectionFilter.ReadWrite", "Exchange.ConnectionFilter.Read"],
          },
          {
            title: "Connection filter templates",
            path: "/email/spamfilter/list-connectionfilter-templates",
            permissions: ["Exchange.ConnectionFilter.ReadWrite", "Exchange.ConnectionFilter.Read"],
          },
          {
            title: "Quarantine Policies",
            path: "/email/spamfilter/list-quarantine-policies",
            permissions: ["Exchange.SpamFilter.ReadWrite", "Exchange.SpamFilter.Read"],
          },
        ],
      },
      {
        title: "Resource Management",
        path: "/email/resources/management",
        permissions: ["Exchange.Equipment.ReadWrite", "Exchange.Equipment.Read"],
        items: [
          {
            title: "Equipment",
            path: "/email/resources/management/equipment",
            permissions: ["Exchange.Equipment.ReadWrite", "Exchange.Equipment.Read"],
          },
          {
            title: "Rooms",
            path: "/email/resources/management/list-rooms",
            permissions: ["Exchange.Room.ReadWrite", "Exchange.Room.Read"],
          },
          {
            title: "Room Lists",
            path: "/email/resources/management/room-lists",
            permissions: ["Exchange.Room.ReadWrite", "Exchange.Room.Read"],
          },
        ],
      },
      {
        title: "Reports",
        path: "/email/reports",
        permissions: [
          "Exchange.Mailbox.ReadWrite",
          "Exchange.Mailbox.Read",
          "Exchange.SpamFilter.ReadWrite",
          "Exchange.SpamFilter.Read",
          "Exchange.SafeLinks.ReadWrite",
          "Exchange.SafeLinks.Read",
          "Exchange.Group.ReadWrite",
          "Exchange.Group.Read",
        ],
        items: [
          {
            title: "Mailbox Statistics",
            path: "/email/reports/mailbox-statistics",
            permissions: ["Exchange.Mailbox.ReadWrite", "Exchange.Mailbox.Read"],
          },
          {
            title: "Mailbox Client Access Settings",
            path: "/email/reports/mailbox-cas-settings",
            permissions: ["Exchange.Mailbox.ReadWrite", "Exchange.Mailbox.Read"],
          },
          {
            title: "Anti-Phishing Filters",
            path: "/email/reports/antiphishing-filters",
            permissions: ["Exchange.SpamFilter.ReadWrite", "Exchange.SpamFilter.Read"],
          },
          {
            title: "Malware Filters",
            path: "/email/reports/malware-filters",
            permissions: ["Exchange.SpamFilter.ReadWrite", "Exchange.SpamFilter.Read"],
          },
          {
            title: "Safe Links Filters",
            path: "/email/reports/safelinks-filters",
            permissions: ["Exchange.SafeLinks.ReadWrite", "Exchange.SafeLinks.Read"],
          },
          {
            title: "Safe Attachments Filters",
            path: "/email/reports/safeattachments-filters",
            permissions: ["Exchange.SafeLinks.ReadWrite", "Exchange.SafeLinks.Read"],
          },
          {
            title: "Shared Mailbox with Enabled Account",
            path: "/email/reports/SharedMailboxEnabledAccount",
            permissions: ["Exchange.Mailbox.ReadWrite", "Exchange.Mailbox.Read"],
          },
          {
            title: "Global Address List",
            path: "/email/reports/global-address-list",
            permissions: ["Exchange.Group.ReadWrite", "Exchange.Group.Read"],
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
      "CIPP.Core.ReadWrite",
      "CIPP.Core.Read",
      "Tenant.Administration.ReadWrite",
      "Tenant.Administration.Read",
      "Tenant.Application.ReadWrite",
      "Tenant.Application.Read",
      "Tenant.DomainAnalyser.ReadWrite",
      "Tenant.DomainAnalyser.Read",
      "Exchange.Mailbox.ReadWrite",
      "Exchange.Mailbox.Read",
      "CIPP.Scheduler.ReadWrite",
      "CIPP.Scheduler.Read",
    ],
    items: [
      {
        title: "Tenant Tools",
        path: "/tenant/tools",
        permissions: ["Tenant.Administration.ReadWrite", "Tenant.Administration.Read"],
        items: [
          {
            title: "Graph Explorer",
            path: "/tenant/tools/graph-explorer",
            permissions: ["Tenant.Administration.ReadWrite", "Tenant.Administration.Read"],
          },
          {
            title: "Application Approval",
            path: "/tenant/tools/appapproval",
            permissions: ["Tenant.Application.ReadWrite", "Tenant.Application.Read"],
          },
          {
            title: "Tenant Lookup",
            path: "/tenant/tools/tenantlookup",
            permissions: ["Tenant.Administration.Read"],
          },

          {
            title: "IP Database",
            path: "/tenant/tools/geoiplookup",
            permissions: ["CIPP.Core.Read"],
          },

          {
            title: "Individual Domain Check",
            path: "/tenant/tools/individual-domains",
            permissions: ["Tenant.DomainAnalyser.ReadWrite", "Tenant.DomainAnalyser.Read"],
          },
        ],
      },
      {
        title: "Email Tools",
        path: "/email/tools",
        permissions: ["Exchange.Mailbox.ReadWrite", "Exchange.Mailbox.Read"],
        items: [
          {
            title: "Message Trace",
            path: "/email/tools/message-trace",
            permissions: ["Exchange.Mailbox.ReadWrite", "Exchange.Mailbox.Read"],
          },
          {
            title: "Mailbox Restores",
            path: "/email/tools/mailbox-restores",
            permissions: ["Exchange.Mailbox.ReadWrite", "Exchange.Mailbox.Read"],
          },
          {
            title: "Message Viewer",
            path: "/email/tools/message-viewer",
            permissions: ["Exchange.Mailbox.ReadWrite", "Exchange.Mailbox.Read"],
          },
        ],
      },
      {
        title: "Dark Web Tools",
        path: "/tools/darkweb",
        permissions: ["CIPP.Core.ReadWrite", "CIPP.Core.Read"],
        items: [
          {
            title: "Tenant Breach Lookup",
            path: "/tools/tenantbreachlookup",
            permissions: ["CIPP.Core.ReadWrite", "CIPP.Core.Read"],
          },
          {
            title: "Breach Lookup",
            path: "/tools/breachlookup",
            permissions: ["CIPP.Core.ReadWrite", "CIPP.Core.Read"],
          },
        ],
      },
      {
        title: "Template Library",
        path: "/tools/templatelib",
        roles: ["editor", "admin", "superadmin"],
        permissions: ["CIPP.Core.ReadWrite", "CIPP.Core.Read"],
      },
      {
        title: "Community Repositories",
        path: "/tools/community-repos",
        roles: ["editor", "admin", "superadmin"],
        permissions: ["CIPP.Core.ReadWrite", "CIPP.Core.Read"],
      },
      {
        title: "Scheduler",
        path: "/cipp/scheduler",
        roles: ["editor", "admin", "superadmin"],
        permissions: ["CIPP.Scheduler.ReadWrite", "CIPP.Scheduler.Read"],
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
      "CIPP.AppSettings.ReadWrite",
      "CIPP.AppSettings.Read",
      "CIPP.Core.ReadWrite",
      "CIPP.Core.Read",
      "CIPP.Extension.ReadWrite",
      "CIPP.Extension.Read",
      "CIPP.SuperAdmin.ReadWrite",
      "CIPP.SuperAdmin.Read",
    ],
    items: [
      {
        title: "Application Settings",
        path: "/cipp/settings",
        roles: ["admin", "superadmin"],
        permissions: ["CIPP.AppSettings.ReadWrite", "CIPP.AppSettings.Read"],
      },
      {
        title: "Logbook",
        path: "/cipp/logs",
        roles: ["editor", "admin", "superadmin"],
        permissions: ["CIPP.Core.ReadWrite", "CIPP.Core.Read"],
      },
      {
        title: "Setup Wizard",
        path: "/onboardingv2",
        roles: ["admin", "superadmin"],
        permissions: ["CIPP.Core.ReadWrite", "CIPP.Core.Read"],
      },
      {
        title: "Integrations",
        path: "/cipp/integrations",
        roles: ["admin", "superadmin"],
        permissions: ["CIPP.Extension.ReadWrite", "CIPP.Extension.Read"],
      },
      {
        title: "Custom Data",
        path: "/cipp/custom-data/directory-extensions",
        roles: ["admin", "superadmin"],
        permissions: ["CIPP.Core.ReadWrite", "CIPP.Core.Read"],
      },
      {
        title: "Advanced",
        roles: ["superadmin"],
        permissions: ["CIPP.SuperAdmin.ReadWrite", "CIPP.SuperAdmin.Read"],
        items: [
          {
            title: "Super Admin",
            path: "/cipp/super-admin/tenant-mode",
            roles: ["superadmin"],
            permissions: ["CIPP.SuperAdmin.ReadWrite", "CIPP.SuperAdmin.Read"],
          },
          {
            title: "Exchange Cmdlets",
            path: "/cipp/advanced/exchange-cmdlets",
            roles: ["superadmin"],
            permissions: ["CIPP.SuperAdmin.ReadWrite", "CIPP.SuperAdmin.Read"],
          },
          {
            title: "Timers",
            path: "/cipp/advanced/timers",
            roles: ["superadmin"],
            permissions: ["CIPP.SuperAdmin.ReadWrite", "CIPP.SuperAdmin.Read"],
          },
          {
            title: "Table Maintenance",
            path: "/cipp/advanced/table-maintenance",
            roles: ["superadmin"],
            permissions: ["CIPP.SuperAdmin.ReadWrite", "CIPP.SuperAdmin.Read"],
          },
        ],
      },
    ],
  },
];
