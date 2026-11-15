import { Alert, Divider, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippFormCondition } from '../CippComponents/CippFormCondition'
import { CippFormUserAndGroupSelector } from '../CippComponents/CippFormUserAndGroupSelector'

// Devices picker source, shared with the Add Members action on the administrative units list.
export const deviceMemberApi = (tenantFilter) => ({
  url: '/api/ListGraphRequest',
  data: {
    Endpoint: 'devices',
    manualPagination: true,
    $select: 'id,displayName,operatingSystem',
    $count: true,
    $orderby: 'displayName',
    $top: 999,
  },
  dataKey: 'Results',
  valueField: 'id',
  labelField: (device) =>
    device?.operatingSystem
      ? `${device.displayName} (${device.operatingSystem})`
      : (device?.displayName ?? ''),
  queryKey: `ListDevices-${tenantFilter}`,
})

// Fields shared by the add and edit administrative unit pages. Restricted management can only be
// chosen when the unit is created, so the edit page shows it read-only. Members can be picked for
// an assigned unit: on add they are the first members, on edit they are added or removed
// (currentMembers is the unit's current membership, the source of the remove picker).
const CippAdministrativeUnitForm = ({
  formControl,
  tenantFilter,
  isEdit = false,
  disabled = false,
  currentMembers = [],
}) => {
  const isCurrentMember = (option) =>
    currentMembers.some((member) => member.id === option.value)
  return (
    <Grid container spacing={2}>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Display Name"
          name="displayName"
          formControl={formControl}
          validators={{ required: 'A display name is required' }}
          disabled={disabled}
          fullWidth
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Description"
          name="description"
          formControl={formControl}
          disabled={disabled}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="radio"
          name="visibility"
          label="Membership visibility"
          formControl={formControl}
          disabled={disabled}
          options={[
            {
              label: 'Public: anyone in the tenant can see the members',
              value: 'Public',
            },
            {
              label:
                'Hidden: only members and roles scoped to the unit can see the members',
              value: 'HiddenMembership',
            },
          ]}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="radio"
          name="membershipType"
          label="Membership type"
          formControl={formControl}
          disabled={disabled}
          options={[
            { label: 'Assigned: members are added by hand', value: 'Assigned' },
            {
              label: 'Dynamic: members come from a rule (Entra ID P1)',
              value: 'Dynamic',
            },
          ]}
        />
      </Grid>
      <CippFormCondition
        formControl={formControl}
        field="membershipType"
        compareType="is"
        compareValue="Dynamic"
      >
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Membership rule"
            name="membershipRule"
            formControl={formControl}
            placeholder='(user.department -eq "Sales") or (device.deviceOSType -eq "Windows")'
            helperText="A rule selects users or devices, not both. Groups cannot be added dynamically."
            validators={{
              validate: (value, values) =>
                values.membershipType !== 'Dynamic' ||
                !!value?.trim() ||
                'A dynamic unit needs a membership rule',
            }}
            disabled={disabled}
            multiline
            rows={3}
            fullWidth
          />
        </Grid>
        {isEdit && (
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Pause rule processing (members stay as they are until it is turned back on)"
              name="pauseProcessing"
              formControl={formControl}
              disabled={disabled}
            />
          </Grid>
        )}
      </CippFormCondition>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="switch"
          label="Restricted management: only admins with a role scoped to this unit can change the users, groups and devices in it"
          name="isMemberManagementRestricted"
          formControl={formControl}
          disabled={disabled || isEdit}
        />
        {isEdit ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            Restricted management is set when the unit is created and cannot be
            changed.
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Restricted management cannot be turned off later. Tenant-wide
            admins, including Global Administrators, can no longer change the
            objects in the unit, and neither can CIPP, whose access is
            tenant-wide.
          </Alert>
        )}
      </Grid>
      <CippFormCondition
        formControl={formControl}
        field="membershipType"
        compareType="is"
        compareValue="Assigned"
      >
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6">
            {isEdit ? 'Add Members' : 'Members'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CippFormUserAndGroupSelector
            formControl={formControl}
            name={isEdit ? 'AddMember' : 'members'}
            label="Users or groups"
            helperText="Adding a group adds the group itself, not its members."
            multiple
            disabled={disabled}
            dataFilter={(option) => !isCurrentMember(option)}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            name={isEdit ? 'AddDevice' : 'memberDevices'}
            label="Devices"
            formControl={formControl}
            multiple
            creatable={false}
            disabled={disabled}
            api={{
              ...deviceMemberApi(tenantFilter),
              dataFilter: (options) =>
                options.filter((option) => !isCurrentMember(option)),
              showRefresh: true,
            }}
          />
        </Grid>
        {isEdit && (
          <>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Remove Members</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                name="RemoveMember"
                label="Users, groups or devices"
                formControl={formControl}
                multiple
                creatable={false}
                disabled={disabled}
                options={currentMembers.map((member) => ({
                  label: member.userPrincipalName
                    ? `${member.displayName} (${member.userPrincipalName})`
                    : `${member.displayName} (${member.type})`,
                  value: member.id,
                }))}
                sortOptions
              />
            </Grid>
          </>
        )}
      </CippFormCondition>
    </Grid>
  )
}

export default CippAdministrativeUnitForm
