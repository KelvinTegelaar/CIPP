import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippTablePage } from '../../../components/CippComponents/CippTablePage.jsx'
import { CippSharePointTemplateDeployDrawer } from '../../../components/CippComponents/CippSharePointTemplateDeployDrawer.jsx'
import { usePermissions } from '../../../hooks/use-permissions'
import { PermissionButton } from '../../../utils/permissions.js'
import { Edit, ContentCopy, Delete, Add } from '@mui/icons-material'
import { Stack } from '@mui/system'
import Link from 'next/link'

const Page = () => {
  const pageTitle = 'SharePoint Templates'
  const writePermissions = ['Sharepoint.Admin.ReadWrite']
  const { checkPermissions } = usePermissions()
  const canWrite = checkPermissions(writePermissions)

  const actions = [
    {
      label: 'Edit Template',
      icon: <Edit />,
      color: 'warning',
      link: '/teams-share/sharepoint-templates/add?template=[TemplateId]&name=[templateName]',
      condition: () => canWrite,
    },
    {
      label: 'Copy Template',
      icon: <ContentCopy />,
      color: 'info',
      link: '/teams-share/sharepoint-templates/add?template=[TemplateId]&copy=true&name=[templateName]',
      condition: () => canWrite,
    },
    {
      label: 'Delete Template',
      icon: <Delete />,
      color: 'danger',
      type: 'POST',
      url: '/api/ExecSharePointTemplate',
      data: {
        Action: 'Delete',
        TemplateId: 'TemplateId',
      },
      confirmText: 'Are you sure you want to delete [templateName]?',
      condition: () => canWrite,
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'templateName',
      'SiteTemplateCount',
      'LibraryCount',
      'CreatedBy',
      'UpdatedBy',
      'Timestamp',
    ],
    actions: actions,
  }

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListSharePointTemplates"
      queryKey="ListSharePointTemplates"
      tenantInTitle={false}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        'templateName',
        'SiteTemplateCount',
        'LibraryCount',
        'UpdatedBy',
        'Timestamp',
      ]}
      cardButton={
        <Stack direction="row" spacing={2}>
          <PermissionButton
            requiredPermissions={writePermissions}
            component={Link}
            href="/teams-share/sharepoint-templates/add"
            startIcon={<Add />}
          >
            Create New Template
          </PermissionButton>
          <CippSharePointTemplateDeployDrawer
            buttonText="Deploy Template"
            requiredPermissions={writePermissions}
            PermissionButton={PermissionButton}
          />
        </Stack>
      }
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
