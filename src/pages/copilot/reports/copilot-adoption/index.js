import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'

const Page = () => {
  return (
    <CippTablePage
      title="Copilot Adoption by Product"
      apiUrl="/api/ListCopilotUsage"
      apiData={{ Type: 'Adoption' }}
      simpleColumns={['product', 'enabledUsers', 'activeUsers']}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
