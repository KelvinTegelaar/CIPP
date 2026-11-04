import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import tabOptions from './tabOptions'
import { Card, CardContent, Container, Typography } from '@mui/material'
import { useSettings } from '../../../../hooks/use-settings'
import { AllTenantsSecureScoreControlRollup } from '../../../../components/CippAllTenants/AllTenantsSecureScore'

// Per-control rollup across every tenant. The tab is only listed under AllTenants; a single
// tenant reaching this URL directly gets pointed back to the selector.
const Page = () => {
  const currentTenant = useSettings().currentTenant

  return (
    <Container sx={{ flexGrow: 1, py: 2 }} maxWidth={false}>
      {currentTenant === 'AllTenants' ? (
        <AllTenantsSecureScoreControlRollup />
      ) : (
        <Card>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
              The controls rollup compares tenants. Select All Tenants in the tenant selector to see it.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
