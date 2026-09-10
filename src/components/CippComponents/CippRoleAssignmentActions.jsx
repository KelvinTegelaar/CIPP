import { CippIcons } from '../../utils/icon-registry'
import { usePermissions } from '../../hooks/use-permissions'

const GLOBAL_ADMIN_TEMPLATE_ID = '62e90394-69f5-4237-9190-012177145e10'

const isGlobalAdmin = (row) =>
  row?.RoleDefinitionId === GLOBAL_ADMIN_TEMPLATE_ID
// Catalogue rows (roles nobody holds) have no principal and get no actions.
const isDirect = (row) => !!row?.PrincipalId && row?.MemberType !== 'Group'
const principalLabel = (row) =>
  row?.PrincipalUserPrincipalName ||
  row?.PrincipalDisplayName ||
  row?.PrincipalId ||
  ''

// Anything touching Global Administrator needs the principal's name typed back. For a bulk
// selection that includes a Global Administrator the dialog asks for a generic count phrase.
const globalAdminPhrase = (rowOrRows) => {
  if (Array.isArray(rowOrRows)) {
    return rowOrRows.some(isGlobalAdmin)
      ? `CONFIRM ${rowOrRows.length} ASSIGNMENTS`
      : null
  }
  return isGlobalAdmin(rowOrRows) ? principalLabel(rowOrRows) : null
}

const justificationField = {
  type: 'textField',
  name: 'Justification',
  label: 'Justification (recorded on the PIM request and in the logbook)',
  required: true,
  validators: { required: 'A justification is required' },
}

const eligibilityDurationField = {
  type: 'autoComplete',
  name: 'Duration',
  label: 'Eligibility lifetime',
  multiple: false,
  creatable: false,
  required: true,
  options: [
    { label: '3 months', value: 'P90D' },
    { label: '6 months', value: 'P180D' },
    { label: '1 year', value: 'P365D' },
  ],
  validators: { required: 'Select how long the eligibility lasts' },
}

const activeDurationField = {
  type: 'autoComplete',
  name: 'Duration',
  label: 'Active for',
  multiple: false,
  creatable: false,
  required: true,
  options: [
    { label: '30 minutes', value: 'PT30M' },
    { label: '1 hour', value: 'PT1H' },
    { label: '2 hours', value: 'PT2H' },
    { label: '4 hours', value: 'PT4H' },
    { label: '8 hours', value: 'PT8H' },
    { label: '1 day', value: 'P1D' },
    { label: 'Custom end date', value: 'custom' },
  ],
  validators: { required: 'Select how long the assignment stays active' },
}

const customEndField = {
  type: 'datePicker',
  name: 'EndDateTime',
  label: 'Active until',
  dateTimeType: 'datetime',
  condition: {
    field: 'Duration',
    compareType: 'contains',
    compareValue: 'custom',
  },
}

const baseData = {
  PrincipalId: 'PrincipalId',
  RoleDefinitionId: 'RoleDefinitionId',
  DirectoryScopeId: 'DirectoryScopeId',
  AssignmentType: 'AssignmentType',
}

/**
 * Row/bulk actions for role assignment rows as returned by /api/ListRoleAssignments.
 * Shared by the Role Assignments page and the user view's Admin Roles card, so both surfaces
 * offer exactly the same secure-direction set: convert permanent -> eligible, grant a time-bound
 * active assignment, extend/renew, remove. Nothing here can create a permanent assignment.
 */
