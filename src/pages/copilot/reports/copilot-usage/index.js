import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'

const Page = () => {
  return (
    <CippTablePage
      title="Copilot User Activity"
      apiUrl="/api/ListCopilotUsage"
      apiData={{ Type: 'UserDetail' }}
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
