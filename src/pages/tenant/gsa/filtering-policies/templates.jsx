import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@mui/material'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import { CippIcons } from '../../../../utils/icon-registry'
import { ApiGetCall } from '../../../../api/ApiCall'
import { CippGSADeployTemplateDrawer } from '../../../../components/CippComponents/CippGSADeployTemplateDrawer'

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
      link: '/tenant/gsa/filtering-policies/template?GUID=[GUID]',
      pinned: true,
      icon: <CippIcons.Edit />,
      color: 'info',
    },
    {
      label: 'Delete Template',
      type: 'POST',
      url: '/api/RemoveGSAFilteringPolicyTemplate',
      data: { ID: 'GUID' },
      confirmText:
        'Delete the filtering policy template [name]? Policies already deployed to tenants are not removed.',
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
        'Save the filtering policy template [name] to the selected repository?',
      multiPost: false,
      condition: () =>
        integrations.isSuccess && integrations?.data?.GitHub?.Enabled,
    },
  ]
  return (
    <>
      <CippTablePage
        title="Filtering Policy Templates"
        tenantInTitle={false}
        apiUrl="/api/ListGSAFilteringPolicyTemplates"
        queryKey="ListGSAFilteringPolicyTemplates"
        actions={actions}
        offCanvas={{
          children: (row) => <CippJsonView object={row} defaultOpen={true} />,
          size: 'xl',
        }}
        simpleColumns={['name', 'action', 'description']}
        cardButton={
          <Button
            component={Link}
            href="/tenant/gsa/filtering-policies/template"
            startIcon={<CippIcons.Add />}
          >
            Add Template
          </Button>
        }
      />
      <CippGSADeployTemplateDrawer
        kind="filteringPolicy"
        open={!!deployTemplate}
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
