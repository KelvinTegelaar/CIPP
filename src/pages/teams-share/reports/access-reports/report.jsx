import { useRouter } from 'next/router'
import { Button, SvgIcon } from '@mui/material'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage'
import { useSettings } from '../../../../hooks/use-settings'

const Page = () => {
  const router = useRouter()
  const { reportId, name } = router.query
  const tenant = useSettings().currentTenant

  if (!reportId) {
    return null
  }

  return (
    <CippTablePage
      title={name || 'Access Report'}
      apiUrl="/api/ListSharePointAccessReports"
      apiData={{ ReportId: reportId }}
      queryKey={`ListSharePointAccessReports-${tenant}-${reportId}`}
      cardButton={
        <Button
          onClick={() => router.push('/teams-share/reports/access-reports')}
          startIcon={
            <SvgIcon fontSize="small">
              <CippIcons.ArrowBack />
            </SvgIcon>
          }
        >
          Back to Access Reports
        </Button>
      }
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
)

export default Page
