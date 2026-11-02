import { Alert, Divider, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippFormCondition } from '../CippComponents/CippFormCondition'
import { getGroupPickerField } from '../CippComponents/CippIntunePolicyActions'

export const enrollmentRestrictionPlatformOptions = [
  { label: 'Android', value: 'android' },
  { label: 'iOS/iPadOS', value: 'ios' },
  { label: 'macOS', value: 'macOS' },
  { label: 'Windows', value: 'windows' },
]

// The AssignTo values Intune templates use. Restrictions apply to users, so there is no
// All Devices option.
const assignToOptions = [
  { label: 'Do Not Assign', value: 'On' },
  { label: 'Assign to All Users', value: 'allLicensedUsers' },
  { label: 'Assign to Custom Group', value: 'customGroup' },
]

const versionHint = {
  android: 'Example: 13.0',
  ios: 'Example: 17.0',
  windows: 'Example: 10.0.19045',
}

export const enrollmentRestrictionDefaults = {
  platform: 'android',
  displayName: '',
  description: '',
  priority: null,
  platformBlocked: false,
  personalDeviceEnrollmentBlocked: false,
  osMinimumVersion: '',
  osMaximumVersion: '',
  deviceAdminPlatformBlocked: true,
  deviceAdminPersonalDeviceEnrollmentBlocked: false,
  deviceAdminOsMinimumVersion: '',
  deviceAdminOsMaximumVersion: '',
  deviceAdminBlockedManufacturers: [],
  AssignTo: 'customGroup',
  customGroup: '',
  groupTargets: [],
}

// Maps a row from ListEnrollmentRestrictions or a saved template onto the form.
export const enrollmentRestrictionToForm = (restriction) => {
  const groupNames = Array.isArray(restriction?.customGroup)
    ? restriction.customGroup
    : `${restriction?.customGroup ?? ''}`.split(',').map((name) => name.trim()).filter(Boolean)
  return {
    ...enrollmentRestrictionDefaults,
    ...Object.fromEntries(
      Object.keys(enrollmentRestrictionDefaults)
        .filter((key) => restriction?.[key] !== undefined && restriction?.[key] !== null)
        .map((key) => [key, restriction[key]])
    ),
    customGroup: groupNames.join(', '),
    deviceAdminBlockedManufacturers: (restriction?.deviceAdminBlockedManufacturers ?? []).map(
      (name) => ({ label: name, value: name })
    ),
    // The picker's option shape, so applyPickedGroups can name them.
    groupTargets: (restriction?.groupIds ?? []).map((id, index) => ({
      value: id,
      label: groupNames[index] ?? id,
      addedFields: { displayName: groupNames[index] ?? id },
    })),
  }
}

const PlatformSettings = ({ formControl, prefix = '', title, hasVersions, platform }) => {
  const field = (name) =>
    prefix ? `${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}` : name
  return (
    <>
      {title && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2">{title}</Typography>
        </Grid>
      )}
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Block platform"
          name={field('platformBlocked')}
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Block personally owned devices"
          name={field('personalDeviceEnrollmentBlocked')}
          formControl={formControl}
        />
      </Grid>
      {hasVersions && (
        <>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="textField"
              label="Minimum OS version"
              name={field('osMinimumVersion')}
              formControl={formControl}
              placeholder={versionHint[platform]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="textField"
              label="Maximum OS version"
              name={field('osMaximumVersion')}
              formControl={formControl}
              placeholder={versionHint[platform]}
            />
          </Grid>
        </>
      )}
    </>
  )
}

