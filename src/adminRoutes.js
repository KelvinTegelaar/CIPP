import React from 'react'
const CIPPSettings = React.lazy(() => import('src/views/cipp/CIPPSettings'))
const ApplyStandard = React.lazy(() => import('src/views/tenant/standards/ApplyStandard'))

const adminRoutes = [
  { path: '/cipp', name: 'CIPP' },
  { path: '/cipp/cipp', name: 'CIPP' },
  { path: '/cipp/settings', name: 'Settings', component: CIPPSettings },
  { path: '/tenant/standards/apply-standard', name: 'Apply Standard', component: ApplyStandard },
]

export default adminRoutes
