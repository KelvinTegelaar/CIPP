import { useState } from 'react'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Delete, Edit } from '@mui/icons-material'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import { CippTenantAllowBlockListTemplateDrawer } from '../../../../components/CippComponents/CippTenantAllowBlockListTemplateDrawer.jsx'

const Page = () => {
  const pageTitle = 'Tenant Allow/Block List Templates'
  const [editDrawerVisible, setEditDrawerVisible] = useState(false)
  const [editData, setEditData] = useState(null)

  const actions = [
    {
      label: 'Edit Template',
      noConfirm: true,
      customFunction: (row) => {
        setEditData(row)
        setEditDrawerVisible(true)
      },
      icon: <Edit />,
      color: 'primary',
    },
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
    <>
      <CippTablePage
        title={pageTitle}
        tenantInTitle={false}
        apiUrl="/api/ListTenantAllowBlockListTemplates"
        queryKey="ListTenantAllowBlockListTemplates"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        cardButton={<CippTenantAllowBlockListTemplateDrawer />}
      />
      <CippTenantAllowBlockListTemplateDrawer
        editData={editData}
        drawerVisible={editDrawerVisible}
        setDrawerVisible={(visible) => {
          setEditDrawerVisible(visible)
          if (!visible) setEditData(null)
        }}
      />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
