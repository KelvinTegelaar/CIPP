const fs = require("fs");
const path = require("path");

const pages = [
  { title: "Dashboard", path: "/" },
  { title: "Administration", path: "/identity/administration" },
  { title: "Users", path: "/identity/users" },
  { title: "Risky Users", path: "/identity/administration/risky-users" },
  { title: "Groups", path: "/identity/administration/groups" },
  { title: "Devices", path: "/identity/administration/devices" },
  { title: "Deploy Group Template", path: "/identity/administration/deploy-group-template" },
  { title: "Group Templates", path: "/identity/administration/group-templates" },
  { title: "Deleted Items", path: "/identity/administration/deleted-items" },
  { title: "Roles", path: "/identity/administration/roles" },
  { title: "JIT Admin", path: "/identity/administration/jit-admin" },
  { title: "Offboarding Wizard", path: "/identity/administration/offboarding-wizard" },
  { title: "Reports", path: "/identity/reports" },
  { title: "MFA Report", path: "/identity/reports/mfa-report" },
  { title: "Inactive Users", path: "/identity/reports/inactive-users-report" },
  { title: "Sign-in Report", path: "/identity/reports/signin-report" },
  { title: "AAD Connect Report", path: "/identity/reports/azure-ad-connect-report" },
  { title: "Risk Detections", path: "/identity/reports/risk-detections" },
  { title: "Administration", path: "/tenant/administration" },
  { title: "Tenants", path: "/tenant/administration/tenants" },
  { title: "Alert Configuration", path: "/tenant/administration/alert-configuration" },
  { title: "Audit Logs", path: "/tenant/administration/audit-logs" },
  { title: "Enterprise Applications", path: "/tenant/administration/enterprise-apps" },
  { title: "Secure Score", path: "/tenant/administration/securescore" },
  { title: "App Consent Requests", path: "/tenant/administration/app-consent-requests" },
  { title: "Authentication Methods", path: "/tenant/administration/authentication-methods" },
  { title: "Tenant Onboarding", path: "/tenant/administration/tenant-onboarding" },
  { title: "Tenant Offboarding", path: "/tenant/administration/tenant-offboarding-wizard" },
  { title: "Partner Relationships", path: "/tenant/administration/partner-relationships" },
  { title: "Configuration Backup", path: "/cipp/gdap" },
  { title: "Backup Wizard", path: "/tenant/backup/backup-wizard" },
  { title: "Restore Wizard", path: "/tenant/backup/restore-wizard" },
  { title: "Tools", path: "/tenant/administration" },
  { title: "Graph Explorer", path: "/tenant/tools/graph-explorer" },
  { title: "Application Approval", path: "/tenant/tools/appapproval" },
  { title: "IP Database", path: "/tenant/tools/geoiplookup" },
  { title: "Tenant Lookup", path: "/tenant/administration/tenantlookup" },
  { title: "Individual Domain Check", path: "/tenant/tools/individual-domains" },
  { title: "BPA Report Builder", path: "/tenant/tools/bpa-report-builder" },
  { title: "Standards", path: "/tenant/standards" },
  { title: "Edit Standards", path: "/tenant/standards/list-applied-standards" },
  { title: "List Standards", path: "/tenant/standards/list-standards" },
  { title: "Best Practice Analyser", path: "/tenant/standards/bpa-report" },
  { title: "Domains Analyser", path: "/tenant/standards/domains-analyser" },
  { title: "Conditional Access", path: "/tenant/administration" },
  { title: "CA Policies", path: "/tenant/conditional/list-policies" },
  { title: "Deploy CA Policies", path: "/tenant/conditional/deploy" },
  { title: "CA Policy Tester", path: "/tenant/conditional/test-policy" },
  { title: "CA Vacation Mode", path: "/tenant/conditional/deploy-vacation" },
  { title: "CA Templates", path: "/tenant/conditional/list-template" },
  { title: "Named Locations", path: "/tenant/conditional/list-named-locations" },
  { title: "Deploy Named Locations", path: "/tenant/conditional/deploy-named-location" },
  { title: "GDAP Management", path: "/cipp/gdap" },
  { title: "Invite Wizard", path: "/tenant/administration/gdap-invite-wizard" },
  { title: "Invite List", path: "/tenant/administration/gdap-invites" },
  { title: "GDAP Relationships", path: "/tenant/administration/gdap-relationships" },
  { title: "Role Wizard", path: "/tenant/administration/gdap-role-wizard" },
  { title: "GDAP Roles", path: "/tenant/administration/gdap-roles" },
  { title: "Reports", path: "/tenant/reports" },
  { title: "Licence Report", path: "/tenant/administration/list-licenses" },
  { title: "Consented Applications", path: "/tenant/administration/application-consent" },
  { title: "Service Health", path: "/tenant/administration/service-health" },
  { title: "Incidents", path: "/security/incidents/list-incidents" },
  { title: "Alerts", path: "/security/incidents/list-alerts" },
  { title: "Defender Status", path: "/security/defender/list-defender" },
  { title: "Defender Deployment", path: "/security/defender/deployment" },
  { title: "Vulnerabilities", path: "/security/defender/list-defender-tvm" },
  { title: "Device Compliance", path: "/security/reports/list-device-compliance" },
  { title: "Safe Links", path: "/security/safelinks/safelinks" },
  { title: "Safe Links Templates", path: "/security/safelinks/safelinks-template" },
  { title: "Applications", path: "/endpoint/applications/list" },
  { title: "Application Queue", path: "/endpoint/applications/queue" },
  { title: "Add Choco App", path: "/endpoint/applications/add-choco-app" },
  { title: "Add Store App", path: "/endpoint/applications/add-winget-app" },
  { title: "Add Office App", path: "/endpoint/applications/add-office-app" },
  { title: "Add MSP App", path: "/endpoint/applications/add-rmm-app" },
  { title: "Autopilot Devices", path: "/endpoint/autopilot/list-devices" },
  { title: "Add Autopilot Device", path: "/endpoint/autopilot/add-device" },
  { title: "Profiles", path: "/endpoint/autopilot/list-profiles" },
  { title: "Add Profile", path: "/endpoint/autopilot/add-profile" },
  { title: "Status Pages", path: "/endpoint/autopilot/list-status-pages" },
  { title: "Devices", path: "/endpoint/MEM/devices" },
  { title: "Configuration Policies", path: "/endpoint/MEM/list-policies" },
  { title: "Compliance Policies", path: "/endpoint/MEM/list-compliance-policies" },
  { title: "Protection Policies", path: "/endpoint/MEM/list-appprotection-policies" },
  { title: "Apply Policy", path: "/endpoint/MEM/add-policy" },
  { title: "Policy Templates", path: "/endpoint/MEM/list-templates" },
  { title: "Add Policy Template", path: "/endpoint/MEM/add-policy-template" },
  { title: "OneDrive", path: "/teams-share/onedrive/list" },
  { title: "SharePoint", path: "/teams-share/sharepoint/list-sharepoint" },
  { title: "Teams", path: "/teams-share/teams/list-team" },
  { title: "Add Team", path: "/teams-share/teams/add-team" },
  { title: "Teams Activity", path: "/teams-share/teams/teams-activity" },
  { title: "Business Voice", path: "/teams-share/teams/business-voice" },
  { title: "Mailboxes", path: "/email/administration/mailboxes" },
  { title: "Deleted Mailboxes", path: "/email/administration/deleted-mailboxes" },
  { title: "Mailbox Rules", path: "/email/administration/mailbox-rules" },
  { title: "Contacts", path: "/email/administration/contacts" },
  { title: "Contact Templates", path: "/email/administration/contacts-template" },
  { title: "Quarantine", path: "/email/administration/quarantine" },
  { title: "Tenant Allow/Block Lists", path: "/email/administration/tenant-allow-block-lists" },
  { title: "Mailbox Restore Wizard", path: "/email/tools/mailbox-restore-wizard" },
  { title: "Mailbox Restores", path: "/email/tools/mailbox-restores" },
  { title: "Mail Test", path: "/email/tools/mail-test" },
  { title: "Message Viewer", path: "/email/tools/message-viewer" },
  { title: "Transport rules", path: "/email/transport/list-rules" },
  { title: "Deploy Transport rule", path: "/email/transport/deploy-rules" },
  { title: "Transport Templates", path: "/email/transport/list-templates" },
  { title: "Connectors", path: "/email/transport/list-connectors" },
  { title: "Deploy Connector Templates", path: "/email/connectors/deploy-connector" },
  { title: "Connector Templates", path: "/email/transport/list-connector-templates" },
  { title: "Spamfilter", path: "/email/spamfilter/list-spamfilter" },
  { title: "Apply Spamfilter Template", path: "/email/spamfilter/deploy" },
  { title: "Templates", path: "/email/spamfilter/list-templates" },
  { title: "Rooms", path: "/resources/management/list-rooms" },
  { title: "Room Lists", path: "/resources/management/room-lists" },
  { title: "Mailbox Statistics", path: "/email/reports/mailbox-statistics" },
  { title: "Mailbox Client Access Settings", path: "/email/reports/mailbox-cas-settings" },
  { title: "Message Trace", path: "/email/reports/message-trace" },
  { title: "Anti-Phishing Filters", path: "/email/reports/antiphishing-filters" },
  { title: "Malware Filters", path: "/email/reports/malware-filters" },
  { title: "Safe Attachments Filters", path: "/email/reports/safeattachments-filters" },
  {
    title: "Shared Mailbox with Enabled Account",
    path: "/email/reports/SharedMailboxEnabledAccount",
  },
  { title: "Settings", path: "/cipp/settings" },
  { title: "Extensions Settings", path: "/cipp/extensions" },
  { title: "Extension Sync", path: "/cipp/extension-sync" },
  { title: "User Settings", path: "/cipp/user-settings" },
  { title: "Scheduler", path: "/cipp/scheduler" },
  { title: "Logbook", path: "/cipp/logs" },
  { title: "Statistics", path: "/cipp/statistics" },
  { title: "SAM Setup Wizard", path: "/onboarding" },
  { title: "Log Out", path: "/logout" },
];

// Template for the placeholder page
const placeholderTemplate = (title) => `
import { Layout as DashboardLayout } from "/src/layouts/index.js";

const Page = () => {
  const pageTitle = "${title}";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This is a placeholder page for the ${title.toLowerCase()} section.</p>
    </div>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
`;

// Function to create the placeholder pages
const createPlaceholderPages = () => {
  pages.forEach(({ path: pagePath, title }) => {
    const dirPath = path.join(__dirname, "src", "pages", ...pagePath.split("/"));
    const filePath = path.join(dirPath, "index.js");

    // Ensure the directory exists
    fs.mkdirSync(dirPath, { recursive: true });

    // Check if the file already exists
    if (!fs.existsSync(filePath)) {
      // Write the placeholder page
      fs.writeFileSync(filePath, placeholderTemplate(title), "utf8");
    } else {
    }
  });
};

// Run the function to create the pages
createPlaceholderPages();
