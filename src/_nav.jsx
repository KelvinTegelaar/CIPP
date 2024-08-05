import React from 'react'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome,
  faWrench,
  faChartBar,
  faBook,
  faTablet,
  faShieldAlt,
  faExchangeAlt,
  faHdd,
  faLink,
  faUsers,
  faWindowRestore,
  faKey,
  faBus,
  faExclamationTriangle,
  faUserShield,
  faEnvelope,
  faToolbox,
  faDownload,
} from '@fortawesome/free-solid-svg-icons'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    section: 'Dashboard',
    to: '/home',
    icon: <FontAwesomeIcon icon={faHome} className="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Identity Management',
  },
  {
    component: CNavGroup,
    section: 'Identity Management',
    name: 'Administration',
    to: '/identity/administration',
    icon: <FontAwesomeIcon icon={faWrench} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Users',
        to: '/identity/administration/users',
      },
      {
        component: CNavItem,
        name: 'Risky Users',
        to: '/identity/administration/risky-users',
      },
      {
        component: CNavItem,
        name: 'Groups',
        to: '/identity/administration/groups',
      },
      {
        component: CNavItem,
        name: 'Devices',
        to: '/identity/administration/devices',
      },
      {
        component: CNavItem,
        name: 'Deploy Group Template',
        to: '/identity/administration/deploy-group-template',
      },
      {
        component: CNavItem,
        name: 'Group Templates',
        to: '/identity/administration/group-templates',
      },
      {
        component: CNavItem,
        name: 'Deleted Items',
        to: '/identity/administration/deleted-items',
      },
      {
        component: CNavItem,
        name: 'Roles',
        to: '/identity/administration/roles',
      },
      {
        component: CNavItem,
        name: 'JIT Admin',
        to: '/identity/administration/jit-admin',
      },
      {
        component: CNavItem,
        name: 'Offboarding Wizard',
        to: '/identity/administration/offboarding-wizard',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reports',
    section: 'Identity Management',
    to: '/identity/reports',
    icon: <FontAwesomeIcon icon={faChartBar} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'MFA Report',
        to: '/identity/reports/mfa-report',
      },
      {
        component: CNavItem,
        name: 'Inactive Users',
        to: '/identity/reports/inactive-users-report',
      },
      {
        component: CNavItem,
        name: 'Sign-in Report',
        to: '/identity/reports/signin-report',
      },
      {
        component: CNavItem,
        name: 'AAD Connect Report',
        to: '/identity/reports/azure-ad-connect-report',
      },
      {
        component: CNavItem,
        name: 'Risk Detections',
        to: '/identity/reports/risk-detections',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Tenant Administration',
  },
  {
    component: CNavGroup,
    name: 'Administration',
    section: 'Tenant Administration',
    to: '/tenant/administration',
    icon: <FontAwesomeIcon icon={faWrench} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Tenants',
        to: '/tenant/administration/tenants',
      },
      {
        component: CNavItem,
        name: 'Alert Configuration',
        to: '/tenant/administration/alert-configuration',
      },
      {
        component: CNavItem,
        name: 'Audit Logs',
        to: '/tenant/administration/audit-logs',
      },
      {
        component: CNavItem,
        name: 'Enterprise Applications',
        to: '/tenant/administration/enterprise-apps',
      },
      {
        component: CNavItem,
        name: 'Secure Score',
        to: '/tenant/administration/securescore',
      },
      {
        component: CNavItem,
        name: 'App Consent Requests',
        to: '/tenant/administration/app-consent-requests',
      },
      {
        component: CNavItem,
        name: 'Authentication Methods',
        to: '/tenant/administration/authentication-methods',
      },
      {
        component: CNavItem,
        name: 'Tenant Onboarding',
        to: '/tenant/administration/tenant-onboarding',
      },
      {
        component: CNavItem,
        name: 'Tenant Offboarding',
        to: '/tenant/administration/tenant-offboarding-wizard',
      },
      {
        component: CNavItem,
        name: 'Partner Relationships',
        to: '/tenant/administration/partner-relationships',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Configuration Backup',
    section: 'Tenant Administration',
    to: '/cipp/gdap',
    icon: <FontAwesomeIcon icon={faDownload} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Backup Wizard',
        to: '/tenant/backup/backup-wizard',
      },
      {
        component: CNavItem,
        name: 'Restore Wizard',
        to: '/tenant/backup/restore-wizard',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Tools',
    section: 'Tenant Administration',
    to: '/tenant/administration',
    icon: <FontAwesomeIcon icon={faToolbox} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Graph Explorer',
        to: '/tenant/administration/graph-explorer',
      },
      {
        component: CNavItem,
        name: 'Application Approval',
        to: '/tenant/administration/appapproval',
      },
      {
        component: CNavItem,
        name: 'IP Database',
        to: '/tenant/tools/geoiplookup',
      },
      {
        component: CNavItem,
        name: 'Tenant Lookup',
        to: '/tenant/administration/tenantlookup',
      },
      {
        component: CNavItem,
        name: 'Individual Domain Check',
        to: '/tenant/standards/individual-domains',
      },
      {
        component: CNavItem,
        name: 'BPA Report Builder',
        to: '/tenant/tools/bpa-report-builder',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Standards',
    section: 'Tenant Administration',
    to: '/tenant/standards',
    icon: <FontAwesomeIcon icon={faBook} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Edit Standards',
        to: '/tenant/standards/list-applied-standards',
      },
      {
        component: CNavItem,
        name: 'List Standards',
        to: '/tenant/standards/list-standards',
      },
      {
        component: CNavItem,
        name: 'Best Practice Analyser',
        to: '/tenant/standards/bpa-report',
      },
      {
        component: CNavItem,
        name: 'Domains Analyser',
        to: '/tenant/standards/domains-analyser',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Conditional Access',
    section: 'Tenant Administration',
    to: '/tenant/administration',
    icon: <FontAwesomeIcon icon={faKey} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'CA Policies',
        to: '/tenant/conditional/list-policies',
      },
      {
        component: CNavItem,
        name: 'Deploy CA Policies',
        to: '/tenant/conditional/deploy',
      },
      {
        component: CNavItem,
        name: 'CA Policy Tester',
        to: '/tenant/conditional/test-policy',
      },
      {
        component: CNavItem,
        name: 'CA Vacation Mode',
        to: '/tenant/conditional/deploy-vacation',
      },
      {
        component: CNavItem,
        name: 'CA Templates',
        to: '/tenant/conditional/list-template',
      },
      {
        component: CNavItem,
        name: 'Named Locations',
        to: '/tenant/conditional/list-named-locations',
      },
      {
        component: CNavItem,
        name: 'Deploy Named Locations',
        to: '/tenant/conditional/deploy-named-location',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'GDAP Management',
    section: 'Tenant Administration',
    to: '/cipp/gdap',
    icon: <FontAwesomeIcon icon={faUserShield} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Invite Wizard',
        to: '/tenant/administration/gdap-invite-wizard',
      },
      {
        component: CNavItem,
        name: 'Invite List',
        to: '/tenant/administration/gdap-invites',
      },
      {
        component: CNavItem,
        name: 'GDAP Relationships',
        to: '/tenant/administration/gdap-relationships',
      },
      {
        component: CNavItem,
        name: 'Role Wizard',
        to: '/tenant/administration/gdap-role-wizard',
      },
      {
        component: CNavItem,
        name: 'GDAP Roles',
        to: '/tenant/administration/gdap-roles',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reports',
    section: 'Tenant Administration',
    to: '/tenant/reports',
    icon: <FontAwesomeIcon icon={faChartBar} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Licence Report',
        to: '/tenant/administration/list-licenses',
      },
      {
        component: CNavItem,
        name: 'Consented Applications',
        to: '/tenant/administration/application-consent',
      },
      {
        component: CNavItem,
        name: 'Service Health',
        to: '/tenant/administration/service-health',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Security & Compliance',
  },
  {
    component: CNavGroup,
    name: 'Incidents & Alerts',
    section: 'Security & Compliance',
    to: '/security/incidents',
    icon: <FontAwesomeIcon icon={faExclamationTriangle} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Incidents',
        to: '/security/incidents/list-incidents',
      },
      {
        component: CNavItem,
        name: 'Alerts',
        to: '/security/incidents/list-alerts',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Defender',
    section: 'Security & Compliance',
    to: '/security/defender',
    icon: <FontAwesomeIcon icon={faShieldAlt} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Defender Status',
        to: '/security/defender/list-defender',
      },
      {
        component: CNavItem,
        name: 'Defender Deployment',
        to: '/security/defender/deployment',
      },
      {
        component: CNavItem,
        name: 'Vulnerabilities',
        to: '/security/defender/list-defender-tvm',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reports',
    section: 'Security & Compliance',
    to: '/security/reports',
    icon: <FontAwesomeIcon icon={faChartBar} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Device Compliance',
        to: '/security/reports/list-device-compliance',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Intune',
  },
  {
    component: CNavGroup,
    name: 'Applications',
    section: 'Intune',
    to: '/endpoint/applications',
    icon: <FontAwesomeIcon icon={faWindowRestore} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Applications',
        to: '/endpoint/applications/list',
      },
      {
        component: CNavItem,
        name: 'Application Queue',
        to: '/endpoint/applications/queue',
      },
      {
        component: CNavItem,
        name: 'Add Choco App',
        to: '/endpoint/applications/add-choco-app',
      },
      {
        component: CNavItem,
        name: 'Add Store App',
        to: '/endpoint/applications/add-winget-app',
      },
      {
        component: CNavItem,
        name: 'Add Office App',
        to: '/endpoint/applications/add-office-app',
      },
      {
        component: CNavItem,
        name: 'Add MSP App',
        to: '/endpoint/applications/add-rmm-app',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Autopilot',
    section: 'Intune',
    to: '/endpoint/autopilot',
    icon: <FontAwesomeIcon icon={faTablet} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Autopilot Devices',
        to: '/endpoint/autopilot/list-devices',
      },
      {
        component: CNavItem,
        name: 'Add Autopilot Device',
        to: '/endpoint/autopilot/add-device',
      },
      {
        component: CNavItem,
        name: 'Profiles',
        to: '/endpoint/autopilot/list-profiles',
      },
      {
        component: CNavItem,
        name: 'Add Profile',
        to: '/endpoint/autopilot/add-profile',
      },
      {
        component: CNavItem,
        name: 'Status Pages',
        to: '/endpoint/autopilot/list-status-pages',
      },
      {
        component: CNavItem,
        name: 'Add Status Page',
        to: '/endpoint/autopilot/add-status-page',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Device Management',
    section: 'Intune',
    to: '/endpoint/MEM',
    icon: <FontAwesomeIcon icon={faExchangeAlt} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Devices',
        to: '/endpoint/reports/devices',
      },
      {
        component: CNavItem,
        name: 'Configuration Policies',
        to: '/endpoint/MEM/list-policies',
      },
      {
        component: CNavItem,
        name: 'Compliance Policies',
        to: '/endpoint/MEM/list-compliance-policies',
      },
      {
        component: CNavItem,
        name: 'Protection Policies',
        to: '/endpoint/MEM/list-appprotection-policies',
      },
      {
        component: CNavItem,
        name: 'Apply Policy',
        to: '/endpoint/MEM/add-policy',
      },
      {
        component: CNavItem,
        name: 'Policy Templates',
        to: '/endpoint/MEM/list-templates',
      },
      {
        component: CNavItem,
        name: 'Add Policy Template',
        to: '/endpoint/MEM/add-policy-template',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Teams & Sharepoint',
  },
  {
    component: CNavGroup,
    name: 'OneDrive',
    section: 'Teams & Sharepoint',
    to: '/teams-share/onedrive',
    icon: <FontAwesomeIcon icon={faHdd} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'OneDrive',
        to: '/teams-share/onedrive/list',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'SharePoint',
    section: 'Teams & Sharepoint',
    to: '/teams-share/sharepoint',
    icon: <FontAwesomeIcon icon={faLink} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'SharePoint',
        to: '/teams-share/sharepoint/list-sharepoint',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Teams',
    section: 'Teams & Sharepoint',
    to: '/teams-share/teams',
    icon: <FontAwesomeIcon icon={faUsers} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Teams',
        to: '/teams-share/teams/list-team',
      },
      {
        component: CNavItem,
        name: 'Add Team',
        to: '/teams-share/teams/add-team',
      },
      {
        component: CNavItem,
        name: 'Teams Activity',
        to: '/teams-share/teams/teams-activity',
      },
      {
        component: CNavItem,
        name: 'Business Voice',
        to: '/teams-share/teams/business-voice',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Email & Exchange',
  },
  {
    component: CNavGroup,
    name: 'Administration',
    section: 'Email & Exchange',
    to: '/email/Administration',
    icon: <FontAwesomeIcon icon={faWrench} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Mailboxes',
        to: '/email/administration/mailboxes',
      },
      {
        component: CNavItem,
        name: 'Deleted Mailboxes',
        to: '/email/administration/deleted-mailboxes',
      },
      {
        component: CNavItem,
        name: 'Mailbox Rules',
        to: '/email/administration/mailbox-rules',
      },
      {
        component: CNavItem,
        name: 'Contacts',
        to: '/email/administration/contacts',
      },
      {
        component: CNavItem,
        name: 'Quarantine',
        to: '/email/administration/quarantine',
      },
      {
        component: CNavItem,
        name: 'Tenant Allow/Block Lists',
        to: '/email/administration/tenant-allow-block-lists',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Tools',
    section: 'Email & Exchange',
    to: '/email/tools',
    icon: <FontAwesomeIcon icon={faToolbox} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Mailbox Restore Wizard',
        to: '/email/tools/mailbox-restore-wizard',
      },
      {
        component: CNavItem,
        name: 'Mailbox Restores',
        to: '/email/tools/mailbox-restores',
      },
      {
        component: CNavItem,
        name: 'Mail Test',
        to: '/email/tools/mail-test',
      },
      {
        component: CNavItem,
        name: 'Message Viewer',
        to: '/email/tools/message-viewer',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Transport',
    section: 'Email & Exchange',
    to: '/email/Transport',
    icon: <FontAwesomeIcon icon={faBus} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Transport rules',
        to: '/email/transport/list-rules',
      },
      {
        component: CNavItem,
        name: 'Deploy Transport rule',
        to: '/email/transport/deploy-rules',
      },
      {
        component: CNavItem,
        name: 'Transport Templates',
        to: '/email/transport/list-templates',
      },
      {
        component: CNavItem,
        name: 'Connectors',
        to: '/email/connectors/list-connectors',
      },
      {
        component: CNavItem,
        name: 'Deploy Connector Templates',
        to: '/email/connectors/deploy-connector',
      },
      {
        component: CNavItem,
        name: 'Connector Templates',
        to: '/email/connectors/list-connector-templates',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Spamfilter',
    section: 'Email & Exchange',
    to: '/email/spamfilter',
    icon: <FontAwesomeIcon icon={faEnvelope} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Spamfilter',
        to: '/email/spamfilter/list-spamfilter',
      },
      {
        component: CNavItem,
        name: 'Apply Spamfilter Template',
        to: '/email/spamfilter/deploy',
      },
      {
        component: CNavItem,
        name: 'Templates',
        to: '/email/spamfilter/list-templates',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Resource Management',
    section: 'Email & Exchange',
    to: '/resources/management',
    icon: <FontAwesomeIcon icon={faToolbox} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Rooms',
        to: '/resources/management/list-rooms',
      },
      {
        component: CNavItem,
        name: 'Room Lists',
        to: '/resources/management/room-lists',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reports',
    section: 'Email & Exchange',
    to: '/email/reports',
    icon: <FontAwesomeIcon icon={faChartBar} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Mailbox Statistics',
        to: '/email/reports/mailbox-statistics',
      },
      {
        component: CNavItem,
        name: 'Mailbox Client Access Settings',
        to: '/email/reports/mailbox-cas-settings',
      },
      {
        component: CNavItem,
        name: 'Message Trace',
        to: '/email/reports/message-trace',
      },
      {
        component: CNavItem,
        name: 'Anti-Phishing Filters',
        to: '/email/reports/antiphishing-filters',
      },
      {
        component: CNavItem,
        name: 'Malware Filters',
        to: '/email/reports/malware-filters',
      },
      {
        component: CNavItem,
        name: 'Safe Links Filters',
        to: '/email/reports/safelinks-filters',
      },
      {
        component: CNavItem,
        name: 'Safe Attachments Filters',
        to: '/email/reports/safeattachments-filters',
      },
      {
        component: CNavItem,
        name: 'Shared Mailbox with Enabled Account',
        to: '/email/reports/SharedMailboxEnabledAccount',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Settings',
  },
  {
    component: CNavGroup,
    name: 'CIPP',
    section: 'Settings',
    to: '/cipp/cipp',
    icon: <FontAwesomeIcon icon={faWrench} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Application Settings',
        to: '/cipp/settings',
      },
      {
        component: CNavItem,
        name: 'Extensions Settings',
        to: '/cipp/extensions',
      },
      {
        component: CNavItem,
        name: 'Extension Sync',
        to: '/cipp/extension-sync',
      },
      {
        component: CNavItem,
        name: 'User Settings',
        to: '/cipp/user-settings',
      },
      {
        component: CNavItem,
        name: 'Scheduler',
        to: '/cipp/scheduler',
      },
      {
        component: CNavItem,
        name: 'Logbook',
        to: '/cipp/logs',
      },
      {
        component: CNavItem,
        name: 'Statistics',
        to: '/cipp/statistics',
      },
      {
        component: CNavItem,
        name: 'SAM Setup Wizard',
        to: '/cipp/setup',
      },
      {
        component: CNavItem,
        name: 'Log Out',
        to: '/logout',
      },
    ],
  },
]

export default _nav
