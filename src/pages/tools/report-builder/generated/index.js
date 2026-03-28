import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { Delete } from '@mui/icons-material'
import { useSettings } from '../../../../hooks/use-settings'
import tabOptions from '../tabOptions.json'

const Page = () => {
  const { currentTenant } = useSettings()

  const actions = [
    {
      label: 'Delete',
      type: 'POST',
      url: '/api/ExecGenerateReportBuilderReport',
      data: { Action: 'delete', ReportGUID: 'RowKey' },
      confirmText: 'Are you sure you want to delete this generated report?',
      icon: <Delete />,
      multiPost: false,
    },
  ]

  const offCanvas = {
    extendedInfoFields: ['TemplateName', 'TenantFilter', 'GeneratedAt', 'Status'],
    actions,
  }

  return (
    <CippTablePage
      title="Generated Reports"
      tenantInTitle={false}
      apiUrl="/api/ListGeneratedReports"
      apiData={{ TenantFilter: currentTenant }}
      queryKey={`${currentTenant}-ListGeneratedReports`}
      simpleColumns={['TemplateName', 'TenantFilter', 'GeneratedAt', 'Status', 'Sections']}
      actions={actions}
      offCanvas={offCanvas}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
