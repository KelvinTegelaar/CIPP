import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'

const Page = () => {
  return (
    <CippTablePage
      title="Copilot Usage Trend"
      apiUrl="/api/ListCopilotUsage"
      apiData={{ Type: 'Trend' }}
      simpleColumns={[
        'reportDate',
        'anyAppActive',
        'anyAppEnabled',
        'teamsActive',
        'wordActive',
        'excelActive',
        'powerPointActive',
        'outlookActive',
        'oneNoteActive',
        'loopActive',
        'copilotChatActive',
      ]}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
