import Head from 'next/head'
import { CippErrorState } from '../components/CippComponents/CippErrorState'
import { Layout as DashboardLayout } from '../layouts/index.js'

const Page = () => (
  <DashboardLayout showBreadcrumb={false}>
    <Head>
      <title>401 - Not allowed</title>
    </Head>
    <CippErrorState
      code="401"
      title="Not allowed"
      description="Your account doesn't have permission to view this page. Head back to the dashboard, or ask an administrator to grant you access."
      imageUrl="/cippy-401.png"
      actionText="Return to Home"
      actionHref="/"
    />
  </DashboardLayout>
)

export default Page
