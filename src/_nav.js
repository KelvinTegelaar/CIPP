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
        name: 'Groups',
        to: '/identity/administration/groups',
      },
      {
        component: CNavItem,
        name: 'Group Templates',
        to: '/identity/administration/group-templates',
      },
      {
        component: CNavItem,
        name: 'Deploy Group Template',
        to: '/identity/administration/deploy-group-template',
      },
      {
        component: CNavItem,
        name: 'Roles',
        to: '/identity/administration/roles',
      },
      {
        component: CNavItem,
        name: 'Offboarding Wizard',
        to: '/identity/administration/offboarding-wizard',
      },
      {
        component: CNavItem,
        name: 'Deleted Items',
        to: '/identity/administration/deleted-items',
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
        name: 'Basic Auth Report',
        to: '/identity/reports/basic-auth-report',
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
        name: 'Alerts Wizard',
        to: '/tenant/administration/alertswizard',
      },

      {
        component: CNavItem,
        name: 'Scheduled Alerts',
        to: '/tenant/administration/alertsqueue',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reports',
    section: 'Reports',
    to: '/tenant/reports',
    icon: <FontAwesomeIcon icon={faChartBar} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Graph Explorer',
        to: '/tenant/administration/graph-explorer',
      },
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
    component: CNavGroup,
    name: 'Standards',
    section: 'Tenant Administration',
    to: '/tenant/standards',
    icon: <FontAwesomeIcon icon={faBook} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Edit Individual Standards',
        to: '/tenant/standards/list-applied-standards',
      },
      {
        component: CNavItem,
        name: 'Apply Standards',
        to: '/tenant/standards/apply-standard',
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
      {
        component: CNavItem,
        name: 'Individual Domain Check',
        to: '/tenant/standards/individual-domains',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Conditional Access',
    section: 'Conditional Access',
    to: '/tenant/administration',
    icon: <FontAwesomeIcon icon={faKey} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Policies',
        to: '/tenant/conditional/list-policies',
      },
      {
        component: CNavItem,
        name: 'Named Locations',
        to: '/tenant/conditional/list-named-locations',
      },
      {
        component: CNavItem,
        name: 'Deploy Conditional Access',
        to: '/tenant/conditional/deploy',
      },
      {
        component: CNavItem,
        name: 'Deploy Named Locations',
        to: '/tenant/conditional/deploy-named-location',
      },
      {
        component: CNavItem,
        name: 'Add Template',
        to: '/tenant/conditional/add-template',
      },
      {
        component: CNavItem,
        name: 'Templates',
        to: '/tenant/conditional/list-template',
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
  // Coming in another branch (heads up)
  //{
  //component: CNavGroup,
  //name: 'Vulnerabilities',
  //section: 'Security & Compliance',
  //to: '/security/vulnerabilities',
  //icon: <FontAwesomeIcon icon={faChessRook} className="nav-icon" />,
  //items: [],
  //},
  {
    component: CNavGroup,
    name: 'Defender',
    section: 'Security & Compliance',
    to: '/security/defender',
    icon: <FontAwesomeIcon icon={faShieldAlt} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Defender Deployment',
        to: '/security/defender/deployment',
      },
      {
        component: CNavItem,
        name: 'Defender Status',
        to: '/security/defender/list-defender',
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
    section: 'Endpoint Management',
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
    section: 'Endpoint Management',
    to: '/endpoint/autopilot',
    icon: <FontAwesomeIcon icon={faTablet} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Add Device',
        to: '/endpoint/autopilot/add-device',
      },
      {
        component: CNavItem,
        name: 'Add Profile',
        to: '/endpoint/autopilot/add-profile',
      },
      {
        component: CNavItem,
        name: 'Add Status Page',
        to: '/endpoint/autopilot/add-status-page',
      },
      {
        component: CNavItem,
        name: 'Autopilot Devices',
        to: '/endpoint/autopilot/list-devices',
      },
      {
        component: CNavItem,
        name: 'Profiles',
        to: '/endpoint/autopilot/list-profiles',
      },
      {
        component: CNavItem,
        name: 'Status Pages',
        to: '/endpoint/autopilot/list-status-pages',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Device Management',
    section: 'Endpoint Management',
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
        name: 'MEM Policies',
        to: '/endpoint/MEM/list-policies',
      },
      {
        component: CNavItem,
        name: 'Apply Policy',
        to: '/endpoint/MEM/add-policy',
      },
      {
        component: CNavItem,
        name: 'Add Policy Template',
        to: '/endpoint/MEM/add-policy-template',
      },
      {
        component: CNavItem,
        name: 'Templates',
        to: '/endpoint/MEM/list-templates',
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
    name: 'Sharepoint',
    section: 'Teams & Sharepoint',
    to: '/teams-share/sharepoint',
    icon: <FontAwesomeIcon icon={faLink} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Sharepoint',
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
        name: 'Business Voice',
        to: '/teams-share/teams/business-voice',
      },
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
    to: '/email/exchange',
    icon: <FontAwesomeIcon icon={faWrench} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Mailboxes',
        to: '/email/administration/mailboxes',
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
    ],
  },
  {
    component: CNavGroup,
    name: 'Transport Rules',
    section: 'Transport Rules',
    to: '/tenant/administration',
    icon: <FontAwesomeIcon icon={faBus} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Transport rules',
        to: '/email/transport/list-rules',
      },
      {
        component: CNavItem,
        name: 'Transport Templates',
        to: '/email/transport/list-templates',
      },
      {
        component: CNavItem,
        name: 'Deploy Transport rule',
        to: '/email/transport/deploy-rules',
      },
      {
        component: CNavItem,
        name: 'Connectors',
        to: '/email/connectors/list-connectors',
      },
      {
        component: CNavItem,
        name: 'Connector Templates',
        to: '/email/connectors/list-connector-templates',
      },
      {
        component: CNavItem,
        name: 'Deploy Connector Templates',
        to: '/email/connectors/deploy-connector',
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
        name: 'Phishing Policies',
        to: '/email/reports/phishing-policies',
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
        name: 'Settings',
        to: '/cipp/settings',
      },
      {
        component: CNavItem,
        name: 'SAM Setup Wizard',
        to: '/cipp/setup',
      },
      {
        component: CNavItem,
        name: 'Documentation',
        href: 'https://cipp.app',
        target: '_blank',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'GDAP Migration',
    section: 'Settings',
    to: '/cipp/gdap',
    icon: <FontAwesomeIcon icon={faUserShield} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Migration Wizard',
        to: '/tenant/administration/gdap',
      },
      {
        component: CNavItem,
        name: 'GDAP Migration Status',
        to: '/tenant/administration/gdap-status',
      },
      {
        component: CNavItem,
        name: 'Application Approval',
        to: '/tenant/administration/appapproval',
      },
      {
        component: CNavItem,
        name: 'Documentation',
        href: 'https://cipp.app/docs/user/usingcipp/GDAP/migration',
        target: '_blank',
      },
    ],
  },
]

export default _nav
