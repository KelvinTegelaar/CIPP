import { Alert, Divider, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import { useWatch } from 'react-hook-form'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippFormCondition } from '../CippComponents/CippFormCondition'
import jitAdminRoles from '../../data/JitAdminRoles.json'

// Option lists double as the client-side floor: nothing above PT24H (activation) or P365D
// (eligibility / active assignment) is offered, and the backend refuses anything that slips past.
export const activationDurationOptions = [
  { label: '30 minutes', value: 'PT30M' },
  { label: '1 hour', value: 'PT1H' },
  { label: '2 hours', value: 'PT2H' },
  { label: '4 hours', value: 'PT4H' },
  { label: '8 hours (recommended maximum)', value: 'PT8H' },
  { label: '12 hours (above recommended)', value: 'PT12H' },
  { label: '24 hours (hard cap)', value: 'PT24H' },
]

export const eligibilityDurationOptions = [
  { label: '3 months', value: 'P90D' },
  { label: '6 months', value: 'P180D' },
  { label: '1 year (maximum)', value: 'P365D' },
]

export const activeAssignmentDurationOptions = [
  { label: '1 month', value: 'P30D' },
  { label: '3 months', value: 'P90D' },
  { label: '6 months', value: 'P180D' },
  { label: '1 year (maximum)', value: 'P365D' },
]

export const roleScopeOptions = [
  {
    label:
      'Privileged roles (CIPP list: Global, Security, Exchange, ... administrators)',
    value: 'PrivilegedRoles',
  },
  { label: 'All directory roles', value: 'AllRoles' },
  { label: 'Custom selection', value: 'Custom' },
]

export const activationRequiresOptions = [
  { label: 'Multi-factor authentication', value: 'MFA' },
  {
    label: 'Conditional Access authentication context',
    value: 'AuthenticationContext',
  },
]

export const notificationLevelOptions = [
  { label: 'All notifications', value: 'All' },
  { label: 'Critical notifications only', value: 'Critical' },
]

export const roleOptions = [...jitAdminRoles]
  .sort((a, b) => a.Name.localeCompare(b.Name))
  .map((role) => ({ label: role.Name, value: role.ObjectId }))

const findOption = (options, value) =>
  options.find((option) => option.value === value) ??
  (value ? { label: value, value } : null)

/**
 * Maps a stored template (or nothing, for the secure defaults) onto the form's values.
 * Durations are stored as ISO 8601 strings and edited as autocomplete options.
 */
export const templateToFormValues = (template) => {
  const settings = template?.settings ?? {}
  return {
    GUID: template?.GUID,
    templateName: template?.templateName ?? '',
    description: template?.description ?? '',
    roleScope: findOption(
      roleScopeOptions,
      template?.roleScope ?? 'PrivilegedRoles'
    ),
    roles: (template?.roles ?? []).map((role) => ({
      label: role.label,
      value: role.value,
    })),
    settings: {
      activationMaxDuration: findOption(
        activationDurationOptions,
        settings.activationMaxDuration ?? 'PT8H'
      ),
      activationRequires: findOption(
        activationRequiresOptions,
        settings.activationRequires ?? 'MFA'
      ),
      authenticationContextClaimValue:
        settings.authenticationContextClaimValue ?? '',
      activationRequiresTicket: settings.activationRequiresTicket === true,
      activationRequiresApproval: settings.activationRequiresApproval === true,
      approvers: settings.approvers ?? '',
      eligibilityMaxDuration: findOption(
        eligibilityDurationOptions,
        settings.eligibilityMaxDuration ?? 'P365D'
      ),
      activeAssignmentMaxDuration: findOption(
        activeAssignmentDurationOptions,
        settings.activeAssignmentMaxDuration ?? 'P180D'
      ),
      activeAssignmentRequiresMfa:
        settings.activeAssignmentRequiresMfa !== false,
      notificationRecipients: settings.notificationRecipients ?? '',
      notificationLevel: findOption(
        notificationLevelOptions,
        settings.notificationLevel ?? 'All'
      ),
    },
  }
}

const emailListValidator = (value) => {
  const entries = (value ?? '')
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
  const invalid = entries.filter(
    (entry) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(entry)
  )
  return (
    invalid.length === 0 || `Not a valid e-mail address: ${invalid.join(', ')}`
  )
}

