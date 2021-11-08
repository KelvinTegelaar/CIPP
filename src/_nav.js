import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilCursor,
  cilPuzzle,
  cilSpeedometer,
  cilList,
  cilLibraryBuilding,
  cilLibrary,
  cilPaperPlane,
  cilShieldAlt,
  cilStorage,
  cilRoom,
  cilGroup,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Home',
    to: '/home',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Identity Management',
  },
  {
    component: CNavGroup,
    name: 'Administration',
    to: '/identity/administration',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
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
        name: 'Offboarding Wizard',
        to: '/identity/administration/offboardingwizard',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reports',
    to: '/identity/reports',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Devices',
        to: '/identity/reports/devices',
      },
      {
        component: CNavItem,
        name: 'MFA Report',
        to: '/identity/reports/mfareport',
      },
      {
        component: CNavItem,
        name: 'Basic Auth Report',
        to: '/identity/reports/basicauthreport',
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
    icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Tenants',
        to: '/tenant/administration/tenants',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Standards',
    to: '/tenant/standards',
    icon: <CIcon icon={cilLibraryBuilding} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List Applied Standards',
        to: '/tenant/standards/listappliedstandards',
      },
      {
        component: CNavItem,
        name: 'Add Standard',
        to: '/tenant/standards/addstandard',
      },
      {
        component: CNavItem,
        name: 'Best Practice Analyzer',
        to: '/tenant/standards/bpareport',
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
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List',
        to: '/endpoint/applications/list',
      },
      {
        component: CNavItem,
        name: 'Add Choco App',
        to: '/endpoint/applications/addchocoapp',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Autopilot',
    to: '/endpoint/autopilot',
    icon: <CIcon icon={cilPaperPlane} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Add Device',
        to: '/endpoint/autopilot/adddevice',
      },
      {
        component: CNavItem,
        name: 'Add Profile',
        to: '/endpoint/autopilot/addprofile',
      },
      {
        component: CNavItem,
        name: 'Add Status Page',
        to: '/endpoint/autopilot/addstatuspage',
      },
      {
        component: CNavItem,
        name: 'List Devices',
        to: '/endpoint/autopilot/listdevices',
      },
      {
        component: CNavItem,
        name: 'List Profiles',
        to: '/endpoint/autopilot/listprofiles',
      },
      {
        component: CNavItem,
        name: 'List Status Pages',
        to: '/endpoint/autopilot/liststatuspages',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Intune',
    to: '/endpoint/intune',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List Intune Policies',
        to: '/endpoint/intune/listpolicies',
      },
      {
        component: CNavItem,
        name: 'Conditional Access Policies',
        to: '/endpoint/intune/capolicies',
      },
      {
        component: CNavItem,
        name: 'Add Policy',
        to: '/endpoint/intune/addpolicy',
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
    to: '/teamsshare/onedrive',
    icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List OneDrive',
        to: '/teamsshare/onedrive/list',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Sharepoint',
    to: '/teamsshare/sharepoint',
    icon: <CIcon icon={cilRoom} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List Sharepoint',
        to: '/teamsshare/sharepoint/listsharepoint',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Teams',
    to: '/teamsshare/teams',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List Teams',
        to: '/teamsshare/teams/listteam',
      },
      {
        component: CNavItem,
        name: 'Add Team',
        to: '/teamsshare/teams/addteam',
      },
      {
        component: CNavItem,
        name: 'Teams Activity',
        to: '/teamsshare/teams/teamsactivity',
      },
    ],
  },
]

export default _nav
