import Head from 'next/head'
import { CippErrorState } from '../components/CippComponents/CippErrorState'
import { Layout as DashboardLayout } from '../layouts/index.js'

const Page = () => (
  <DashboardLayout showBreadcrumb={false}>
    <Head>
      <title>404 - Not Found</title>
    </Head>
    <CippErrorState
      code="404"
      title="Page not found"
      description="This page doesn't exist, or it has moved. Head back to the dashboard and pick up from there."
      imageUrl="/cippy-404.png"
      actionText="Return to Home"
      actionHref="/"
    />
  </DashboardLayout>
)

export default Page
