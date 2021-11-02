import React from 'react'

const Home = React.lazy(() => import('./views/home/Home'))
const Users = React.lazy(() => import('./views/identity/administration/Users'))
const Groups = React.lazy(() => import('./views/identity/administration/Groups'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/home', name: 'Home', component: Home },
  { path: '/identity', name: 'Identity' },
  { path: '/identity/administration', name: 'Administration' },
  { path: '/identity/administration/users', name: 'Users', component: Users },
  { path: '/identity/administration/groups', name: 'Groups', component: Groups },
]

export default routes
