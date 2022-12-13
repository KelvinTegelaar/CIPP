import React from 'react'

const Home = React.lazy(() => import('src/views/home/Home'))
const Logs = React.lazy(() => import('src/views/cipp/Logs'))
const Users = React.lazy(() => import('src/views/identity/administration/Users'))
const DeletedItems = React.lazy(() => import('src/views/identity/administration/Deleted'))
const ViewBEC = React.lazy(() => import('src/views/identity/administration/ViewBEC'))
const AddUser = React.lazy(() => import('src/views/identity/administration/AddUser'))
const EditUser = React.lazy(() => import('src/views/identity/administration/EditUser'))
const ViewUser = React.lazy(() => import('src/views/identity/administration/ViewUser'))
const Groups = React.lazy(() => import('src/views/identity/administration/Groups'))
const AddGroup = React.lazy(() => import('src/views/identity/administration/AddGroup'))
const AddGroupTemplates = React.lazy(() =>
  import('src/views/identity/administration/AddGroupTemplate'),
)
const DeployGroupTemplates = React.lazy(() =>
  import('src/views/identity/administration/DeployGroupTemplate'),
)
const GroupTemplates = React.lazy(() => import('src/views/identity/administration/GroupTemplates'))

const EditGroup = React.lazy(() => import('src/views/identity/administration/EditGroup'))
const ViewGroup = React.lazy(() => import('src/views/identity/administration/ViewGroup'))
const Roles = React.lazy(() => import('src/views/identity/administration/Roles'))
const Devices = React.lazy(() => import('src/views/endpoint/intune/Devices'))
const Page404 = React.lazy(() => import('src/views/pages/page404/Page404'))
const Page403 = React.lazy(() => import('src/views/pages/page403/Page403'))
const Page500 = React.lazy(() => import('src/views/pages/page500/Page500'))

const MFAReport = React.lazy(() => import('src/views/identity/reports/MFAReport'))
const Tenants = React.lazy(() => import('src/views/tenant/administration/Tenants'))
const AlertWizard = React.lazy(() => import('src/views/tenant/administration/AlertWizard'))
const AlertsQueue = React.lazy(() => import('src/views/tenant/administration/ListAlertsQueue'))
const GraphExplorer = React.lazy(() => import('src/views/tenant/administration/GraphExplorer'))

const Domains = React.lazy(() => import('src/views/tenant/administration/Domains'))
const EditTenant = React.lazy(() => import('src/views/tenant/administration/EditTenant'))
const ConditionalAccess = React.lazy(() => import('src/views/tenant/conditional/ConditionalAccess'))
const NamedLocations = React.lazy(() => import('src/views/tenant/conditional/NamedLocations'))

const ListConditionalTemplates = React.lazy(() =>
  import('src/views/tenant/conditional/ListCATemplates'),
)

const DeployNamedLocation = React.lazy(() =>
  import('src/views/tenant/conditional/DeployNamedLocation'),
)
const AddConditionalTemplate = React.lazy(() =>
  import('src/views/tenant/conditional/AddCATemplate'),
)

const DeployConditional = React.lazy(() => import('src/views/tenant/conditional/DeployCA'))

const ListLicences = React.lazy(() => import('src/views/tenant/administration/ListLicences'))
const ListAppConsent = React.lazy(() => import('src/views/tenant/administration/ListOauthApps'))

const BasicAuthReport = React.lazy(() => import('src/views/identity/reports/BasicAuthReport'))
const SignInReport = React.lazy(() => import('src/views/identity/reports/SignIns'))

