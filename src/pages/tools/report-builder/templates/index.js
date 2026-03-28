import { Button, Box } from '@mui/material'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Add, Delete, OpenInNew, Upload } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { CippPolicyImportDrawer } from '../../../../components/CippComponents/CippPolicyImportDrawer.jsx'
import tabOptions from '../tabOptions.json'

const Page = () => {
  const router = useRouter()

  const actions = [
    {
      label: 'Open in Builder',
      icon: <OpenInNew />,
      noConfirm: true,
      customFunction: (row) => {
        router.push(`/tools/report-builder/builder?id=${row.GUID || row.RowKey}`)
      },
    },
    {
      label: 'Upload to Repository',
      type: 'POST',
      icon: <Upload />,
      url: '/api/ExecCommunityRepo',
      data: { Action: 'UploadTemplate', GUID: 'GUID' },
      fields: [
        {
          type: 'autoComplete',
          name: 'FullName',
          label: 'Select Repository',
          multiple: false,
          api: {
            url: '/api/ListCommunityRepos?WriteAccess=true',
            queryKey: 'CommunityRepos-Write',
            dataKey: 'Results',
            labelField: 'Name',
            valueField: 'FullName',
          },
        },
        {
          type: 'textField',
          name: 'Message',
          label: 'Commit Message',
          placeholder: 'Upload report builder template',
        },
      ],
      confirmText: 'Upload this template to a community repository?',
      relatedQueryKeys: ['ListReportBuilderTemplates'],
    },
    {
      label: 'Delete',
      type: 'POST',
      url: '/api/ExecReportBuilderTemplate',
      data: { Action: 'delete', GUID: 'RowKey' },
      confirmText: 'Are you sure you want to delete this template?',
      icon: <Delete />,
      multiPost: false,
      relatedQueryKeys: ['ListReportBuilderTemplates'],
    },
  ]

  const offCanvas = {
    extendedInfoFields: ['Name', 'CreatedAt', 'GUID'],
    actions,
  }

  return (
    <CippTablePage
      title="Templates"
      tenantInTitle={false}
      apiUrl="/api/ListReportBuilderTemplates"
      queryKey="ListReportBuilderTemplates"
      simpleColumns={['Name', 'Sections', 'TestCount', 'CustomCount']}
      actions={actions}
      offCanvas={offCanvas}
      cardButton={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<Add />}
            size="small"
            onClick={() => router.push('/tools/report-builder/builder')}
          >
            New Report
          </Button>
          <CippPolicyImportDrawer mode="ReportBuilder" buttonText="Browse Catalog" />
        </Box>
      }
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
