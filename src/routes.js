import React from 'react'

const Home = React.lazy(() => import('./views/home/Home'))
const ViewProfile = React.lazy(() => import('./views/profile/ViewProfile'))
const Settings = React.lazy(() => import('./views/profile/Settings'))
const Users = React.lazy(() => import('./views/identity/administration/Users'))
const AddUser = React.lazy(() => import('./views/identity/administration/AddUser'))
const EditUser = React.lazy(() => import('./views/identity/administration/EditUser'))
const ViewUser = React.lazy(() => import('./views/identity/administration/ViewUser'))
const Groups = React.lazy(() => import('./views/identity/administration/Groups'))
const Roles = React.lazy(() => import('./views/identity/administration/Roles'))
const EditGroup = React.lazy(() => import('./views/identity/administration/EditGroup'))
const Devices = React.lazy(() => import('./views/identity/reports/Devices'))
const MFAReport = React.lazy(() => import('./views/identity/reports/MFAReport'))
const Tenants = React.lazy(() => import('./views/tenant/administration/Tenants'))
const Domains = React.lazy(() => import('./views/tenant/administration/Domains'))
const ConditionalAccess = React.lazy(() =>
  import('./views/tenant/administration/ConditionalAccess'),
)
const BasicAuthReport = React.lazy(() => import('./views/identity/reports/BasicAuthReport'))
const BestPracticeAnalyzer = React.lazy(() =>
  import('./views/tenant/standards/BestPracticeAnalyser'),
)
const DomainsAnalyser = React.lazy(() => import('./views/tenant/standards/DomainsAnalyser'))
const OffboardingWizard = React.lazy(() =>
  import('./views/identity/administration/OffboardingWizard'),
)
const ListAppliedStandards = React.lazy(() =>
  import('./views/tenant/standards/ListAppliedStandards'),
)
const ApplyStandard = React.lazy(() => import('./views/tenant/standards/ApplyStandard'))
const ApplicationsList = React.lazy(() => import('./views/endpoint/applications/ApplicationsList'))
const ApplicationsAddChocoApp = React.lazy(() =>
  import('./views/endpoint/applications/ApplicationsAddChocoApp'),
)
const AutopilotAddDevice = React.lazy(() => import('./views/endpoint/autopilot/AutopilotAddDevice'))
const AutopilotAddProfile = React.lazy(() =>
  import('./views/endpoint/autopilot/AutopilotAddProfile'),
)
const AutopilotAddStatusPage = React.lazy(() =>
  import('./views/endpoint/autopilot/AutopilotAddStatusPage'),
)
const AutopilotListDevices = React.lazy(() =>
  import('./views/endpoint/autopilot/AutopilotListDevices'),
)
const AutopilotListProfiles = React.lazy(() =>
  import('./views/endpoint/autopilot/AutopilotListProfiles'),
)
const AutopilotListStatusPages = React.lazy(() =>
  import('./views/endpoint/autopilot/AutopilotListStatusPages'),
)
const IntuneListPolicies = React.lazy(() => import('./views/endpoint/intune/IntuneListPolicies'))
const IntuneCAPolicies = React.lazy(() => import('./views/endpoint/intune/IntuneCAPolicies'))
const IntuneAddPolicy = React.lazy(() => import('./views/endpoint/intune/IntuneAddPolicy'))
const OneDriveList = React.lazy(() => import('./views/teams-share/onedrive/OneDriveList'))
const SharepointList = React.lazy(() => import('./views/teams-share/sharepoint/SharepointList'))
const BusinessVoice = React.lazy(() => import('./views/teams-share/teams/BusinessVoice'))
const TeamsListTeam = React.lazy(() => import('./views/teams-share/teams/TeamsListTeam'))
const TeamsAddTeam = React.lazy(() => import('./views/teams-share/teams/TeamsAddTeam'))
const TeamsActivity = React.lazy(() => import('./views/teams-share/teams/TeamsActivity'))
const CIPPSettings = React.lazy(() => import('./views/cipp/CIPPSettings'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/home', name: 'Home', component: Home },
  { path: '/profile', name: 'Profile' },
  { path: '/profile/view', name: 'View', component: ViewProfile },
  { path: '/profile/settings', name: 'Settings', component: Settings },
  { path: '/identity', name: 'Identity' },
  { path: '/identity/administration/users/add', name: 'Add User', component: AddUser },
  { path: '/identity/administration/users/edit', name: 'Edit User', component: EditUser },
  { path: '/identity/administration/users/view', name: 'View User', component: ViewUser },
  { path: '/identity/administration', name: 'Administration' },
  { path: '/identity/administration/users', name: 'Users', component: Users },
  { path: '/identity/administration/groups', name: 'Groups', component: Groups },
  { path: '/identity/administration/roles', name: 'Roles', component: Roles },
  { path: '/teams-share/teams/business-voice', name: 'BusinessVoice', component: BusinessVoice },

  { path: '/identity/administration/EditGroup', name: 'Edit Group', component: EditGroup },

  {
    path: '/identity/administration/offboarding-wizard',
    name: 'Offboarding Wizard',
    component: OffboardingWizard,
  },
  { path: '/identity/reports', name: 'Reports' },
  { path: '/identity/reports/devices', name: 'Devices', component: Devices },
  { path: '/identity/reports/mfa-report', name: 'MFA Report', component: MFAReport },
  {
    path: '/identity/reports/basic-auth-report',
    name: 'Basic Auth Report',
    component: BasicAuthReport,
  },
  {
    path: '/tenant',
    name: 'Tenant',
  },
  { path: '/tenant/administration', name: 'Administration' },
  { path: '/tenant/administration/tenants', name: 'Tenants', component: Tenants },
  { path: '/tenant/administration/domains', name: 'Domains', component: Domains },
  {
    path: '/tenant/administration/conditional-access-policies',
    name: 'Conditional Access',
    component: ConditionalAccess,
  },
  {
    path: '/tenant/standards',
    name: 'Standards',
  },
  {
    path: '/tenant/standards/list-applied-standards',
    name: 'List Applied Standards',
    component: ListAppliedStandards,
  },
  {
    path: '/tenant/standards/apply-standard',
    name: 'Apply Standard',
    component: ApplyStandard,
  },
  {
    path: '/tenant/standards/bpa-report',
    name: 'Best Practice Report',
    component: BestPracticeAnalyzer,
  },
  {
    path: '/tenant/standards/domains-analyser',
    name: 'Domains Analyser',
    component: DomainsAnalyser,
  },
  {
    path: '/endpoint',
    name: 'Endpoint',
  },
  {
    path: '/endpoint/applications',
    name: 'Applications',
  },
  {
    path: '/endpoint/applications/list',
    name: 'List',
    component: ApplicationsList,
  },
  {
    path: '/endpoint/applications/add-choco-app',
    name: 'Add Choco App',
    component: ApplicationsAddChocoApp,
  },
  {
    path: '/endpoint/autopilot',
    name: 'Autopilot',
  },
  {
    path: '/endpoint/autopilot/add-device',
    name: 'Add Device',
    component: AutopilotAddDevice,
  },
  {
    path: '/endpoint/autopilot/add-profile',
    name: 'Add Profile',
    component: AutopilotAddProfile,
  },
  {
    path: '/endpoint/autopilot/add-status-page',
    name: 'Add Status Page',
    component: AutopilotAddStatusPage,
  },
  {
    path: '/endpoint/autopilot/list-devices',
    name: 'List Devices',
    component: AutopilotListDevices,
  },
  {
    path: '/endpoint/autopilot/list-profiles',
    name: 'List Profiles',
    component: AutopilotListProfiles,
  },
  {
    path: '/endpoint/autopilot/list-status-pages',
    name: 'List Status Pages',
    component: AutopilotListStatusPages,
  },
  {
    path: '/endpoint/intune',
    name: 'Intune',
  },
  {
    path: '/endpoint/intune/list-policies',
    name: 'List Status Pages',
    component: IntuneListPolicies,
  },
  {
    path: '/endpoint/intune/ca-policies',
    name: 'List Status Pages',
    component: IntuneCAPolicies,
  },
  {
    path: '/endpoint/intune/add-policy',
    name: 'Add Intune Policy',
    component: IntuneAddPolicy,
  },
  {
    path: '/teams-share',
    name: 'Teams & Sharepoint',
  },
  {
    path: '/teams-share/onedrive',
    name: 'OneDrive',
  },
  {
    path: '/teams-share/onedrive/list',
    name: 'List OneDrive',
    component: OneDriveList,
  },
  {
    path: '/teams-share/sharepoint',
    name: 'Sharepoint',
  },
  {
    path: '/teams-share/sharepoint/list-sharepoint',
    name: 'List Sharepoint',
    component: SharepointList,
  },
  {
    path: '/teams-share/teams',
    name: 'Teams',
  },
  {
    path: '/teams-share/teams/list-team',
    name: 'List Teams',
    component: TeamsListTeam,
  },
  {
    path: '/teams-share/teams/add-team',
    name: 'List Teams',
    component: TeamsAddTeam,
  },
  {
    path: '/teams-share/teams/teams-activity',
    name: 'List Teams',
    component: TeamsActivity,
  },
  {
    path: '/cipp',
    name: 'CIPP',
  },
  {
    path: '/cipp/cipp',
    name: 'CIPP',
  },
  {
    path: '/cipp/settings',
    name: 'Settings',
    component: CIPPSettings,
  },
]

export default routes
