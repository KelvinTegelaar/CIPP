import { Button } from '@mui/material'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Add, Delete, OpenInNew } from '@mui/icons-material'
import { useRouter } from 'next/router'
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
        <Button
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={() => router.push('/tools/report-builder/builder')}
        >
          New Report
        </Button>
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
