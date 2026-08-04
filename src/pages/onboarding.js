import { useEffect } from 'react'
import { useRouter } from 'next/router'

// The legacy SAM Setup wizard that lived here posted to /api/ExecSAMSetup, which no longer exists
// on the backend. Keep the route alive as a redirect so bookmarks and old links land on the
// current onboarding wizard (/api/ExecCombinedSetup) instead of a dead form.
const Page = () => {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    router.replace({ pathname: '/onboardingv2', query: router.query })
  }, [router])

  return null
}

export default Page