const AzureADConnectReport = React.lazy(() =>
  import('src/views/identity/reports/AzureADConnectReport'),
)
const DeviceComplianceReport = React.lazy(() =>
  import('src/views/security/reports/ListDeviceComplianceReport'),
)
const BestPracticeAnalyzer = React.lazy(() =>
  import('src/views/tenant/standards/BestPracticeAnalyser'),
)
const DomainsAnalyser = React.lazy(() => import('src/views/tenant/standards/DomainsAnalyser'))
const OffboardingWizard = React.lazy(() =>
  import('src/views/identity/administration/OffboardingWizard'),
)
const ListAppliedStandards = React.lazy(() =>
  import('src/views/tenant/standards/ListAppliedStandards'),
)
const IndividualDomain = React.lazy(() => import('src/views/tenant/standards/IndividualDomain'))
const ListAlerts = React.lazy(() => import('src/views/security/incidents/ListAlerts'))
const ApplicationsList = React.lazy(() =>
  import('src/views/endpoint/applications/ApplicationsList'),
)
const ApplicationsQueue = React.lazy(() =>
  import('src/views/endpoint/applications/ListApplicationQueue'),
)
const ApplicationsAddChocoApp = React.lazy(() =>
  import('src/views/endpoint/applications/ApplicationsAddChocoApp'),
)
const ApplicationsAddWingetApp = React.lazy(() =>
  import('src/views/endpoint/applications/ApplicationsAddWinGet'),
)
const ApplicationsAddOfficeApp = React.lazy(() =>
  import('src/views/endpoint/applications/ApplicationsAddOffice'),
)
const ApplicationsAddRMMApp = React.lazy(() =>
  import('src/views/endpoint/applications/ApplicationsAddRMM'),
)
const AutopilotAddDevice = React.lazy(() =>
  import('src/views/endpoint/autopilot/AutopilotAddDevice'),
)
const AutopilotAddProfile = React.lazy(() =>
  import('src/views/endpoint/autopilot/AutopilotAddProfile'),
)
const AutopilotAddStatusPage = React.lazy(() =>
  import('src/views/endpoint/autopilot/AutopilotAddStatusPage'),
)
const AutopilotListDevices = React.lazy(() =>
  import('src/views/endpoint/autopilot/AutopilotListDevices'),
)
const AutopilotListProfiles = React.lazy(() =>
  import('src/views/endpoint/autopilot/AutopilotListProfiles'),
)
const AutopilotListStatusPages = React.lazy(() =>
  import('src/views/endpoint/autopilot/AutopilotListStatusPages'),
)
const IntuneListPolicies = React.lazy(() => import('src/views/endpoint/intune/MEMListPolicies'))
const MEMEditPolicy = React.lazy(() => import('src/views/endpoint/intune/MEMEditPolicy'))
const EditAutopilotProfile = React.lazy(() =>
  import('src/views/endpoint/autopilot/AutopilotEditProfile'),
)
const EditAutopilotStatusPage = React.lazy(() =>
  import('src/views/endpoint/autopilot/AutopilotEditStatusPage'),
)
const IntuneCAPolicies = React.lazy(() => import('src/views/endpoint/intune/MEMCAPolicies'))
const IntuneAddPolicy = React.lazy(() => import('src/views/endpoint/intune/MEMAddPolicy'))
const MEMAddPolicyTemplate = React.lazy(() =>
  import('src/views/endpoint/intune/MEMAddPolicyTemplate'),
)
const IntuneListPolicyTemplate = React.lazy(() =>
  import('src/views/endpoint/intune/MEMListPolicyTemplates'),
)
const ListDefender = React.lazy(() => import('src/views/security/defender/ListDefender'))
const ListVulnerabilities = React.lazy(() => import('src/views/security/defender/ListVuln'))

const DeployDefender = React.lazy(() => import('src/views/security/defender/DeployDefender'))