// The fields of one enrollment (device type) restriction, shared by the add/edit drawer and the
// template pages. With groupTenant set, groups are picked from that tenant (submit through
// applyPickedGroups); otherwise they are entered as names, which resolve in every tenant.
// platformOptions narrows the platforms offered, as each platform tab does.
const CippEnrollmentRestrictionForm = ({
  formControl,
  editing = false,
  groupTenant,
  platformOptions = enrollmentRestrictionPlatformOptions,
}) => (
  <Grid container spacing={2}>
    <CippFormComponent type="hidden" name="GUID" formControl={formControl} />

    <Grid size={{ xs: 12 }}>
      <CippFormComponent
        type="radio"
        row
        name="platform"
        label="Platform"
        options={platformOptions}
        formControl={formControl}
        disabled={editing}
        validators={{ required: 'Select a platform' }}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <CippFormComponent
        type="textField"
        label="Name"
        name="displayName"
        formControl={formControl}
        required
        validators={{
          required: 'A name is required',
          validate: (value) => (value ?? '').trim().length > 0 || 'A name is required',
        }}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <CippFormComponent
        type="number"
        label="Priority"
        name="priority"
        formControl={formControl}
        validators={{ min: { value: 1, message: 'Priority starts at 1' } }}
        helperText="1 is the highest. Leave blank to add it below the platform's existing restrictions. Deployments only apply this when they create the restriction."
      />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <CippFormComponent
        type="textField"
        label="Description"
        name="description"
        formControl={formControl}
        multiline
        rows={2}
      />
    </Grid>

    <Grid size={{ xs: 12 }}>
      <Divider sx={{ my: 1 }} />
      <Typography variant="h6">Platform settings</Typography>
    </Grid>
    <CippFormCondition
      formControl={formControl}
      field="platform"
      compareType="is"
      compareValue="android"
      clearOnHide={false}
    >
      <PlatformSettings
        formControl={formControl}
        title="Android Enterprise (work profile)"
        hasVersions
        platform="android"
      />
      <PlatformSettings
        formControl={formControl}
        prefix="deviceAdmin"
        title="Android device administrator"
        hasVersions
        platform="android"
      />
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          label="Blocked manufacturers (device administrator)"
          name="deviceAdminBlockedManufacturers"
          formControl={formControl}
          multiple
          creatable
          options={[]}
          helperText="Type a manufacturer name and press Enter, for example Samsung."
        />
      </Grid>
    </CippFormCondition>
    <CippFormCondition
      formControl={formControl}
      field="platform"
      compareType="is"
      compareValue="ios"
      clearOnHide={false}
    >
      <PlatformSettings formControl={formControl} hasVersions platform="ios" />
    </CippFormCondition>
    <CippFormCondition
      formControl={formControl}
      field="platform"
      compareType="is"
      compareValue="windows"
      clearOnHide={false}
    >
      <PlatformSettings formControl={formControl} hasVersions platform="windows" />
    </CippFormCondition>
    <CippFormCondition
      formControl={formControl}
      field="platform"
      compareType="is"
      compareValue="macOS"
      clearOnHide={false}
    >
      <PlatformSettings formControl={formControl} hasVersions={false} platform="macOS" />
      <Grid size={{ xs: 12 }}>
        <Alert severity="info">Intune has no OS version limits for macOS restrictions.</Alert>
      </Grid>
    </CippFormCondition>

    <Grid size={{ xs: 12 }}>
      <Divider sx={{ my: 1 }} />
      <Typography variant="h6">Assignment</Typography>
    </Grid>
    <Grid size={{ xs: 12 }}>
      <CippFormComponent
        type="radio"
        name="AssignTo"
        label="Who should this restriction apply to?"
        options={assignToOptions}
        formControl={formControl}
      />
    </Grid>
    <CippFormCondition
      formControl={formControl}
      field="AssignTo"
      compareType="is"
      compareValue="customGroup"
    >
      <Grid size={{ xs: 12 }}>
        {groupTenant ? (
          <CippFormComponent
            {...getGroupPickerField(groupTenant, 'groupTargets', 'Group(s)', true)}
            formControl={formControl}
          />
        ) : (
          <CippFormComponent
            type="textField"
            label="Custom Group Names separated by comma. Wildcards (*) are allowed"
            name="customGroup"
            formControl={formControl}
            validators={{ required: 'Please specify custom group names' }}
          />
        )}
      </Grid>
    </CippFormCondition>
  </Grid>
)

export default CippEnrollmentRestrictionForm
