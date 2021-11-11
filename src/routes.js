import React from 'react'

const Home = React.lazy(() => import('./views/home/Home'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const Settings = React.lazy(() => import('./views/profile/Settings'))
const Users = React.lazy(() => import('./views/identity/administration/Users'))
const Groups = React.lazy(() => import('./views/identity/administration/Groups'))
const Devices = React.lazy(() => import('./views/identity/reports/Devices'))
const MFAReport = React.lazy(() => import('./views/identity/reports/MFAReport'))
const Tenants = React.lazy(() => import('./views/tenant/administration/Tenants'))
const Domains = React.lazy(() => import('./views/tenant/administration/Domains'))
const Conditionalaccess = React.lazy(() =>
  import('./views/tenant/administration/Conditionalaccess'),
)
const BestPracticeAnalyzer = React.lazy(() =>
  import('./views/tenant/standards/BestPracticeAnalyser'),
)
const DomainsAnalyser = React.lazy(() => import('./views/tenant/standards/DomainsAnalyser'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/home', name: 'Home', component: Home },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/profile/settings', name: 'Settings', component: Settings },
  { path: '/identity', name: 'Identity' },
  { path: '/identity/administration', name: 'Administration' },
  { path: '/identity/administration/users', name: 'Users', component: Users },
  { path: '/identity/administration/groups', name: 'Groups', component: Groups },
  { path: '/identity/reports', name: 'Reports' },
  { path: '/identity/reports/devices', name: 'Devices', component: Devices },
  { path: '/identity/reports/mfa-report', name: 'MFA Report', component: MFAReport },
  {
    path: '/tenant',
    name: 'Tenant',
  },
  { path: '/tenant/administration', name: 'Administration' },
  { path: '/tenant/administration/tenants', name: 'Tenants', component: Tenants },
  { path: '/tenant/administration/domains', name: 'Domains', component: Domains },
  {
    path: '/tenant/administration/conditionalaccesspolicies',
    name: 'Conditional Access',
    component: Conditionalaccess,
  },
  {
    path: '/tenant/standards',
    name: 'Standards',
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
]

export default routes
