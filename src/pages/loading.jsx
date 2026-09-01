import Head from 'next/head'
import { ApiGetCall } from '../api/ApiCall'
import { CippAuthShell } from '../components/CippComponents/CippAuthShell'

const Page = () => {
  // /version.json is served by the frontend host, so it resolves even when the
  // API doesn't
  const version = ApiGetCall({
    url: '/version.json',
    queryKey: 'LocalVersion',
  })

  return (
    <>
      <Head>
        <title>Loading</title>
      </Head>
      <CippAuthShell
        busy
        version={version?.data?.version}
        title="Logging into CIPP"
        description="Please wait while we log you in..."
      />
    </>
  )
}

export default Page
