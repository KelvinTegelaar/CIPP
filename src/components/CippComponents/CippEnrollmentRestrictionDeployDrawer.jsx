import { useEffect, useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { Alert, Button, Stack } from '@mui/material'
import { useForm, useFormState, useWatch } from 'react-hook-form'
import { CippOffCanvas } from './CippOffCanvas'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import CippFormComponent from './CippFormComponent'
import CippJsonView from '../CippFormPages/CippJSONView'
import { CippApiResults } from './CippApiResults'
import { CippFormTenantSelector } from './CippFormTenantSelector'
import { CippFormCondition } from './CippFormCondition'

const platformLabels = {
  android: 'Android',
  ios: 'iOS/iPadOS',
  macOS: 'macOS',
  windows: 'Windows',
}

// The group handling choices and values of CippCADeployDrawer. Restrictions have no exclusions,
// so AllUsers simply assigns all users.
const replaceNameOptions = [
  { value: 'leave', label: 'Leave the groups and users as is' },
  { value: 'displayName', label: 'Replace by display name' },
  { value: 'AllUsers', label: 'Apply to all users' },
]
const defaultValues = { replacename: 'displayName' }

const assignmentSummary = (template, replaceName, createGroups) => {
  if (replaceName === 'leave') {
    return "An existing restriction's assignment is left as it is; a new one is not assigned."
  }
  if (replaceName === 'AllUsers' || template.AssignTo === 'allLicensedUsers') {
    return 'It is assigned to all users.'
  }
  if (template.AssignTo === 'customGroup') {
    return createGroups
      ? `It is assigned to groups matching: ${template.customGroup}. A named group the tenant does not have is created first, from the group template of that name if there is one; a name with a wildcard is not created.`
      : `It is assigned to groups matching: ${template.customGroup}. A tenant with no matching group reports a failed assignment.`
  }
  return 'The template has no assignment, so the restriction is left as it is.'
}

// What deploying the template does in each tenant, in the order AddEnrollmentRestriction does it.
const deploySummary = (template, replaceName, createGroups) =>
  [
    'An existing restriction with the same name and platform is updated; otherwise one is created.',
    template.priority
      ? `A new restriction gets priority ${template.priority}, moving the tenant's others on that platform down.`
      : "A new restriction is added below the tenant's existing ones on that platform.",
    assignmentSummary(template, replaceName, createGroups),
  ].join(' ')

// Deploys a saved enrollment restriction template to tenants, as CippCADeployDrawer does for
// conditional access. With templateId the template is preselected and fixed; open and onClose
// let a table action control the drawer instead of its own button.
export const CippEnrollmentRestrictionDeployDrawer = ({
  buttonText = 'Deploy Template',
  templateId = null,
  open = null,
  onClose = null,
}) => {
  const [internalDrawerVisible, setInternalDrawerVisible] = useState(false)
  const formControl = useForm({ mode: 'onChange', defaultValues })
  const { isValid } = useFormState({ control: formControl.control })
  // Its own query key: the template table on the same page caches this endpoint under
  // ListEnrollmentRestrictionTemplates in its paged shape, not as the plain array read here.
  const templates = ApiGetCall({
    url: '/api/ListEnrollmentRestrictionTemplates',
    queryKey: 'EnrollmentRestrictionTemplates',
  })
  const templateList = useMemo(
    () => (Array.isArray(templates.data) ? templates.data : []),
    [templates.data]
  )
  const selected = useWatch({
    control: formControl.control,
    name: 'TemplateList',
  })
  const template = templateList.find((item) => item.GUID === selected?.value)
  const replaceName = useWatch({
    control: formControl.control,
    name: 'replacename',
  })
  const createGroups = useWatch({
    control: formControl.control,
    name: 'CreateGroups',
  })

  const drawerVisible = open !== null ? open : internalDrawerVisible
  const isExternallyControlled = open !== null && onClose !== null

  useEffect(() => {
    if (templateId && templates.isSuccess) {
      const preselected = templateList.find((item) => item.GUID === templateId)
      if (preselected) {
        formControl.setValue(
          'TemplateList',
          { value: templateId, label: preselected.displayName },
          { shouldValidate: true }
        )
      }
    }
  }, [
    templateId,
    templates.isSuccess,
    templateList,
    formControl,
    drawerVisible,
  ])

  const deployTemplate = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ['EnrollmentRestrictions*'],
  })

  const handleSubmit = () => {
    deployTemplate.mutate({
      url: '/api/AddEnrollmentRestriction',
      relatedQueryKeys: ['EnrollmentRestrictions*'],
      data: formControl.getValues(),
    })
  }

  const handleCloseDrawer = () => {
    if (isExternallyControlled) {
      onClose()
    } else {
      setInternalDrawerVisible(false)
    }
    formControl.reset(defaultValues)
    deployTemplate.reset()
  }

  return (
    <>
      {!isExternallyControlled && (
        <Button
          onClick={() => setInternalDrawerVisible(true)}
          startIcon={<CippIcons.RocketLaunch />}
        >
          {buttonText}
        </Button>
      )}
      <CippOffCanvas
        title="Deploy Enrollment Restriction Template"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={deployTemplate} />
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: 'flex-start' }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={deployTemplate.isLoading || !isValid}
              >
                {deployTemplate.isLoading
                  ? 'Deploying...'
                  : deployTemplate.isSuccess
                    ? 'Redeploy Template'
                    : 'Deploy Template'}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </Stack>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <CippFormTenantSelector
            label="Select Tenants"
            formControl={formControl}
            name="selectedTenants"
            type="multiple"
            allTenants={true}
            preselectedEnabled={true}
            validators={{ required: 'At least one tenant must be selected' }}
          />

          <CippFormComponent
            type="autoComplete"
            name="TemplateList"
            label={templateId ? 'Selected Template' : 'Choose a template'}
            isFetching={templates.isLoading}
            multiple={false}
            creatable={false}
            formControl={formControl}
            disabled={!!templateId}
            validators={{ required: 'Choose a template' }}
            options={
              templates.isSuccess
                ? templateList.map((item) => ({
                    label: `${item.displayName} (${platformLabels[item.platform] ?? item.platform})`,
                    value: item.GUID,
                  }))
                : []
            }
          />

          <CippFormComponent
            type="radio"
            name="replacename"
            label="How should groups and users be handled?"
            formControl={formControl}
            options={replaceNameOptions}
          />

          <CippFormCondition
            formControl={formControl}
            field="replacename"
            compareType="is"
            compareValue="displayName"
            action="disable"
          >
            <CippFormComponent
              type="switch"
              name="CreateGroups"
              label="Create groups if they do not exist"
              formControl={formControl}
              helperText={
                replaceName !== 'displayName'
                  ? "Select 'Replace by display name' to create groups specified in the template."
                  : 'Enable this option to create groups that do not exist in the tenant.'
              }
            />
          </CippFormCondition>

          {template && (
            <Alert severity="info">
              {deploySummary(
                template,
                replaceName,
                replaceName === 'displayName' && createGroups
              )}
            </Alert>
          )}
          {template && <CippJsonView object={template} />}
        </Stack>
      </CippOffCanvas>
    </>
  )
}
