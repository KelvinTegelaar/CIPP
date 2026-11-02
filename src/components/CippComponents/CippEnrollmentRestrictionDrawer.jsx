import { useEffect, useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { Alert, Button, Divider } from '@mui/material'
import { Grid } from '@mui/system'
import { useForm, useWatch, useFormState } from 'react-hook-form'
import { CippOffCanvas } from './CippOffCanvas'
import { CippFormTenantSelector } from './CippFormTenantSelector'
import { CippApiResults } from './CippApiResults'
import { ApiPostCall } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings'
import { applyPickedGroups } from './CippIntunePolicyActions'
import CippEnrollmentRestrictionForm, {
  enrollmentRestrictionDefaults,
  enrollmentRestrictionPlatformOptions,
  enrollmentRestrictionToForm,
} from '../CippFormPages/CippEnrollmentRestrictionForm'

// Creates an enrollment restriction across tenants, or edits one restriction when given a row
// from ListEnrollmentRestrictions. In edit mode the table owns visibility. platforms limits the
// platforms offered on create, and the first one is preselected.
export const CippEnrollmentRestrictionDrawer = ({
  buttonText = 'Add Restriction',
  row,
  platforms,
  drawerVisible: controlledVisible,
  setDrawerVisible: setControlledVisible,
}) => {
  const editing = Boolean(row?.ids?.length)
  const currentTenant = useSettings().currentTenant
  const [localVisible, setLocalVisible] = useState(false)
  const drawerVisible = editing ? controlledVisible : localVisible
  const setDrawerVisible = editing ? setControlledVisible : setLocalVisible

  const platformOptions = useMemo(
    () =>
      platforms
        ? enrollmentRestrictionPlatformOptions.filter((option) => platforms.includes(option.value))
        : enrollmentRestrictionPlatformOptions,
    [platforms]
  )
  const defaultValues = useMemo(
    () => ({ ...enrollmentRestrictionDefaults, platform: platformOptions[0]?.value }),
    [platformOptions]
  )

  const formControl = useForm({ mode: 'onChange', defaultValues })
  const { isValid } = useFormState({ control: formControl.control })
  const selectedTenants = useWatch({ control: formControl.control, name: 'selectedTenants' })

  // Groups can only be picked from one tenant; across tenants they are entered as names.
  const singleCreateTenant =
    Array.isArray(selectedTenants) && selectedTenants.length === 1
      ? selectedTenants[0]?.value
      : undefined
  const groupTenant = editing ? currentTenant : singleCreateTenant

  const saveRestriction = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ['EnrollmentRestrictions*'],
  })

  useEffect(() => {
    if (editing && drawerVisible) {
      formControl.reset(enrollmentRestrictionToForm(row))
    }
  }, [editing, drawerVisible, row, formControl])

  // Picked groups belong to the tenant they were loaded from.
  useEffect(() => {
    if (!editing) {
      formControl.setValue('groupTargets', [])
    }
  }, [editing, groupTenant, formControl])

  const handleSubmit = () => {
    const formData = groupTenant
      ? applyPickedGroups(formControl.getValues())
      : formControl.getValues()
    const data = {
      ...formData,
      ...(editing ? { tenantFilter: currentTenant, ConfigurationIds: row.ids } : {}),
    }
    saveRestriction.mutate({
      url: '/api/AddEnrollmentRestriction',
      data,
      relatedQueryKeys: ['EnrollmentRestrictions*'],
    })
  }

  const handleCloseDrawer = () => {
    setDrawerVisible(false)
    formControl.reset(defaultValues)
  }

  return (
    <>
      {!editing && (
        <Button onClick={() => setDrawerVisible(true)} startIcon={<CippIcons.Add />}>
          {buttonText}
        </Button>
      )}
      <CippOffCanvas
        title={editing ? `Edit Restriction - ${row?.displayName}` : 'Add Enrollment Restriction'}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div>
            <CippApiResults apiObject={saveRestriction} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={saveRestriction.isLoading || !isValid}
              >
                {saveRestriction.isLoading
                  ? 'Saving...'
                  : editing
                    ? 'Save Restriction'
                    : 'Create Restriction'}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {editing ? (
              <Alert severity="info">Editing this restriction in {currentTenant}.</Alert>
            ) : (
              <CippFormTenantSelector
                label="Select Tenants"
                formControl={formControl}
                name="selectedTenants"
                type="multiple"
                allTenants={true}
                preselectedEnabled={true}
                validators={{ required: 'At least one tenant must be selected' }}
              />
            )}
          </Grid>
          {editing && row?.missingPlatformTypes?.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning">
                This restriction is missing its {row.missingPlatformTypes.join(', ')} part. Saving
                creates it.
              </Alert>
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippEnrollmentRestrictionForm
              formControl={formControl}
              editing={editing}
              groupTenant={groupTenant}
              platformOptions={editing ? enrollmentRestrictionPlatformOptions : platformOptions}
            />
          </Grid>
        </Grid>
      </CippOffCanvas>
    </>
  )
}
