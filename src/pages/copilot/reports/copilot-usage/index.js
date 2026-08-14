import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import {
  CippAnonymizedReportAlert,
  useReportAnonymized,
} from '../../../../components/CippComponents/CippAnonymizedReportAlert'
import { useSettings } from '../../../../hooks/use-settings'

const Page = () => {
  const tenant = useSettings().currentTenant
  const queryKey = `CopilotUserActivity-${tenant}`

  const anonymized = useReportAnonymized({
    url: '/api/ListCopilotUsage',
    data: { Type: 'UserDetail' },
    queryKey: queryKey,
    fields: ['userPrincipalName', 'displayName'],
  })

  return (
    <CippTablePage
      title="Copilot User Activity"
      apiUrl="/api/ListCopilotUsage"
      apiData={{ Type: 'UserDetail' }}
      queryKey={queryKey}
      tableFilter={<CippAnonymizedReportAlert show={anonymized} />}
      simpleColumns={[
        'userPrincipalName',
        'displayName',
        'lastActivityDate',
        'copilotChat',
        'teams',
        'word',
        'excel',
        'powerPoint',
        'outlook',
        'oneNote',
        'loop',
      ]}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
