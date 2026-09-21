import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { useSettings } from '../../../../hooks/use-settings'
import tabOptions from '../tabOptions.json'

const reportViewLink = '/tools/report-builder/view?id=[RowKey]'

const Page = () => {
  const settings = useSettings()
  const { currentTenant } = settings

  const actions = [
    {
      label: 'View Report',
      icon: <CippIcons.Launch />,
      link: reportViewLink,
      pinned: true,
      noConfirm: true,
    },
    {
      label: 'Delete',
      type: 'POST',
      url: '/api/ExecGenerateReportBuilderReport',
      data: { Action: 'delete', ReportGUID: 'RowKey' },
      confirmText: 'Are you sure you want to delete this generated report?',
      icon: <CippIcons.Delete />,
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
      queryKey={`${currentTenant}-ListGeneratedReports`}
      simpleColumns={['TemplateName', 'TenantFilter', 'GeneratedAt', 'Status', 'Sections']}
      actions={actions}
      offCanvas={offCanvas}
      rowOpen={{
        link: reportViewLink,
        condition: (row) => Boolean(row?.RowKey),
      }}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
