import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Button, Stack } from '@mui/material'
import { CippOffCanvas } from './CippOffCanvas'
import CippFormComponent from './CippFormComponent'
import { CippFormTenantSelector } from './CippFormTenantSelector'
import { CippApiResults } from './CippApiResults'
import { ApiPostCall } from '../../api/ApiCall'

const kinds = {
  securityProfile: {
    title: 'Deploy Security Profile',
    label: 'Security profile template',
    url: '/api/ExecDeployGSASecurityProfileTemplate',
    listUrl: '/api/ListGSASecurityProfileTemplates',
    info: 'Creates or updates this security profile and the filtering policies it links in each tenant, so they match the template. A security profile filters nothing until a Conditional Access policy uses it. Tenants without a Microsoft Entra Internet Access licence are left unchanged.',
  },
  filteringPolicy: {
    title: 'Deploy Filtering Policy',
    label: 'Filtering policy template',
    url: '/api/ExecDeployGSAFilteringPolicyTemplate',
    listUrl: '/api/ListGSAFilteringPolicyTemplates',
    info: 'Creates this filtering policy in each tenant, or brings the policy with the same name in line with the template. A filtering policy blocks or allows nothing until a security profile links it. Tenants without a Microsoft Entra Internet Access licence are left unchanged.',
  },
}

// template fixes the template (a templates page row); without it the template is picked and the
// selected tenant is preselected (a live tenant page).
export const CippGSADeployTemplateDrawer = ({
  kind,
  open,
  template,
  onClose,
}) => {
  const config = kinds[kind]
  const formControl = useForm()
  const deploy = ApiPostCall({ relatedQueryKeys: ['ListGSA*'] })
  const option = template
    ? { value: template.GUID, label: template.name }
    : null

  useEffect(() => {
    if (open) {
      formControl.reset({ ...formControl.getValues(), TemplateList: option })
      deploy.reset()
    }
  }, [open, template]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CippOffCanvas
      title={config.title}
      visible={open}
      onClose={onClose}
      size="lg"
      footer={
        <Stack spacing={2}>
          <CippApiResults apiObject={deploy} />
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              disabled={deploy.isPending}
              onClick={formControl.handleSubmit((values) =>
                deploy.mutate({ url: config.url, data: values })
              )}
            >
              {deploy.isPending ? 'Deploying...' : 'Deploy'}
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
          </Stack>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <Alert severity="info">{config.info}</Alert>
        <CippFormTenantSelector
          formControl={formControl}
          name="tenantFilter"
          required={true}
          disableClearable={false}
          preselectedEnabled={!template}
          allTenants={true}
          type="multiple"
        />
        {template ? (
          <CippFormComponent
            type="autoComplete"
            name="TemplateList"
            label={config.label}
            options={[option]}
            multiple={false}
            creatable={false}
            disabled
            formControl={formControl}
          />
        ) : (
          <CippFormComponent
            type="autoComplete"
            name="TemplateList"
            label={config.label}
            multiple={false}
            creatable={false}
            required
            validators={{ required: 'Choose a template' }}
            formControl={formControl}
            api={{
              url: config.listUrl,
              labelField: 'name',
              valueField: 'GUID',
              queryKey: `${config.listUrl.replace('/api/', '')}-deploy`,
              excludeTenantFilter: true,
            }}
          />
        )}
      </Stack>
    </CippOffCanvas>
  )
}

export default CippGSADeployTemplateDrawer
