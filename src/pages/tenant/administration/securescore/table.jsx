import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import tabOptions from './tabOptions'
import CippTablePage from '../../../../components/CippComponents/CippTablePage'
import { useSecureScore } from '../../../../hooks/use-securescore'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import { Alert, Box, Button, Container } from '@mui/material'
import { getCippError } from '../../../../utils/get-cipp-error'
import { useSettings } from '../../../../hooks/use-settings'
import { AllTenantsSecureScoreControlsTable } from '../../../../components/CippAllTenants/AllTenantsSecureScore'
import { isMultiTenant } from '../../../../utils/tenant-selection'
const Page = () => {
  const secureScore = useSecureScore()
  const currentTenant = useSettings().currentTenant

  if (isMultiTenant(currentTenant)) {
    return (
      <Container
        sx={{
          flexGrow: 1,
          py: 2,
        }}
        maxWidth={false}
      >
        <AllTenantsSecureScoreControlsTable />
      </Container>
    )
  }

  if (secureScore.isError) {
    return (
      <Container
        sx={{
          flexGrow: 1,
          py: 2,
        }}
        maxWidth={false}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {secureScore.controls}
        </Box>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={secureScore.refetch}>
              Retry
            </Button>
          }
        >
          Could not load Secure Score: {getCippError(secureScore.error)}
          {!secureScore.cached && ' Switch to Cached to see the last synced data.'}
        </Alert>
        {secureScore.syncDialog}
      </Container>
    )
  }

  return (
    <>
      <Container
        sx={{
          flexGrow: 1,
          py: 2,
        }}
        maxWidth={false}
      >
        <CippInfoBar
          isFetching={secureScore.isFetching}
          data={[
            {
              icon: <CippIcons.CheckCircleIcon />,
              data: secureScore.translatedData.percentageCurrent + '%',
              name: 'Current Score',
              color: 'secondary',
            },
            {
              icon: <CippIcons.GlobeAltIcon />,
              data: secureScore.translatedData.percentageVsAllTenants + '%',
              name: 'Compared score (All Tenants)',
              color: 'green',
            },
            {
              icon: <CippIcons.Map />,
              data: secureScore.translatedData.percentageVsSimilar + '%',
              name: 'Compared score (Similar Tenants)',
            },
            {
              icon: <CippIcons.Score />,
              data: `${secureScore.translatedData.currentScore} of ${secureScore.translatedData.maxScore}`,
              name: 'Score in points',
            },
          ]}
        />
      </Container>
      <CippTablePage
        title="Secure Score"
        cardButton={secureScore.controls}
        data={secureScore.translatedData.controlScores}
        simpleColumns={['title', 'tier', 'actionUrl', 'userImpact', 'threats']}
      />
      {secureScore.syncDialog}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout tenantGroupSupport={true}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