const OneDriveList = React.lazy(() => import('src/views/teams-share/onedrive/OneDriveList'))
const SharepointList = React.lazy(() => import('src/views/teams-share/sharepoint/SharepointList'))
const BusinessVoice = React.lazy(() => import('src/views/teams-share/teams/BusinessVoice'))
const TeamsListTeam = React.lazy(() => import('src/views/teams-share/teams/TeamsListTeam'))
const TeamsAddTeam = React.lazy(() => import('src/views/teams-share/teams/TeamsAddTeam'))
const ViewTeamsSettings = React.lazy(() => import('src/views/teams-share/teams/ViewTeamSettings'))
const TeamsActivity = React.lazy(() => import('src/views/teams-share/teams/TeamsActivity'))
const ContactsList = React.lazy(() =>
  import('src/views/email-exchange/administration/ContactsList'),
)
const EditContact = React.lazy(() => import('src/views/email-exchange/administration/EditContact'))
const EditMailboxPermissions = React.lazy(() =>
  import('src/views/email-exchange/administration/EditMailboxPermissions'),
)
const AddSharedMailbox = React.lazy(() =>
  import('src/views/email-exchange/administration/AddSharedMailbox'),
)
const AddContact = React.lazy(() => import('src/views/email-exchange/administration/AddContact'))
const EditCalendarPermissions = React.lazy(() =>
  import('src/views/email-exchange/administration/EditCalendarPermissions'),
)
const ViewMobileDevices = React.lazy(() =>
  import('src/views/email-exchange/administration/ViewMobileDevices'),
)
const MailboxesList = React.lazy(() =>
  import('src/views/email-exchange/administration/MailboxesList'),
)
const MailboxRulesList = React.lazy(() =>
  import('src/views/email-exchange/administration/MailboxRuleList'),
)
const QuarantineList = React.lazy(() =>
  import('src/views/email-exchange/administration/QuarantineList'),
)
const MailboxClientAccessSettingsList = React.lazy(() =>
  import('src/views/email-exchange/reports/MailboxClientAccessSettingsList'),
)
const MailboxStatisticsList = React.lazy(() =>
  import('src/views/email-exchange/reports/MailboxStatisticsList'),
)
const MessageTrace = React.lazy(() => import('src/views/email-exchange/reports/MessageTrace'))
const PhishingPoliciesList = React.lazy(() =>
  import('src/views/email-exchange/reports/PhishingPoliciesList'),
)
const TransportRulesList = React.lazy(() =>
  import('src/views/email-exchange/transport/TransportRules'),
)
const TransportTemplate = React.lazy(() =>
  import('src/views/email-exchange/transport/ListTransportTemplates'),
)
const AddTransportTemplate = React.lazy(() =>
  import('src/views/email-exchange/transport/AddTransportTemplate'),
)
const TransportDeploy = React.lazy(() =>
  import('src/views/email-exchange/transport/DeployTransport'),
)
const SpamfilterList = React.lazy(() => import('src/views/email-exchange/spamfilter/Spamfilter'))
const SpamFilterTemplate = React.lazy(() =>
  import('src/views/email-exchange/spamfilter/ListSpamfilterTemplates'),
)
const AddSpamFilterTemplate = React.lazy(() =>
  import('src/views/email-exchange/spamfilter/AddSpamfilterTemplate'),
)
const SpamFilterDeploy = React.lazy(() =>
  import('src/views/email-exchange/spamfilter/DeploySpamfilter'),
)
const ConnectorList = React.lazy(() => import('src/views/email-exchange/connectors/ConnectorList'))
const ConnectorListTemplates = React.lazy(() =>
  import('src/views/email-exchange/connectors/ListConnectorTemplates'),
)
const DeployConnector = React.lazy(() =>
  import('src/views/email-exchange/connectors/DeployConnector'),
)
const AddConnectorTemplate = React.lazy(() =>
  import('src/views/email-exchange/connectors/AddConnectorTemplate'),
)

const SecurityComplianceAlerts = React.lazy(() => import('src/views/security/incidents/ListAlerts'))
const SecurityComplianceIncidents = React.lazy(() =>
  import('src/views/security/incidents/ListIncidents'),
)
const License = React.lazy(() => import('src/views/pages/license/License'))
const ServiceHealth = React.lazy(() => import('src/views/tenant/administration/ServiceHealth'))

