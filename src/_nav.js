import React from 'react'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome,
  faWrench,
  faChartBar,
  faCog,
  faBook,
  faTablet,
  faShieldAlt,
  faExchangeAlt,
  faHdd,
  faLink,
  faUsers,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons'
import { faChrome } from '@fortawesome/free-brands-svg-icons'

const _nav = [
  {
    component: CNavItem,
    name: 'Home',
    to: '/home',
    icon: <FontAwesomeIcon icon={faHome} className="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Identity Management',
  },
  {
    component: CNavGroup,
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
        name: 'Roles',
        to: '/identity/administration/roles',
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
    to: '/identity/reports',
    icon: <FontAwesomeIcon icon={faChartBar} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Devices',
        to: '/identity/reports/devices',
      },
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
    ],
  },
  {
    component: CNavTitle,
    name: 'Tenant Administration',
  },
  {
    component: CNavGroup,
    name: 'Administration',
    to: '/tenant/administration',
    icon: <FontAwesomeIcon icon={faCog} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Tenants',
        to: '/tenant/administration/tenants',
      },
      {
        component: CNavItem,
        name: 'Conditional Access Policies',
        to: '/tenant/administration/conditional-access-policies',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Standards',
    to: '/tenant/standards',
    icon: <FontAwesomeIcon icon={faBook} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List Applied Standards',
        to: '/tenant/standards/list-applied-standards',
      },
      {
        component: CNavItem,
        name: 'Apply Standard',
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
        to: '/tenant/standards/Individual-domains',
      },
      {
        component: CNavItem,
        name: 'Alert List (Alpha)',
        to: '/tenant/standards/alert-list',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Endpoint Management',
  },
  {
    component: CNavGroup,
    name: 'Applications',
    to: '/endpoint/applications',
    icon: <FontAwesomeIcon icon={faChrome} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List',
        to: '/endpoint/applications/list',
      },
      {
        component: CNavItem,
        name: 'Add Choco App',
        to: '/endpoint/applications/add-choco-app',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Autopilot',
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
        name: 'List Devices',
        to: '/endpoint/autopilot/list-devices',
      },
      {
        component: CNavItem,
        name: 'List Profiles',
        to: '/endpoint/autopilot/list-profiles',
      },
      {
        component: CNavItem,
        name: 'List Status Pages',
        to: '/endpoint/autopilot/list-status-pages',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'MEM (Intune)',
    to: '/endpoint/MEM',
    icon: <FontAwesomeIcon icon={faExchangeAlt} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List MEM Policies',
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
        name: 'List Templates',
        to: '/endpoint/MEM/list-templates',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Defender',
    to: '/endpoint/defender',
    icon: <FontAwesomeIcon icon={faShieldAlt} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List Defender for endpoint (Alpha)',
        to: '/endpoint/intune/list-defender',
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
    to: '/teams-share/onedrive',
    icon: <FontAwesomeIcon icon={faHdd} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List OneDrive',
        to: '/teams-share/onedrive/list',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Sharepoint',
    to: '/teams-share/sharepoint',
    icon: <FontAwesomeIcon icon={faLink} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List Sharepoint',
        to: '/teams-share/sharepoint/list-sharepoint',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Teams',
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
        name: 'List Teams',
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
        name: 'Contacts',
        to: '/email/administration/contacts',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reports',
    to: '/email/reports',
    icon: <FontAwesomeIcon icon={faEnvelope} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Mailbox Statistics',
        to: '/email/reports/mailbox-statistics',
      },
      {
        component: CNavItem,
        name: 'Mailbox Client Access Settings',
        to: '/email/reports/mailbox-client-access-settings',
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
    to: '/cipp/cipp',
    icon: <FontAwesomeIcon icon={faWrench} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Documentation',
        href: 'https://cipp.app',
      },
      {
        component: CNavItem,
        name: 'Settings',
        to: '/cipp/settings',
      },
    ],
  },
]

export default _nav