export const useCippRoleAssignmentActions = ({
  relatedQueryKeys = ['ListRoleAssignments*'],
} = {}) => {
  const { checkPermissions } = usePermissions()
  const canWriteRole = checkPermissions(['Identity.Role.ReadWrite'])
  // The browser's IANA zone, so the result wording ("until ...") reads in local time; the API
  // falls back to UTC when it is missing.
  const timeZoneData = {
    TimeZone: `!${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
  }

  return [
    {
      label: 'Convert to eligible',
      type: 'POST',
      icon: <CippIcons.SwapHoriz />,
      url: '/api/ExecPIMRoleAssignment',
      data: { ...baseData, ...timeZoneData, Action: '!ConvertToEligible' },
      fields: [eligibilityDurationField, justificationField],
      confirmText:
        'Convert the permanent [RoleDisplayName] assignment of [PrincipalUserPrincipalName] to an eligible assignment? The eligibility is created and verified before the permanent assignment is removed; the principal will need to activate the role to use it.',
      confirmPhrase: globalAdminPhrase,
      relatedQueryKeys,
      condition: (row) =>
        canWriteRole &&
        row?.PIMCapable &&
        row?.AssignmentType === 'Permanent' &&
        isDirect(row) &&
        row?.PrincipalType !== 'ServicePrincipal',
    },
    {
      label: 'Grant time-bound active assignment',
      type: 'POST',
      icon: <CippIcons.HourglassBottom />,
      url: '/api/ExecPIMRoleAssignment',
      data: { ...baseData, ...timeZoneData, Action: '!GrantActive' },
      fields: [activeDurationField, customEndField, justificationField],
      confirmText:
        'Grant [PrincipalUserPrincipalName] an active [RoleDisplayName] assignment for the chosen time? Entra removes the assignment automatically when it expires.',
      confirmPhrase: globalAdminPhrase,
      relatedQueryKeys,
      condition: (row) =>
        canWriteRole &&
        row?.PIMCapable &&
        row?.AssignmentType === 'Eligible' &&
        isDirect(row),
    },
    {
      label: 'Extend',
      type: 'POST',
      icon: <CippIcons.MoreTime />,
      url: '/api/ExecPIMRoleAssignment',
      data: { ...baseData, ...timeZoneData, Action: '!Extend' },
      fields: [activeDurationField, customEndField, justificationField],
      confirmText:
        'Extend the [AssignmentType] [RoleDisplayName] assignment of [PrincipalUserPrincipalName]? The new end is counted from now and cannot exceed the role policy maximum.',
      confirmPhrase: globalAdminPhrase,
      relatedQueryKeys,
      condition: (row) =>
        canWriteRole &&
        row?.PIMCapable &&
        ['Active', 'Eligible'].includes(row?.AssignmentType) &&
        !!row?.EndDateTime &&
        isDirect(row),
    },
    {
      label: 'Renew',
      type: 'POST',
      icon: <CippIcons.Autorenew />,
      url: '/api/ExecPIMRoleAssignment',
      data: { ...baseData, ...timeZoneData, Action: '!Renew' },
      fields: [activeDurationField, customEndField, justificationField],
      confirmText:
        'Renew the expired [AssignmentType] [RoleDisplayName] assignment of [PrincipalUserPrincipalName] for the chosen time?',
      confirmPhrase: globalAdminPhrase,
      relatedQueryKeys,
      condition: (row) =>
        canWriteRole &&
        row?.PIMCapable &&
        ['Active', 'Eligible'].includes(row?.AssignmentType) &&
        !!row?.EndDateTime &&
        new Date(row.EndDateTime) < new Date() &&
        isDirect(row),
    },
    {
      label: 'Remove assignment',
      type: 'POST',
      icon: <CippIcons.PersonRemove />,
      url: '/api/ExecPIMRoleAssignment',
      data: { ...baseData, ...timeZoneData, Action: '!Remove' },
      fields: [justificationField],
      confirmText:
        'Remove the [AssignmentType] [RoleDisplayName] assignment of [PrincipalUserPrincipalName]? The last active Global Administrator is never removed.',
      confirmPhrase: globalAdminPhrase,
      relatedQueryKeys,
      condition: (row) => canWriteRole && row?.PIMCapable && isDirect(row),
    },
    {
      // Tenants without Entra ID P2 have no PIM API; removal goes through the directoryRoles
      // member endpoint the Roles page has always used.
      label: 'Remove assignment',
      type: 'POST',
      icon: <CippIcons.PersonRemove />,
      url: '/api/ExecRemoveAdminRole',
      customDataformatter: (row) => {
        const rows = Array.isArray(row) ? row : [row]
        return rows.map((r) => ({
          tenantFilter: r.Tenant,
          RoleTemplateId: r.RoleDefinitionId,
          RoleName: r.RoleDisplayName,
          Users: [
            {
              value: r.PrincipalId,
              label: principalLabel(r),
              addedFields: {
                displayName: r.PrincipalDisplayName,
                userPrincipalName: r.PrincipalUserPrincipalName,
              },
            },
          ],
        }))
      },
      confirmText:
        'Remove [PrincipalUserPrincipalName] from [RoleDisplayName]? This tenant has no Entra ID P2, so the assignment is removed directly.',
      confirmPhrase: globalAdminPhrase,
      relatedQueryKeys: [...relatedQueryKeys, 'ListRoles*'],
      condition: (row) =>
        canWriteRole && row?.PIMCapable === false && isDirect(row),
    },
  ]
}
