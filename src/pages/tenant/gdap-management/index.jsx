import { TabbedLayout } from '../../../layouts/TabbedLayout'
import { CippIcons } from '../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../layouts/index'
import tabOptions from './tabOptions'
import { Container } from '@mui/system'
import { Grid } from '@mui/system'
import { CippInfoBar } from '../../../components/CippCards/CippInfoBar'
import { ApiPostCall, ApiGetCallWithPagination } from '../../../api/ApiCall'
import CippPermissionCheck from '../../../components/CippSettings/CippPermissionCheck'
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'
import CippButtonCard from '../../../components/CippCards/CippButtonCard'
import { WizardSteps } from '../../../components/CippWizard/wizard-steps'
import Link from 'next/link'
import { CippHead } from '../../../components/CippComponents/CippHead'
import { usePermissions } from '../../../hooks/use-permissions'

const Page = () => {
  const [createDefaults, setCreateDefaults] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const { checkPermissions } = usePermissions()
  const canViewGdapChecks = checkPermissions(['CIPP.AppSettings.Read'])

  const relationships = ApiGetCallWithPagination({
    url: '/api/ListGDAPRelationships',
    queryKey: 'ListGDAPRelationships',
    waiting: true,
  })

  const mappedRoles = ApiGetCallWithPagination({
    url: '/api/ListGDAPRoles',
    queryKey: 'ListGDAPRoles',
    waiting: true,
  })

  const roleTemplates = ApiGetCallWithPagination({
    url: '/api/ExecGDAPRoleTemplate',
    queryKey: 'ListGDAPRoleTemplates',
    waiting: true,
  })

  const pendingInvites = ApiGetCallWithPagination({
    url: '/api/ListGDAPInvite',
    queryKey: 'ListGDAPInvite',
    waiting: true,
  })

  const createCippDefaults = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ['ListGDAPRoleTemplates', 'ListGDAPRoles'],
  })

  useEffect(() => {
    if (roleTemplates.isSuccess) {
      var promptCreateDefaults = true
      // check templates for CIPP Defaults
      const firstPageResults = roleTemplates?.data?.pages?.[0]?.Results
      if (
        firstPageResults &&
        Array.isArray(firstPageResults) &&
        firstPageResults.length > 0 &&
        firstPageResults.find((t) => t?.TemplateId === 'CIPP Defaults')
      ) {
        promptCreateDefaults = false
      }
      setCreateDefaults(promptCreateDefaults)
    }
  }, [roleTemplates])

  useEffect(() => {
    if (roleTemplates.isSuccess && pendingInvites.isSuccess) {
      const roleTemplatesFirstPage = roleTemplates?.data?.pages?.[0]?.Results
      const hasTemplates =
        Array.isArray(roleTemplatesFirstPage) && roleTemplatesFirstPage.length > 0
      if (!hasTemplates) {
        setActiveStep(0)
        return
      }

      const pendingInvitesFirstPage = pendingInvites?.data?.pages?.[0]
      const hasInvites =
        Array.isArray(pendingInvitesFirstPage) && pendingInvitesFirstPage.length > 0
      setActiveStep(hasInvites ? 2 : 1)
    }
  }, [
    relationships.isSuccess,
    mappedRoles.isSuccess,
    roleTemplates.isSuccess,
    roleTemplates.isFetching,
    pendingInvites.isSuccess,
  ])

  return (
    <Container
      sx={{
        flexGrow: 1,
        py: 2,
      }}
      maxWidth={false}
    >
      <CippHead title="GDAP Overview" />
      <Grid container spacing={2}>
        <Grid size={12}>
          <CippInfoBar
            isFetching={
              relationships.isFetching ||
              mappedRoles.isFetching ||
              roleTemplates.isFetching ||
              pendingInvites.isFetching
            }
            data={[
              {
                icon: <CippIcons.SupervisorAccount />,
                data:
                  relationships.data?.pages
                    ?.map((page) => page?.Results?.length || 0)
                    .reduce((a, b) => (a || 0) + (b || 0), 0) ?? 0,
                name: 'GDAP Relationships',
                color: 'secondary',
              },
              {
                icon: <CippIcons.AdminPanelSettings />,
                data:
                  mappedRoles.data?.pages
                    ?.map((page) => page?.length || 0)
                    .reduce((a, b) => (a || 0) + (b || 0), 0) ?? 0,
                name: 'Mapped Admin Roles',
                color: 'green',
              },
              {
                icon: <CippIcons.Layers />,
                data:
                  roleTemplates.data?.pages
                    ?.map((page) => page?.Results?.length || 0)
                    .reduce((a, b) => (a || 0) + (b || 0), 0) ?? 0,
                name: 'Role Templates',
              },
              {
                icon: <CippIcons.HourglassBottom />,
                data:
                  pendingInvites.data?.pages
                    ?.map((page) => page?.length || 0)
                    .reduce((a, b) => (a || 0) + (b || 0), 0) ?? 0,
                name: 'Pending Invites',
              },
            ]}
          />
        </Grid>
        <Grid size={12}>
          <Button
            LinkComponent={Link}
            href="/onboardingv2?selectedOption=AddTenant"
            startIcon={<CippIcons.Add />}
            variant="contained"
          >
            Add a Tenant
          </Button>
        </Grid>
        {canViewGdapChecks && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CippButtonCard
                title="GDAP Setup"
                cardSx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}
              >
                <WizardSteps
                  activeStep={activeStep}
                  orientation="vertical"
                  steps={[
                    {
                      title: 'Create a role template',
                      description:
                        'Pick the admin roles your technicians need. CIPP maps each one to a security group in your partner tenant.',
                    },
                    {
                      title: 'Create invites',
                      description: 'Create invites based on your Role Templates.',
                    },
                    {
                      title: 'Setup complete',
                      description: "You're ready to start adding your tenants using CIPP.",
                    },
                  ]}
                />
              </CippButtonCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CippPermissionCheck type="GDAP" />
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