const routes = [
  // { path: '/', exact: true, name: 'Home' },
  { path: '/home', name: 'Home', component: Home },
  { path: '/cipp/logs', name: 'Logs', component: Logs },
  { path: '/cipp/404', name: 'Error', component: Page404 },
  { path: '/cipp/403', name: 'Error', component: Page403 },
  { path: '/cipp/500', name: 'Error', component: Page500 },
  { path: '/identity', name: 'Identity' },
  { path: '/identity/administration/users/add', name: 'Add User', component: AddUser },
  { path: '/identity/administration/users/edit', name: 'Edit User', component: EditUser },
  { path: '/identity/administration/users/view', name: 'View User', component: ViewUser },
  { path: '/identity/administration/ViewBec', name: 'View BEC', component: ViewBEC },
  { path: '/identity/administration', name: 'Administration' },
  { path: '/identity/administration/users', name: 'Users', component: Users },
  { path: '/identity/administration/groups/add', name: 'Add Group', component: AddGroup },
  {
    path: '/identity/administration/group-templates',
    name: 'Group Templates',
    component: GroupTemplates,
  },
  {
    path: '/identity/administration/group-add-template',
    name: 'Add Group Template',
    component: AddGroupTemplates,
  },
  {
    path: '/identity/administration/deploy-group-template',
    name: 'Deploy Group Template',
    component: DeployGroupTemplates,
  },
  { path: '/identity/administration/groups/edit', name: 'Edit Group', component: EditGroup },
  { path: '/identity/administration/groups/view', name: 'View Group', component: ViewGroup },
  { path: '/identity/administration/groups', name: 'Groups', component: Groups },
  { path: '/identity/administration/roles', name: 'Roles', component: Roles },
  {
    path: '/identity/administration/deleted-items',
    name: 'Deleted Items',
    component: DeletedItems,
  },

  { path: '/teams-share/teams/business-voice', name: 'BusinessVoice', component: BusinessVoice },
  {
    path: '/identity/administration/offboarding-wizard',
    name: 'Offboarding Wizard',
    component: OffboardingWizard,
  },
  { path: '/identity/reports', name: 'Reports' },
  { path: '/endpoint/reports/devices', name: 'Devices', component: Devices },
  { path: '/identity/reports/mfa-report', name: 'MFA Report', component: MFAReport },
  {
    path: '/identity/reports/basic-auth-report',
    name: 'Basic Auth Report',
    component: BasicAuthReport,
  },
  {
    path: '/identity/reports/Signin-report',
    name: 'Sign-In Report',
    component: SignInReport,
  },
  {
    path: '/identity/reports/azure-ad-connect-report',
    name: 'AAD Connect Report',
    component: AzureADConnectReport,
  },
  { path: '/tenant', name: 'Tenant' },
  { path: '/tenant/administration', name: 'Administration' },
  { path: '/tenant/administration/tenants', name: 'Tenants', component: Tenants },
  { path: '/tenant/administration/tenants/edit', name: 'Edit Tenant', component: EditTenant },
  { path: '/tenant/administration/domains', name: 'Domains', component: Domains },
  { path: '/tenant/administration/alertswizard', name: 'Alerts Wizard', component: AlertWizard },
  { path: '/tenant/administration/alertsqueue', name: 'Alerts Queue', component: AlertsQueue },
  {
    path: '/tenant/administration/graph-explorer',
    name: 'Graph Explorer',
    component: GraphExplorer,
  },
  {
    path: '/tenant/administration/service-health',
    name: 'Service Health',
    component: ServiceHealth,
  },
  {
    path: '/tenant/conditional/list-policies',
    name: 'Conditional Access',
    component: ConditionalAccess,
  },
  {
    path: '/tenant/conditional/list-named-locations',
    name: 'Named Locations',
    component: NamedLocations,
  },
  {
    path: '/tenant/conditional/deploy',
    name: 'Deploy Conditional Access',
    component: DeployConditional,
  },
  {
    path: '/tenant/conditional/deploy-named-location',
    name: 'Deploy Named Locations',
    component: DeployNamedLocation,
  },
  {
    path: '/tenant/conditional/list-template',
    name: 'Conditional Access Templates',
    component: ListConditionalTemplates,
  },
  {
    path: '/tenant/conditional/add-template',
    name: 'Conditional Access add Template',
    component: AddConditionalTemplate,
  },
  {
    path: '/tenant/administration/list-licenses',
    name: 'List Licenses',
    component: ListLicences,
  },
  {
    path: '/tenant/administration/application-consent',
    name: 'Consented Applications',
    component: ListAppConsent,
  },
  { path: '/tenant/standards', name: 'Standards' },
  {
    path: '/tenant/standards/list-applied-standards',
    name: 'List Applied Standards',
    component: ListAppliedStandards,
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
    path: '/tenant/standards/individual-domains',
    name: 'Individual Domain Check',
    component: IndividualDomain,
  },
  { path: '/tenant/standards/alert-list', name: 'Alert List (Alpha)', component: ListAlerts },
  { path: '/endpoint', name: 'Endpoint' },
  { path: '/endpoint/applications', name: 'Applications' },
  { path: '/endpoint/applications/list', name: 'List', component: ApplicationsList },
  { path: '/endpoint/applications/queue', name: 'Queue', component: ApplicationsQueue },

  {
    path: '/endpoint/applications/add-choco-app',
    name: 'Add Choco App',
    component: ApplicationsAddChocoApp,
  },
  {
    path: '/endpoint/applications/add-winget-app',
    name: 'Add Store App',
    component: ApplicationsAddWingetApp,
  },
  {
    path: '/endpoint/applications/add-office-app',
    name: 'Add Office App',
    component: ApplicationsAddOfficeApp,
  },
  {
    path: '/endpoint/applications/add-rmm-app',
    name: 'Add RMM App',
    component: ApplicationsAddRMMApp,
  },
  { path: '/endpoint/autopilot', name: 'Autopilot' },
  { path: '/endpoint/autopilot/add-device', name: 'Add Device', component: AutopilotAddDevice },
  { path: '/endpoint/autopilot/add-profile', name: 'Add Profile', component: AutopilotAddProfile },
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
    path: '/endpoint/autopilot/edit-autopilot-profiles',
    name: 'Edit Autopilot Profiles',
    component: EditAutopilotProfile,
  },
  {
    path: '/endpoint/autopilot/edit-autopilot-status-page',
    name: 'Edit Autopilot Status Page',
    component: EditAutopilotStatusPage,
  },
  { path: '/endpoint/MEM', name: 'MEM' },
  { path: '/endpoint/MEM/list-policies', name: 'List MEM Policies', component: IntuneListPolicies },
  { path: '/endpoint/MEM/edit-policy', name: 'Edit MEM Policy', component: MEMEditPolicy },
  { path: '/endpoint/MEM/ca-policies', name: 'List Status Pages', component: IntuneCAPolicies },
  { path: '/endpoint/MEM/add-policy', name: 'Add Intune Policy', component: IntuneAddPolicy },
  {
    path: '/endpoint/MEM/add-policy-template',
    name: 'Add Endpoint Manager Policy Template',
    component: MEMAddPolicyTemplate,
  },
  {
    path: '/endpoint/MEM/list-templates',
    name: 'List Intune Policy Template',
    component: IntuneListPolicyTemplate,
  },
  { path: '/security/defender', name: 'Defender' },
  { path: '/security/defender/deployment', name: 'Deploy Defender', component: DeployDefender },
  { path: '/security/defender/list-defender', name: 'List Defender', component: ListDefender },
  {
    path: '/security/defender/list-defender-tvm',
    name: 'List Vulnerabilities',
    component: ListVulnerabilities,
  },

  { path: '/teams-share', name: 'Teams & Sharepoint' },
  { path: '/teams-share/onedrive', name: 'OneDrive' },
  { path: '/teams-share/onedrive/list', name: 'List OneDrive', component: OneDriveList },
  { path: '/teams-share/sharepoint', name: 'Sharepoint' },
  {
    path: '/teams-share/sharepoint/list-sharepoint',
    name: 'List Sharepoint',
    component: SharepointList,
  },
  { path: '/teams-share/teams', name: 'Teams' },
  { path: '/teams-share/teams/list-team', name: 'List Teams', component: TeamsListTeam },
  {
    path: '/teams-share/teams/view-team-settings',
    name: 'View Team Settings',
    component: ViewTeamsSettings,
  },
  { path: '/teams-share/teams/add-team', name: 'List Teams', component: TeamsAddTeam },
  { path: '/teams-share/teams/teams-activity', name: 'List Teams', component: TeamsActivity },
  { name: 'Email & Exchange', path: '/email' },
  { name: 'Email Administration', path: '/email/administration' },
  { name: 'List Contacts', path: '/email/administration/contacts', component: ContactsList },
  {
    path: '/email/connectors/list-connectors',
    name: 'List connectors',
    component: ConnectorList,
  },
  {
    path: '/email/connectors/deploy-connector',
    name: 'Deploy connectors',
    component: DeployConnector,
  },
  {
    path: '/email/connectors/add-connector-templates',
    name: 'Add connectors Templates',
    component: AddConnectorTemplate,
  },
  {
    path: '/email/connectors/list-connector-templates',
    name: 'List connectors Templates',
    component: ConnectorListTemplates,
  },
  {
    path: '/email/transport/list-rules',
    name: 'List Transport rules',
    component: TransportRulesList,
  },
  {
    path: '/email/transport/deploy-rules',
    name: 'Deploy Transport rule',
    component: TransportDeploy,
  },
  {
    path: '/email/transport/list-templates',
    name: 'Transport Rule Templates',
    component: TransportTemplate,
  },
  {
    path: '/email/transport/add-template',
    name: 'Transport Rule add Temmplate',
    component: AddTransportTemplate,
  },
  {
    path: '/email/spamfilter/list-spamfilter',
    name: 'List Spamfilter',
    component: SpamfilterList,
  },
  {
    path: '/email/spamfilter/deploy',
    name: 'Deploy Spamfilter',
    component: SpamFilterDeploy,
  },
  {
    path: '/email/spamfilter/list-templates',
    name: 'Spamfilter Templates',
    component: SpamFilterTemplate,
  },
  {
    path: '/email/spamfilter/add-template',
    name: 'Spamfilter Template',
    component: AddSpamFilterTemplate,
  },
  {
    name: 'Edit Mailbox Permissions',
    path: '/email/administration/edit-mailbox-permissions',
    component: EditMailboxPermissions,
  },
  {
    name: 'Add Shared Mailbox',
    path: '/email/administration/add-shared-mailbox',
    component: AddSharedMailbox,
  },
  {
    name: 'Edit Contact',
    path: '/email/administration/add-contact',
    component: AddContact,
  },
  {
    name: 'Edit Calendar Permissions',
    path: '/email/administration/edit-calendar-permissions',
    component: EditCalendarPermissions,
  },
  {
    name: 'View Mobile Devices',
    path: '/email/administration/view-mobile-devices',
    component: ViewMobileDevices,
  },
  { name: 'Edit Contact', path: '/email/administration/edit-contact', component: EditContact },
  { name: 'List Mailboxes', path: '/email/administration/mailboxes', component: MailboxesList },
  {
    name: 'List Mailbox Rules',
    path: '/email/administration/mailbox-rules',
    component: MailboxRulesList,
  },

  {
    name: 'List Quarantine',
    path: '/email/administration/Quarantine',
    component: QuarantineList,
  },

  { name: 'Email Reports', path: '/email/reports' },
  {
    name: 'Mailbox Statistics',
    path: '/email/reports/mailbox-statistics',
    component: MailboxStatisticsList,
  },
  {
    name: 'Mailbox Client Access Settings',
    path: '/email/reports/mailbox-cas-settings',
    component: MailboxClientAccessSettingsList,
  },
  { name: 'Message Trace', path: '/email/reports/message-trace', component: MessageTrace },
  {
    name: 'Phishing Policies',
    path: '/email/reports/phishing-policies',
    component: PhishingPoliciesList,
  },
  { name: 'Security & Compliance', path: '/security' },
  { name: 'Security Administration', path: '/security/administration' },
  { name: 'Security Reports', path: '/security/reports' },
  {
    name: 'List Alerts',
    path: '/security/incidents/list-alerts',
    component: SecurityComplianceAlerts,
  },
  {
    name: 'List Incidents',
    path: '/security/incidents/list-incidents',
    component: SecurityComplianceIncidents,
  },
  {
    name: 'List Device Compliance Report',
    path: '/security/reports/list-device-compliance',
    component: DeviceComplianceReport,
  },
  {
    name: 'License',
    path: '/license',
    component: License,
  },
]

export default routes
