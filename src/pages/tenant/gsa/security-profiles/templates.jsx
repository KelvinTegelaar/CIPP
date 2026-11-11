import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Alert, Button, Stack } from '@mui/material'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippOffCanvas } from '../../../../components/CippComponents/CippOffCanvas'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { CippFormTenantSelector } from '../../../../components/CippComponents/CippFormTenantSelector'
import { CippApiResults } from '../../../../components/CippComponents/CippApiResults'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import { ApiGetCall, ApiPostCall } from '../../../../api/ApiCall'
import { CippIcons } from '../../../../utils/icon-registry'

const DeployDrawer = ({ template, onClose }) => {
  const formControl = useForm()
  const deploy = ApiPostCall({})
  const option = template
    ? { value: template.GUID, label: template.name }
    : null

  useEffect(() => {
    if (template) {
      formControl.reset({
        TemplateList: { value: template.GUID, label: template.name },
      })
      deploy.reset()
    }
  }, [template]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CippOffCanvas
      title="Deploy Security Profile"
      visible={!!template}
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
                deploy.mutate({
                  url: '/api/ExecDeployGSASecurityProfileTemplate',
                  data: values,
                })
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
        <Alert severity="info">
          Creates or updates this security profile and the filtering policies it
          links in each tenant, so they match the template. A security profile
          filters nothing until a Conditional Access policy uses it. Tenants
          without a Microsoft Entra Internet Access licence are left unchanged.
        </Alert>
        <CippFormTenantSelector
          formControl={formControl}
          name="tenantFilter"
          required={true}
          disableClearable={false}
          preselectedEnabled={false}
          allTenants={true}
          type="multiple"
        />
        <CippFormComponent
          type="autoComplete"
          name="TemplateList"
          label="Security profile template"
          options={option ? [option] : []}
          multiple={false}
          creatable={false}
          disabled
          formControl={formControl}
        />
      </Stack>
    </CippOffCanvas>
  )
}

const Page = () => {
  const [deployTemplate, setDeployTemplate] = useState(null)
  const integrations = ApiGetCall({
    url: '/api/ListExtensionsConfig',
    queryKey: 'Integrations',
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
  const actions = [
    {
      label: 'Deploy Template',
      customFunction: (row) => setDeployTemplate(row),
      noConfirm: true,
      icon: <CippIcons.RocketLaunch />,
      color: 'success',
    },
    {
      label: 'Edit Template',
      link: '/tenant/gsa/security-profiles/template?GUID=[GUID]',
      pinned: true,
      icon: <CippIcons.Edit />,
      color: 'info',
    },
    {
      label: 'Delete Template',
      type: 'POST',
      url: '/api/RemoveGSASecurityProfileTemplate',
      data: { ID: 'GUID' },
      confirmText:
        'Delete the security profile template [name]? Profiles already deployed to tenants are not removed.',
      icon: <CippIcons.Delete />,
      color: 'danger',
      multiPost: false,
    },
    {
      label: 'Save to GitHub',
      type: 'POST',
      url: '/api/ExecCommunityRepo',
      icon: <CippIcons.GitHub />,
      data: { Action: 'UploadTemplate', GUID: 'GUID' },
      fields: [
        {
          label: 'Repository',
          name: 'FullName',
          type: 'select',
          api: {
            url: '/api/ListCommunityRepos',
            data: { WriteAccess: true },
            queryKey: 'CommunityRepos-Write',
            dataKey: 'Results',
            valueField: 'FullName',
            labelField: 'FullName',
          },
          multiple: false,
          creatable: false,
          required: true,
          validators: {
            required: { value: true, message: 'This field is required' },
          },
        },
        {
          label: 'Commit Message',
          placeholder: 'Enter a commit message for adding this file to GitHub',
          name: 'Message',
          type: 'textField',
          multiline: true,
          required: true,
          rows: 4,
        },
      ],
      confirmText:
        'Save the security profile template [name] to the selected repository? The filtering policy templates it links are saved with it.',
      multiPost: false,
      condition: () =>
        integrations.isSuccess && integrations?.data?.GitHub?.Enabled,
    },
  ]

  return (
    <>
      <CippTablePage
        title="Security Profile Templates"
        tenantInTitle={false}
        apiUrl="/api/ListGSASecurityProfileTemplates"
        queryKey="ListGSASecurityProfileTemplates"
        actions={actions}
        offCanvas={{
          children: (row) => <CippJsonView object={row} defaultOpen={true} />,
          size: 'xl',
        }}
        simpleColumns={['name', 'priority', 'state', 'description']}
        cardButton={
          <Button
            component={Link}
            href="/tenant/gsa/security-profiles/template"
            startIcon={<CippIcons.Add />}
          >
            Add Template
          </Button>
        }
      />
      <DeployDrawer
        template={deployTemplate}
        onClose={() => setDeployTemplate(null)}
      />
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
