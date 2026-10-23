import { useRouter } from 'next/router'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'

const Page = () => {
  const router = useRouter()
  const taskId = router.query.taskId
  // One alert: its whole retained history. Every alert: the last day, which is already one row per run per tenant.
  const days = taskId ? 30 : 1

  if (!router.isReady) return null

  return (
    <CippTablePage
      title={
        taskId
          ? 'Run History for this alert (last 30 days)'
          : 'Run History (last 24 hours)'
      }
      apiUrl="/api/ListAlertRunHistory"
      apiData={{ tenantFilter: 'AllTenants', Days: days, TaskId: taskId }}
      tenantInTitle={false}
      simpleColumns={[
        'StartedUtc',
        'ScheduledUtc',
        'TaskName',
        'Tenant',
        'Outcome',
        'Summary',
        'New',
        'Reopened',
        'Resolved',
        'DurationMs',
      ]}
      queryKey={`ListAlertRunHistory-${taskId ?? 'all'}`}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