export const CippPIMRoleSettingsTemplateForm = ({ formControl }) => {
  const activationMaxDuration = useWatch({
    control: formControl.control,
    name: 'settings.activationMaxDuration',
  })
  const activationHours = (() => {
    const match = /^PT(\d+)H$/.exec(activationMaxDuration?.value ?? '')
    return match ? Number(match[1]) : 0
  })()

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">Template</Typography>
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Template name"
          name="templateName"
          formControl={formControl}
          required={true}
          validators={{ required: 'Template name is required' }}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Description"
          name="description"
          formControl={formControl}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Roles</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          fullWidth
          label="Apply to"
          name="roleScope"
          multiple={false}
          creatable={false}
          options={roleScopeOptions}
          formControl={formControl}
          required={true}
          validators={{
            required: 'Select which roles the template applies to',
          }}
        />
      </Grid>
      <CippFormCondition
        formControl={formControl}
        field="roleScope"
        compareType="contains"
        compareValue="Custom"
      >
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            fullWidth
            label="Roles"
            name="roles"
            multiple={true}
            creatable={false}
            options={roleOptions}
            formControl={formControl}
            validators={{
              validate: (options) =>
                options?.length ? true : 'Select at least one role',
            }}
          />
        </Grid>
      </CippFormCondition>

      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">
          Activation (when an eligible admin uses the role)
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Alert severity="info">
          CIPP enforces a secure floor: activation always requires a
          justification and either MFA or an authentication context, activations
          end within 24 hours, and eligible or active assignments end within a
          year. Templates below the floor are refused, not adjusted.
        </Alert>
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          fullWidth
          label="Maximum activation duration"
          name="settings.activationMaxDuration"
          multiple={false}
          creatable={false}
          options={activationDurationOptions}
          formControl={formControl}
          required={true}
          validators={{ required: 'Select the maximum activation duration' }}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          fullWidth
          label="Activation requires"
          name="settings.activationRequires"
          multiple={false}
          creatable={false}
          options={activationRequiresOptions}
          formControl={formControl}
          required={true}
          validators={{
            required:
              'Activation must require MFA or an authentication context',
          }}
        />
      </Grid>
      {activationHours > 8 && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="warning">
            Activations longer than 8 hours are above the recommended maximum.
            The template can be saved, and the override is recorded in the
            logbook.
          </Alert>
        </Grid>
      )}
      <CippFormCondition
        formControl={formControl}
        field="settings.activationRequires"
        compareType="contains"
        compareValue="AuthenticationContext"
      >
        <Grid size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            fullWidth
            label="Authentication context claim value (e.g. c1)"
            name="settings.authenticationContextClaimValue"
            formControl={formControl}
            validators={{
              required: 'An authentication context claim value is required',
              pattern: {
                value: /^c\d{1,2}$/,
                message: 'Use the context id, such as c1',
              },
            }}
          />
        </Grid>
      </CippFormCondition>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="switch"
          label="Require a ticket number on activation"
          name="settings.activationRequiresTicket"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="switch"
          label="Require approval to activate"
          name="settings.activationRequiresApproval"
          formControl={formControl}
        />
      </Grid>
      <CippFormCondition
        formControl={formControl}
        field="settings.activationRequiresApproval"
        compareType="is"
        compareValue={true}
      >
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            fullWidth
            label="Approvers: group display names or user principal names (comma separated), resolved in each tenant"
            name="settings.approvers"
            formControl={formControl}
            validators={{
              required: 'Name at least one approver when approval is required',
            }}
          />
        </Grid>
      </CippFormCondition>

      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">
          Assignments (what an administrator may hand out)
        </Typography>
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          fullWidth
          label="Maximum eligible assignment duration"
          name="settings.eligibilityMaxDuration"
          multiple={false}
          creatable={false}
          options={eligibilityDurationOptions}
          formControl={formControl}
          required={true}
          validators={{ required: 'Eligible assignments must expire' }}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          fullWidth
          label="Maximum active assignment duration"
          name="settings.activeAssignmentMaxDuration"
          multiple={false}
          creatable={false}
          options={activeAssignmentDurationOptions}
          formControl={formControl}
          required={true}
          validators={{ required: 'Active assignments must expire' }}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="switch"
          label="Require MFA when creating an active assignment"
          name="settings.activeAssignmentRequiresMfa"
          formControl={formControl}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Notifications</Typography>
      </Grid>
      <Grid size={{ md: 8, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Additional admin notification recipients (comma separated e-mail addresses)"
          name="settings.notificationRecipients"
          formControl={formControl}
          validators={{ validate: emailListValidator }}
        />
      </Grid>
      <Grid size={{ md: 4, xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          fullWidth
          label="Notification level"
          name="settings.notificationLevel"
          multiple={false}
          creatable={false}
          options={notificationLevelOptions}
          formControl={formControl}
        />
      </Grid>
    </Grid>
  );
}
