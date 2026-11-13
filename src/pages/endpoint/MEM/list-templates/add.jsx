import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import CippIntuneSettingsEditor from '../../../../components/CippComponents/CippIntuneSettingsEditor'
import { CippIntunePolicySettingsCard } from '../../../../components/CippComponents/CippIntunePolicySettingsCard'
import { CippApiResults } from '../../../../components/CippComponents/CippApiResults'
import { ApiGetCall, ApiPostCall } from '../../../../api/ApiCall'
import { useIntunePolicyEditor } from '../../../../hooks/use-intune-policy-editor'
import { defaultValueForLeaf } from '../../../../utils/intune-template-leaves'

const PLATFORM_OPTIONS = [
  { label: 'Windows 10 and later', value: 'windows10' },
  { label: 'macOS', value: 'macOS' },
  { label: 'iOS/iPadOS', value: 'iOS' },
  { label: 'Android Enterprise', value: 'androidEnterprise' },
  { label: 'Android (AOSP)', value: 'aosp' },
  { label: 'Linux', value: 'linux' },
]

const TECHNOLOGY_OPTIONS = [
  { label: 'MDM', value: 'mdm' },
  { label: 'MDM + Security settings management', value: 'mdm,microsoftSense' },
  { label: 'Configuration Manager', value: 'configManager' },
  { label: 'Apple Remote Management', value: 'mdm,appleRemoteManagement' },
  { label: 'Linux MDM', value: 'linuxMdm' },
]

const CATALOG_OPTION = { label: 'Settings catalog', value: '' }

