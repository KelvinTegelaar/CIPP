import { useEffect } from 'react'
import Head from 'next/head'

const Page = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')
    const errorDescription = params.get('error_description')

    if (window.opener) {
      if (code && state) {
        window.opener.postMessage({ type: 'auth_code', code, state }, window.location.origin)
      } else if (error) {
        window.opener.postMessage(
          { type: 'auth_error', error, errorDescription },
          window.location.origin
        )
      }
      window.close()
    }
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
