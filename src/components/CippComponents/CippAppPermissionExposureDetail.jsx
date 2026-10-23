import { Alert, Box, Chip, Divider, Stack, Tooltip, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import { CippDataTable } from '../CippTable/CippDataTable'

const suspicionDescriptions = {
  Low: 'Low suspicion: many legitimate apps hold this, so it is not unusual on its own.',
  Medium: 'Medium suspicion: less common. Check that the app needs it.',
  High: 'High suspicion: unusual for most apps. Confirm who granted it and why.',
  Critical: 'Critical suspicion: rarely legitimate and typical of attacker persistence or privilege escalation. Investigate.',
}

const impactDescriptions = {
  Low: 'Low impact: little damage if the app is compromised.',
  Medium: 'Medium impact: limited read or change access if the app is compromised.',
  High: 'High impact: broad access to data or settings if the app is compromised.',
  Critical: 'Critical impact: tenant-wide data access or control. A breach of the app is a breach of the tenant.',
}

const categoryInfo = {
  PrivilegeEscalation: {
    label: 'Privilege escalation',
    description: 'Can give itself or others more access, such as directory roles or app permissions.',
  },
  DataAccess: {
    label: 'Data access',
    description: 'Can read data such as mail, files, chats or directory information.',
  },
  Integrity: {
    label: 'Integrity',
    description: 'Can create or change data or configuration.',
  },
  Availability: {
    label: 'Availability',
    description: 'Can delete or disable objects, disrupting users or services.',
  },
}

const withDescription = (descriptions, value, cell) =>
  descriptions[value] ? (
    <Tooltip title={descriptions[value]} arrow>
      <span>{cell}</span>
    </Tooltip>
  ) : (
    cell
  )

const renderCategoryChips = (categories, cell) => {
  if (!Array.isArray(categories) || categories.length === 0) return cell
  return (
    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {categories.map((category) => (
        <Tooltip key={category} title={categoryInfo[category]?.description ?? category} arrow>
          <Chip size="small" variant="outlined" label={categoryInfo[category]?.label ?? category} />
        </Tooltip>
      ))}
    </Stack>
  )
}

const renderRiskReasons = (reasons, cell) => {
  if (!Array.isArray(reasons) || reasons.length === 0) return cell
  return (
    <Tooltip
      arrow
      title={
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </Box>
      }
    >
      <span>{cell}</span>
    </Tooltip>
  )
}

export const appPermissionExposureCellRenderers = {
  Risk: (row, cell) => renderRiskReasons(row?.RiskReasons, cell),
  HighestImpact: (row, cell) => withDescription(impactDescriptions, row?.HighestImpact, cell),
  Suspicion: (row, cell) => withDescription(suspicionDescriptions, row?.Suspicion, cell),
  Categories: (row, cell) => renderCategoryChips(row?.Categories, cell),
}

const permissionCellRenderers = {
  Impact: (row, cell) => withDescription(impactDescriptions, row?.Impact, cell),
  Suspicion: (row, cell) => withDescription(suspicionDescriptions, row?.Suspicion, cell),
  Categories: (row, cell) => renderCategoryChips(row?.Categories, cell),
}

// Cache types the report is built from; Sync refreshes all of them.
export const appPermissionExposureCaches = [
  'ServicePrincipals',
  'AppRoleAssignments',
  'OAuth2PermissionGrants',
  'ServicePrincipalSignInActivities',
]

export const appPermissionExposureFilters = [
  {
    filterName: 'Critical risk',
    value: [{ id: 'Risk', value: 'Critical' }],
    type: 'column',
  },
  {
    filterName: 'High risk',
    value: [{ id: 'Risk', value: 'High' }],
    type: 'column',
  },
  {
    filterName: 'Critical impact',
    value: [{ id: 'HighestImpact', value: 'Critical' }],
    type: 'column',
  },
  {
    filterName: 'Tenant-wide data access (vendor breach exposure)',
    value: [
      { id: 'HighestImpact', value: 'Critical' },
      { id: 'Categories', value: 'DataAccess' },
    ],
    type: 'column',
  },
  {
    filterName: 'Privilege escalation',
    value: [{ id: 'Categories', value: 'PrivilegeEscalation' }],
    type: 'column',
  },
  {
    filterName: 'Critical suspicion',
    value: [{ id: 'Suspicion', value: 'Critical' }],
    type: 'column',
  },
  {
    filterName: 'Stale apps (no sign-in for 90+ days)',
    value: [{ id: 'SignInActivity', value: 'Stale 90+ days' }],
    type: 'column',
  },
  {
    filterName: 'Apps with no sign-in recorded',
    value: [{ id: 'SignInActivity', value: 'No sign-in recorded' }],
    type: 'column',
  },
  {
    filterName: 'MSP vendor apps',
    value: [{ id: 'Ownership', value: 'MSP vendor' }],
    type: 'column',
  },
  {
    filterName: 'Other known vendor apps',
    value: [{ id: 'Ownership', value: 'Known vendor' }],
    type: 'column',
  },
  {
    filterName: 'Third-party apps',
    value: [{ id: 'Ownership', value: 'Third party' }],
    type: 'column',
  },
  {
    filterName: 'Apps registered with a personal Microsoft account',
    value: [{ id: 'Ownership', value: 'Personal account' }],
    type: 'column',
  },
  {
    filterName: 'Apps owned by this tenant',
    value: [{ id: 'Ownership', value: 'This tenant' }],
    type: 'column',
  },
  {
    filterName: 'Microsoft apps',
    value: [{ id: 'Ownership', value: 'Microsoft' }],
    type: 'column',
  },
]

export const ratingChipColor = (rating) => {
  switch (rating) {
    case 'Critical':
      return 'error'
    case 'High':
      return 'warning'
    case 'Medium':
      return 'info'
    default:
      return 'default'
  }
}

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

export const formatSignInDate = (value) => (value ? new Date(value).toLocaleString() : null)

// Hover details for the SignInActivity column.
export const signInActivityTooltip = (row) => {
  if (!row?.SignInActivity) return null
  if (row.SignInActivity === 'Unknown') {
    return {
      title: 'Sign-in activity unknown',
      description:
        'Read from the Service Principal Sign-In Activity cache (Entra ID P1), also on live data. Sync to collect it.',
    }
  }
  return {
    title: row.SignInActivity,
    items: [
      { label: 'Last sign-in (any)', value: formatSignInDate(row.LastSignInDateTime) },
      { label: 'Days since', value: row.DaysSinceLastSignIn },
      { label: 'Delegated (user)', value: formatSignInDate(row.LastDelegatedSignInDateTime) ?? 'None' },
      { label: 'App-only', value: formatSignInDate(row.LastAppOnlySignInDateTime) ?? 'None' },
      { label: 'As a resource', value: formatSignInDate(row.LastSignInAsResourceDateTime) ?? 'None' },
      { label: 'Collected', value: formatSignInDate(row.SignInActivityTimestamp) },
    ],
  }
}

// Fields a host page already shows about the app; left out when embedded.
const identityLabels = new Set(['Application ID', 'Service principal ID', 'Publisher', 'Sign-in audience', 'Created'])

// Detail panel for a row of the App Permission Exposure report. Embedded drops the title and the
// app's identity fields, for pages that already show them.
export const CippAppPermissionExposureDetail = ({ row, embedded = false }) => {
  if (!row) return null

  const properties = [
    { label: 'Application ID', value: row.AppId },
    { label: 'Service principal ID', value: row.ServicePrincipalId },
    { label: 'Ownership', value: row.Ownership },
    { label: 'Vendor', value: row.Vendor ? `${row.Vendor}${row.VendorCompany && row.VendorCompany !== row.Vendor ? ` (${row.VendorCompany})` : ''}` : null },
    { label: 'Vendor category', value: row.VendorCategory },
    { label: 'Vendor website', value: row.VendorWebsite },
    { label: 'Owner tenant ID', value: row.AppOwnerTenantId },
    { label: 'Publisher', value: row.PublisherName },
    { label: 'Verified publisher', value: row.VerifiedPublisher || (row.Ownership ? 'None' : null) },
    { label: 'Sign-in audience', value: row.SignInAudience },
    { label: 'Created', value: row.CreatedDateTime ? new Date(row.CreatedDateTime).toLocaleString() : null },
    { label: 'Sign-in activity', value: row.SignInActivity },
    { label: 'Last sign-in (any)', value: formatSignInDate(row.LastSignInDateTime) },
    { label: 'Last delegated sign-in', value: formatSignInDate(row.LastDelegatedSignInDateTime) },
    { label: 'Last app-only sign-in', value: formatSignInDate(row.LastAppOnlySignInDateTime) },
    { label: 'Last sign-in as a resource', value: formatSignInDate(row.LastSignInAsResourceDateTime) },
    { label: 'Credentials on the service principal', value: row.ServicePrincipalCredentialCount },
    { label: 'Application permissions', value: row.ApplicationPermissionCount },
    { label: 'Delegated permissions', value: row.DelegatedPermissionCount },
    { label: 'Admin consent for all users', value: row.HasAllPrincipalsGrant },
  ]
    .map((prop) => ({ ...prop, value: formatValue(prop.value) }))
    .filter((prop) => prop.value !== null && !(embedded && identityLabels.has(prop.label)))

  const isThirdParty = ['Third party', 'MSP vendor', 'Known vendor', 'Personal account'].includes(row.Ownership)
  const canReadTenantData =
    row.HighestImpact === 'Critical' && Array.isArray(row.Categories) && row.Categories.includes('DataAccess')

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        {!embedded && <Typography variant="h6">{row.AppDisplayName}</Typography>}
        {row.Risk && (
          <Chip size="small" label={`Risk: ${row.Risk}`} color={ratingChipColor(row.Risk)} />
        )}
        {row.HighestImpact && (
          <Chip
            size="small"
            variant="outlined"
            label={`Impact: ${row.HighestImpact}`}
            color={ratingChipColor(row.HighestImpact)}
          />
        )}
        {row.Suspicion && (
          <Chip
            size="small"
            variant="outlined"
            label={`Suspicion: ${row.Suspicion}`}
            color={ratingChipColor(row.Suspicion)}
          />
        )}
        {row.Ownership && <Chip size="small" variant="outlined" label={row.Vendor ? `${row.Ownership}: ${row.Vendor}` : row.Ownership} />}
        {row.AccountEnabled !== null && row.AccountEnabled !== undefined && (
          <Chip
            size="small"
            variant="outlined"
            label={row.AccountEnabled ? 'Enabled' : 'Disabled'}
            color={row.AccountEnabled ? 'default' : 'success'}
          />
        )}
        {row.IsCippApp && <Chip size="small" variant="outlined" color="info" label="CIPP" />}
      </Stack>

      {row.IsCippApp && (
        <Alert severity="info">
          This is CIPP&apos;s own application. It needs these permissions to manage the tenant;
          disabling or deleting it cuts CIPP off from this tenant.
        </Alert>
      )}
      {isThirdParty && canReadTenantData && !row.IsCippApp && (
        <Alert severity="warning">
          This third-party app can read tenant-wide data. Its credentials live in the vendor&apos;s
          tenant, so a breach at the vendor gives the attacker this access without any change in
          this tenant. Disabling the service principal stops sign-ins and token issuance for it here.
        </Alert>
      )}

      {Array.isArray(row.RiskReasons) && row.RiskReasons.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Why {row.Risk} risk
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {row.RiskReasons.map((reason) => (
              <Typography component="li" variant="body2" key={reason}>
                {reason}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      <Grid container spacing={2}>
        {properties.map((prop) => (
          <Grid size={{ md: 4, xs: 12 }} key={prop.label}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {prop.label}
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {prop.value}
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Divider />
      <Box>
        <CippDataTable
          noCard={true}
          title="Permissions"
          data={row.PermissionDetails ?? []}
          simpleColumns={['Api', 'Name', 'Type', 'Impact', 'Suspicion', 'Categories', 'ConsentType', 'Reason']}
          cellRenderers={permissionCellRenderers}
        />
      </Box>
    </Stack>
  )
}

export default CippAppPermissionExposureDetail
