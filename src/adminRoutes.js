import React from 'react'
const CIPPSettings = React.lazy(() => import('src/views/cipp/CIPPSettings'))
const Setup = React.lazy(() => import('src/views/cipp/Setup'))
const ApplyStandard = React.lazy(() => import('src/views/tenant/standards/ApplyStandard'))
const GDAPStatus = React.lazy(() => import('src/views/tenant/administration/ListGDAPQueue'))
const GDAP = React.lazy(() => import('src/views/tenant/administration/GDAPWizard'))
const GDAPInvite = React.lazy(() => import('src/views/tenant/administration/GDAPInviteWizard'))
const GDAPRoleWizard = React.lazy(() => import('src/views/tenant/administration/GDAPRoleWizard'))
const GDAPRoles = React.lazy(() => import('src/views/tenant/administration/ListGDAPRoles'))
const GDAPRelationships = React.lazy(() =>
  import('./views/tenant/administration/ListGDAPRelationships'),
)
const appapproval = React.lazy(() => import('src/views/cipp/AppApproval'))

const adminRoutes = [
  { path: '/cipp', name: 'CIPP' },
  { path: '/cipp/cipp', name: 'CIPP' },
  { path: '/cipp/settings', name: 'Settings', component: CIPPSettings },
  { path: '/cipp/setup', name: 'Setup', component: Setup },
  { path: '/tenant/administration/gdap', name: 'GDAP Wizard', component: GDAP },
  { path: '/tenant/administration/gdap-invite', name: 'GDAP Invite Wizard', component: GDAPInvite },
  {
    path: '/tenant/administration/gdap-role-wizard',
    name: 'GDAP Role Wizard',
    component: GDAPRoleWizard,
  },
  {
    path: '/tenant/administration/gdap-roles',
    name: 'GDAP Roles',
    component: GDAPRoles,
  },
  {
    path: '/tenant/administration/gdap-relationships',
    name: 'GDAP Relationships',
    component: GDAPRelationships,
  },
  { path: '/tenant/administration/appapproval', name: 'App Approval', component: appapproval },
  { path: '/tenant/administration/gdap-status', name: 'GDAP Status', component: GDAPStatus },
  { path: '/tenant/standards/apply-standard', name: 'Apply Standard', component: ApplyStandard },
]

export default adminRoutes