const AddIntuneTemplate = () => {
  const router = useRouter()
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      displayName: '',
      description: '',
      platform: PLATFORM_OPTIONS[0],
      technology: TECHNOLOGY_OPTIONS[0],
      baseTemplate: CATALOG_OPTION,
    },
  })

  const [policy, setPolicy] = useState({ settings: [] })
  const platform = formControl.watch('platform')?.value

  // Endpoint security profiles are catalog policies on a template; some settings exist only there.
  const templateIndex = ApiGetCall({
    url: '/intune-templates/index.json',
    queryKey: 'IntunePolicyTemplateIndex',
  })
  const endpointSecurityTemplates = (
    Array.isArray(templateIndex.data) ? templateIndex.data : []
  ).filter(
    (template) =>
      template.lifecycleState === 'active' &&
      template.templateFamily?.startsWith('endpointSecurity') &&
      template.platforms === platform
  )
  const baseTemplateId = formControl.watch('baseTemplate')?.value
  const baseTemplate = endpointSecurityTemplates.find(
    (template) => template.id === baseTemplateId
  )
  const technology =
    baseTemplate?.technologies ?? formControl.watch('technology')?.value

  useEffect(() => {
    setPolicy(({ templateReference, ...current }) =>
      baseTemplate
        ? {
            ...current,
            templateReference: {
              templateId: baseTemplate.id,
              templateFamily: baseTemplate.templateFamily,
              templateDisplayName: baseTemplate.displayName,
              templateDisplayVersion: baseTemplate.displayVersion,
            },
          }
        : current
    )
    if (baseTemplate)
      formControl.setValue(
        'technology',
        TECHNOLOGY_OPTIONS.find(
          (option) => option.value === baseTemplate.technologies
        ) ?? {
          label: baseTemplate.technologies,
          value: baseTemplate.technologies,
        }
      )
  }, [baseTemplate?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const editor = useIntunePolicyEditor({ policy, setPolicy, formControl })
  const {
    structureRevision,
    definitionsLoading,
    definitionsError,
    leaves,
    foldValuesIntoPolicy,
  } = editor

  // Rebuilt whenever the settings change; the template's own fields are carried across.
  useEffect(() => {
    if (definitionsLoading) return
    const current = formControl.getValues()
    formControl.reset({
      displayName: current.displayName ?? '',
      description: current.description ?? '',
      platform: current.platform ?? PLATFORM_OPTIONS[0],
      technology: current.technology ?? TECHNOLOGY_OPTIONS[0],
      baseTemplate: current.baseTemplate ?? CATALOG_OPTION,
      settingValues: leaves.map(defaultValueForLeaf),
    })
  }, [leaves, definitionsLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const buildPolicy = () => {
    const values = formControl.getValues()
    return {
      ...foldValuesIntoPolicy(),
      name: values.displayName,
      description: values.description ?? '',
      platforms: platform,
      technologies: technology,
    }
  }

  const validateCall = ApiPostCall({})
  const handleValidate = () =>
    validateCall.mutate({
      url: '/api/ExecValidateIntuneTemplate',
      data: {
        RAWJson: JSON.stringify(buildPolicy()),
        TemplateType: 'Catalog',
        displayName: formControl.getValues().displayName,
      },
    })

  const settings = policy.settings ?? []

  return (
    <CippFormPage
      title="New Endpoint Manager Template"
      formControl={formControl}
      queryKey={['ListIntuneTemplates-table', 'Available Endpoint Manager']}
      backButtonTitle="Intune Templates"
      postUrl="/api/AddIntuneTemplate"
      allowResubmit={structureRevision > 0}
      customDataformatter={(values) => ({
        displayName: values.displayName,
        description: values.description,
        TemplateType: 'Catalog',
        RawJSON: JSON.stringify(buildPolicy()),
      })}
      onSubmitResult={(result) => {
        if (result?.GUID)
          router.push(`/endpoint/MEM/list-templates/edit?id=${result.GUID}`)
      }}
      formPageType="Add"
    >
      <Stack spacing={3} sx={{ my: 2 }}>
        <Card variant="outlined">
          <CardHeader
            title="Template details"
            slotProps={{ title: { variant: 'h6' } }}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="textField"
                  label="Template Name"
                  name="displayName"
                  formControl={formControl}
                  validators={{
                    required: {
                      value: true,
                      message: 'A template name is required',
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="textField"
                  label="Description"
                  name="description"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="autoComplete"
                  label="Platform"
                  name="platform"
                  multiple={false}
                  creatable={false}
                  options={PLATFORM_OPTIONS}
                  formControl={formControl}
                  disabled={settings.length > 0 || !!baseTemplate}
                  validators={{
                    validate: (value) => !!value?.value || 'Pick a platform',
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="autoComplete"
                  label="Technology"
                  name="technology"
                  multiple={false}
                  creatable={false}
                  options={TECHNOLOGY_OPTIONS}
                  formControl={formControl}
                  disabled={settings.length > 0 || !!baseTemplate}
                  validators={{
                    validate: (value) => !!value?.value || 'Pick a technology',
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="autoComplete"
                  label="Start from"
                  name="baseTemplate"
                  multiple={false}
                  creatable={false}
                  disableClearable
                  options={[
                    CATALOG_OPTION,
                    ...endpointSecurityTemplates.map((template) => ({
                      label: `Endpoint security: ${template.displayName}`,
                      value: template.id,
                    })),
                  ]}
                  formControl={formControl}
                  disabled={settings.length > 0}
                  helperText="Endpoint security profiles include settings the settings catalog does not, such as per-rule ASR exclusions."
                />
              </Grid>
            </Grid>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleValidate}
                  disabled={validateCall.isPending || settings.length === 0}
                >
                  {validateCall.isPending ? 'Checking…' : 'Validate template'}
                </Button>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', ml: 2 }}
                >
                  Checks this template for anything that would stop it
                  deploying. Nothing is saved.
                </Typography>
              </Box>
              <CippApiResults apiObject={validateCall} />
            </Stack>
          </CardContent>
        </Card>

        <CippIntunePolicySettingsCard
          policy={policy}
          editor={editor}
          platform={platform}
          technology={technology}
          emptyText="No settings yet. Use “Add setting” to search the setting catalog for this platform."
        />

        {settings.length > 0 && (
          <Card variant="outlined">
            <CardHeader
              title="Setting values"
              slotProps={{ title: { variant: 'h6' } }}
            />
            <CardContent>
              {definitionsLoading ? (
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center' }}
                >
                  <CircularProgress size={18} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Resolving setting names and available values…
                  </Typography>
                </Stack>
              ) : (
                <>
                  {definitionsError && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      The Intune setting catalog could not be loaded, so
                      settings are shown by their definition ID. Values you
                      change are still saved correctly.
                    </Alert>
                  )}
                  <CippIntuneSettingsEditor
                    leaves={leaves}
                    formControl={formControl}
                    fieldPrefix="settingValues"
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}
      </Stack>
    </CippFormPage>
  )
}

AddIntuneTemplate.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default AddIntuneTemplate
