import { useEffect, useRef } from 'react'
import { Button, SvgIcon } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { useDialog } from '../../../../hooks/use-dialog'
import { CippIcons } from '../../../../utils/icon-registry'

const DIRECTIONS = [
  [
    'b2bCollaborationInbound',
    'collaborationInbound',
    'B2B collaboration: their users invited here',
  ],
  [
    'b2bCollaborationOutbound',
    'collaborationOutbound',
    'B2B collaboration: our users invited there',
  ],
  [
    'b2bDirectConnectInbound',
    'directConnectInbound',
    'B2B direct connect (Teams shared channels): inbound',
  ],
  [
    'b2bDirectConnectOutbound',
    'directConnectOutbound',
    'B2B direct connect (Teams shared channels): outbound',
  ],
]
const TRUST = [
  ['isMfaAccepted', 'trustMfa', 'Trust MFA from the other organisation'],
  [
    'isCompliantDeviceAccepted',
    'trustCompliantDevices',
    'Trust compliant devices',
  ],
  [
    'isHybridAzureADJoinedDeviceAccepted',
    'trustHybridJoinedDevices',
    'Trust hybrid-joined devices',
  ],
]
const ACCESS_LABELS = {
  allowed: 'Allowed',
  blocked: 'Blocked',
  inherit: 'Uses default',
  custom: 'Specific users or apps',
}

// allowed / blocked only when the setting covers all users and all applications.
const accessOf = (setting) => {
  if (!setting) return 'inherit'
  const users = setting.usersAndGroups
  const apps = setting.applications
  const allUsers =
    users?.targets?.length === 1 && users.targets[0].target === 'AllUsers'
  const allApps =
    apps?.targets?.length === 1 && apps.targets[0].target === 'AllApplications'
  return allUsers && allApps && users.accessType === apps.accessType
    ? users.accessType
    : 'custom'
}
const editableAccess = (setting) => {
  const access = accessOf(setting)
  return access === 'custom' ? 'unchanged' : access
}
const yesNo = (value) => (value === true ? 'Yes' : 'No')

const toRows = (rows) =>
  rows.map((row) => {
    const display = {
      organisation: row.isDefault
        ? 'Default (all other organisations)'
        : row.partnerName || 'Unknown organisation',
      autoRedeemInbound: yesNo(
        row.automaticUserConsentSettings?.inboundAllowed
      ),
      autoRedeemOutbound: yesNo(
        row.automaticUserConsentSettings?.outboundAllowed
      ),
    }
    DIRECTIONS.forEach(([key, column]) => {
      display[column] = ACCESS_LABELS[accessOf(row[key])]
    })
    TRUST.forEach(([key, column]) => {
      display[column] = row.inboundTrust
        ? yesNo(row.inboundTrust[key])
        : ACCESS_LABELS.inherit
    })
    return { ...row, ...display }
  })

const accessFields = (isPartner) =>
  DIRECTIONS.map(([name, , label]) => ({
    type: 'radio',
    name,
    label,
    options: [
      ...(isPartner
        ? [{ label: 'Use the default settings', value: 'inherit' }]
        : []),
      { label: 'Allow all', value: 'allowed' },
      { label: 'Block all', value: 'blocked' },
      { label: 'Leave unchanged', value: 'unchanged' },
    ],
  }))
const trustFields = (condition) =>
  TRUST.map(([name, , label]) => ({ type: 'switch', name, label, condition }))

const partnerFields = [
  ...accessFields(true),
  {
    type: 'radio',
    name: 'inboundTrust',
    label: 'Inbound trust (Conditional Access)',
    options: [
      { label: 'Use the default settings', value: 'inherit' },
      { label: 'Set for this organisation', value: 'set' },
    ],
  },
  ...trustFields({
    field: 'inboundTrust',
    compareType: 'is',
    compareValue: 'set',
  }),
  {
    type: 'switch',
    name: 'inboundAllowed',
    label: 'Automatically redeem invitations: inbound',
  },
  {
    type: 'switch',
    name: 'outboundAllowed',
    label: 'Automatically redeem invitations: outbound',
  },
]

const partnerDefaults = (row) => ({
  ...Object.fromEntries(
    DIRECTIONS.map(([key]) => [key, editableAccess(row[key])])
  ),
  inboundTrust: row.inboundTrust ? 'set' : 'inherit',
  ...Object.fromEntries(
    TRUST.map(([key]) => [key, row.inboundTrust?.[key] === true])
  ),
  inboundAllowed: row.automaticUserConsentSettings?.inboundAllowed === true,
  outboundAllowed: row.automaticUserConsentSettings?.outboundAllowed === true,
})

