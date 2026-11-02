import { Button } from '@mui/material'
import { Stack } from '@mui/system'
import Link from 'next/link'
import { CippIcons } from '../../../../utils/icon-registry'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippEnrollmentRestrictionDeployDrawer } from '../../../../components/CippComponents/CippEnrollmentRestrictionDeployDrawer.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { useState } from 'react'

const platformLabels = {
  android: 'Android',
  ios: 'iOS/iPadOS',
  macOS: 'macOS',
  windows: 'Windows',
}
const assignmentLabel = (template) =>
  template.AssignTo === 'allLicensedUsers'
    ? 'All Licensed Users'
    : template.AssignTo === 'customGroup'
      ? template.customGroup
      : 'Not assigned'

const Page = () => {
  const pageTitle = 'Enrollment Restriction Templates'
  const [deployDrawerOpen, setDeployDrawerOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)

  const handleDeployTemplate = (row) => {
    setSelectedTemplateId(row.GUID)
    setDeployDrawerOpen(true)
  }

  const actions = [
    {
      label: 'Deploy Template',
      customFunction: handleDeployTemplate,
      noConfirm: true,
      icon: <CippIcons.RocketLaunch />,
      color: 'success',
    },
    {
      label: 'Edit Template',
      pinned: true,
      icon: <CippIcons.Edit />,
      link: '/endpoint/autopilot/enrollment-restriction-templates/edit?id=[GUID]',
    },
    {
      label: 'Delete Template',
      type: 'POST',
      url: '/api/RemoveEnrollmentRestrictionTemplate',
      icon: <CippIcons.Delete />,
      data: { ID: 'GUID' },
      confirmText:
        'Delete the template "[displayName]"? Restrictions already deployed from it are not changed.',
      color: 'danger',
      multiPost: false,
    },
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListEnrollmentRestrictionTemplates"
        queryKey="ListEnrollmentRestrictionTemplates"
        tenantInTitle={false}
        actions={actions}
        dataMap={(template) => ({
          ...template,
          platformLabel: platformLabels[template.platform] ?? template.platform,
          PolicyAssignment: assignmentLabel(template),
        })}
        offCanvas={{
          extendedInfoFields: [
            'displayName',
            'description',
            'platformLabel',
            'priority',
            'PolicyAssignment',
            'GUID',
          ],
          actions,
        }}
        simpleColumns={[
          'platformLabel',
          'displayName',
          'description',
          'priority',
          'PolicyAssignment',
        ]}
        cardButton={
          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              href="/endpoint/autopilot/enrollment-restriction-templates/add"
              startIcon={<CippIcons.AddBox />}
            >
              Add Template
            </Button>
            <CippEnrollmentRestrictionDeployDrawer />
          </Stack>
        }
      />
      <CippEnrollmentRestrictionDeployDrawer
        open={deployDrawerOpen}
        onClose={() => setDeployDrawerOpen(false)}
        templateId={selectedTemplateId}
      />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
