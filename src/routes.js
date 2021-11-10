import React from 'react'

const Home = React.lazy(() => import('./views/home/Home'))
const Users = React.lazy(() => import('./views/identity/administration/Users'))
const Groups = React.lazy(() => import('./views/identity/administration/Groups'))
const BestPracticeAnalyzer = React.lazy(() =>
  import('./views/tenant/standards/BestPracticeAnalyser'),
)
const DomainsAnalyser = React.lazy(() => import('./views/tenant/standards/DomainsAnalyser'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/home', name: 'Home', component: Home },
  { path: '/identity', name: 'Identity' },
  { path: '/identity/administration', name: 'Administration' },
  { path: '/identity/administration/users', name: 'Users', component: Users },
  { path: '/identity/administration/groups', name: 'Groups', component: Groups },
  {
    path: '/tenant',
    name: 'Tenant',
  },
  {
    path: '/tenant/standards',
    name: 'Standards',
  },
  {
    path: '/tenant/standards/bpareport',
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
