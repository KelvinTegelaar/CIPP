import { useEffect } from 'react'
import Head from 'next/head'

const Page = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')
    const errorDescription = params.get('error_description')

    const channel = new BroadcastChannel('cipp_auth')
    if (code && state) {
      channel.postMessage({ type: 'auth_code', code, state })
    } else if (error) {
      channel.postMessage({ type: 'auth_error', error, errorDescription })
    }
    channel.close()
    window.close()
  }, [])

  return (
    <>
      <Head>
        <title>Authentication complete</title>
      </Head>
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <p>Authentication complete. This window will close automatically.</p>
      </div>
    </>
  )
}

export default Page