const defaultPolicyDefaults = (row) => ({
  ...Object.fromEntries(
    DIRECTIONS.map(([key]) => [key, editableAccess(row[key])])
  ),
  ...Object.fromEntries(
    TRUST.map(([key]) => [key, row.inboundTrust?.[key] === true])
  ),
})
const addDefaults = partnerDefaults({})
const liveReadData = { InvalidateCIPPCache: true }

const Page = () => {
  const addDialog = useDialog()
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListCrossTenantAccess',
    queryKey: 'ListCrossTenantAccess',
    cacheName: ['CrossTenantAccessPolicy', 'CrossTenantPartners'],
    syncTitle: 'Sync cross-tenant access',
    defaultCached: false,
    allowAllTenantSync: true,
    serverPagination: true,
    // Edits here are read straight back, so skip the response cache that would replay the pre-edit answer.
    apiData: liveReadData,
  })
  const relatedQueryKeys = ['ListCrossTenantAccess*']

  // Graph takes a few seconds to show a change, so read the list again once it has caught up.
  const queryClient = useQueryClient()
  const refreshTimers = useRef([])
  const refreshLater = () => {
    refreshTimers.current.forEach(clearTimeout)
    refreshTimers.current = [8000, 20000].map((ms) =>
      setTimeout(
        () =>
          queryClient.invalidateQueries({
            predicate: (query) =>
              String(query.queryKey?.[0] ?? '').startsWith(
                'ListCrossTenantAccess'
              ),
          }),
        ms
      )
    )
  }
  useEffect(() => () => refreshTimers.current.forEach(clearTimeout), [])

  const actions = [
    {
      label: 'Edit default settings',
      type: 'POST',
      url: '/api/EditCrossTenantAccess',
      icon: <CippIcons.Edit />,
      data: {},
      fields: [...accessFields(false), ...trustFields()],
      defaultvalues: defaultPolicyDefaults,
      confirmText:
        'Change the default settings for every organisation without its own settings. "Leave unchanged" keeps settings that target specific users or apps.',
      condition: (row) => row.isDefault,
      relatedQueryKeys,
      onSuccess: refreshLater,
      hideBulk: true,
    },
    {
      label: 'Edit partner',
      type: 'POST',
      url: '/api/EditCrossTenantAccess',
      icon: <CippIcons.Edit />,
      data: { partnerTenantId: 'tenantId' },
      fields: partnerFields,
      defaultvalues: partnerDefaults,
      confirmText:
        'Change the cross-tenant access settings for [organisation].',
      condition: (row) => !row.isDefault,
      relatedQueryKeys,
      onSuccess: refreshLater,
      hideBulk: true,
    },
    {
      label: 'Remove partner',
      type: 'POST',
      url: '/api/RemoveCrossTenantPartner',
      icon: <CippIcons.Delete />,
      data: { partnerTenantId: 'tenantId' },
      confirmText:
        'Remove [organisation] as a partner organisation? The default settings will apply to it again.',
      condition: (row) => !row.isDefault,
      relatedQueryKeys,
      onSuccess: refreshLater,
      color: 'danger',
    },
  ]

  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
    'organisation',
    'partnerDomain',
    'tenantId',
    ...DIRECTIONS.map(([, column]) => column),
    ...TRUST.map(([, column]) => column),
    'autoRedeemInbound',
    'autoRedeemOutbound',
    ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
  ]

  return (
    <>
      <CippTablePage
        title="Cross-Tenant Access"
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        simpleColumns={simpleColumns}
        dataTransform={toRows}
        cardButton={
          reportDB.isAllTenants ? undefined : (
            <Button
              variant="contained"
              size="small"
              onClick={addDialog.handleOpen}
            >
              <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
                <CippIcons.Add />
              </SvgIcon>
              Add partner organisation
            </Button>
          )
        }
        dataSourceControls={reportDB.controls}
      />
      {reportDB.syncDialog}
      <CippApiDialog
        title="Add partner organisation"
        createDialog={addDialog}
        row={{}}
        fields={[
          {
            type: 'textField',
            name: 'partnerTenantId',
            label: 'Partner domain or tenant ID',
            validators: { required: 'Enter a domain or tenant ID' },
          },
          ...partnerFields,
        ]}
        defaultvalues={addDefaults}
        api={{
          url: '/api/EditCrossTenantAccess',
          type: 'POST',
          data: {},
          confirmText:
            'Add a partner organisation with its own cross-tenant access settings. Settings left on "Use the default settings" follow the default.',
          relatedQueryKeys,
          onSuccess: refreshLater,
        }}
      />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
