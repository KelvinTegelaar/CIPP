import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Delete } from '@mui/icons-material'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import { CippTenantAllowBlockListTemplateDrawer } from '../../../../components/CippComponents/CippTenantAllowBlockListTemplateDrawer.jsx'

const Page = () => {
  const pageTitle = 'Tenant Allow/Block List Templates'

  const actions = [
    {
      label: 'Delete Template',
      type: 'POST',
      url: '/api/RemoveTenantAllowBlockListTemplate',
      data: { ID: 'GUID' },
      confirmText: 'Do you want to delete this template?',
      multiPost: false,
      icon: <Delete />,
      color: 'danger',
    },
  ]

  const offCanvas = {
    children: (row) => <CippJsonView object={row} defaultOpen={true} />,
    size: 'lg',
  }

  const simpleColumns = [
    'templateName',
    'entries',
    'listType',
    'listMethod',
    'notes',
    'NoExpiration',
    'RemoveAfter',
  ]

  return (
    <CippTablePage
      title={pageTitle}
      tenantInTitle={false}
      apiUrl="/api/ListTenantAllowBlockListTemplates"
      queryKey="ListTenantAllowBlockListTemplates"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <CippTenantAllowBlockListTemplateDrawer />
      }
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
