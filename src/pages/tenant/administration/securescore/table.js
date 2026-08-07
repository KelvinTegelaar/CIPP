import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import tabOptions from './tabOptions'
import CippTablePage from '../../../../components/CippComponents/CippTablePage'
import { useSecureScore } from '../../../../hooks/use-securescore'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import { CheckCircleIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { Map, Score } from '@mui/icons-material'
import { Container } from '@mui/material'
import { useSettings } from '../../../../hooks/use-settings'
import { AllTenantsSecureScoreTable } from '../../../../components/CippAllTenants/AllTenantsSecureScore'
const Page = () => {
  const secureScore = useSecureScore()
  const currentTenant = useSettings().currentTenant

  if (currentTenant === 'AllTenants') {
    return (
      <Container
        sx={{
          flexGrow: 1,
          py: 2,
        }}
        maxWidth={false}
      >
        <AllTenantsSecureScoreTable />
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
              icon: <CheckCircleIcon />,
              data: secureScore.translatedData.percentageCurrent + '%',
              name: 'Current Score',
              color: 'secondary',
            },
            {
              icon: <GlobeAltIcon />,
              data: secureScore.translatedData.percentageVsAllTenants + '%',
              name: 'Compared score (All Tenants)',
              color: 'green',
            },
            {
              icon: <Map />,
              data: secureScore.translatedData.percentageVsSimilar + '%',
              name: 'Compared score (Similar Tenants)',
            },
            {
              icon: <Score />,
              data: `${secureScore.translatedData.currentScore} of ${secureScore.translatedData.maxScore}`,
              name: 'Score in points',
            },
          ]}
        />
      </Container>
      <CippTablePage
        title="Secure Score"
        data={secureScore.translatedData.controlScores}
        simpleColumns={['title', 'tier', 'actionUrl', 'userImpact', 'threats']}
      />
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
