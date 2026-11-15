import { Dialog, DialogContent, DialogTitle, IconButton, useMediaQuery } from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { CippDataTable } from '../CippTable/CippDataTable'
import { usePermissions } from '../../hooks/use-permissions'
import {
  activeDurationField,
  customEndField,
  justificationField,
  useCippRoleAssignmentActions,
} from './CippRoleAssignmentActions'

/**
 * What an administrative unit is used for: Entra role assignments scoped to it and Exchange role
 * assignments (admin and app) scoped to it. Entra rows carry the Roles page's secure-direction
 * actions; a scoped role is granted time-bound through PIM, never permanently.
 */
export const CippAdministrativeUnitUsageDialog = ({ unit, tenantFilter, open, onClose }) => {
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down('md'))
  const { checkPermissions } = usePermissions()
  const canWriteRole = checkPermissions(['Identity.Role.ReadWrite'])
  const queryKey = `AdministrativeUnitUsage-${tenantFilter}-${unit?.id}`
  const roleActions = useCippRoleAssignmentActions({ relatedQueryKeys: [queryKey, 'ListPIMRoles*'] })

  if (!open || !unit) {
    return null
  }

  const actions = [
    // The non-PIM removal deletes a tenant-wide directory role membership, never a unit-scoped one.
    ...roleActions.filter((action) => action.url !== '/api/ExecRemoveAdminRole'),
    {
      label: "View app's Exchange access",
      link: `/tenant/administration/applications/enterprise-app/exchange?spId=[ServicePrincipalId]&tenantFilter=${tenantFilter}`,
      icon: <CippIcons.Launch />,
      multiPost: false,
      condition: (row) => row?.Source === 'Exchange app role' && !!row?.ServicePrincipalId,
    },
  ]

  const grantButton = canWriteRole
    ? {
        label: 'Grant scoped role',
        icon: <CippIcons.HourglassBottom />,
        url: '/api/ExecPIMRoleAssignment',
        relatedQueryKeys: [queryKey, 'ListPIMRoles*'],
        confirmText: `Grant a time-bound active role assignment scoped to ${unit.displayName}? The role only applies to the users, groups and devices in the unit. Needs Entra ID P2; only roles that support an administrative unit scope can be chosen by Entra.`,
        fields: [
          {
            type: 'autoComplete',
            name: 'Principal',
            label: 'User or group',
            multiple: false,
            creatable: false,
            api: {
              url: '/api/ListUsersAndGroups',
              dataKey: 'Results',
              valueField: 'id',
              labelField: 'displayName',
              descriptionField: 'userPrincipalName',
            },
            validators: { required: 'Select a user or group' },
          },
          {
            type: 'autoComplete',
            name: 'Role',
            label: 'Role',
            multiple: false,
            creatable: false,
            sortOptions: true,
            api: {
              url: '/api/ListGraphRequest',
              data: {
                Endpoint: 'roleManagement/directory/roleDefinitions',
                $select: 'id,templateId,displayName',
              },
              dataKey: 'Results',
              valueField: 'templateId',
              labelField: 'displayName',
              queryKey: `RoleDefinitions-${tenantFilter}`,
            },
            validators: { required: 'Select a role' },
          },
          activeDurationField,
          customEndField,
          justificationField,
        ],
        customDataformatter: (row, action, formData) => ({
          tenantFilter,
          Action: 'GrantActive',
          PrincipalId: formData.Principal?.value,
          RoleDefinitionId: formData.Role?.value,
          DirectoryScopeId: `/administrativeUnits/${unit.id}`,
          Duration: formData.Duration,
          EndDateTime: formData.EndDateTime,
          Justification: formData.Justification,
          TimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      }
    : undefined

  return (
    <Dialog open onClose={onClose} fullWidth fullScreen={mdDown} maxWidth="lg">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton onClick={onClose} aria-label="Close">
          <CippIcons.Close />
        </IconButton>
        Where {unit.displayName} is used
      </DialogTitle>
      <DialogContent sx={{ p: mdDown ? 1 : 0 }}>
        <CippDataTable
          title="Role assignments scoped to this unit"
          noCard={false}
          isInDialog
          hideTitle={mdDown}
          api={{
            url: '/api/ListAdministrativeUnitUsage',
            data: { tenantFilter, ID: unit.id, displayName: unit.displayName },
          }}
          queryKey={queryKey}
          parentRow={unit}
          actions={actions}
          cardButton={grantButton}
          simpleColumns={[
            'Source',
            'RoleDisplayName',
            'PrincipalDisplayName',
            'PrincipalUserPrincipalName',
            'PrincipalType',
            'AssignmentType',
            'EndDateTime',
          ]}
        />
      </DialogContent>
    </Dialog>
  )
}
