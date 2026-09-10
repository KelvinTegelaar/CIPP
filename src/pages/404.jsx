import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { CippErrorState } from '../components/CippComponents/CippErrorState'
import { Layout as DashboardLayout } from '../layouts/index'
import { getRedirectTarget } from '../utils/route-redirects'

const REDIRECT_SECONDS = 3

// window.location is client-only. useSyncExternalStore reads it without a hydration
// mismatch: the server snapshot is null, so the prerender and the first client paint
// both render the plain 404, then the client swaps in the redirect notice. (The store
// never changes, so subscribe is a no-op.)
const subscribe = () => () => {}
const getPathname = () => window.location.pathname
const getServerPathname = () => null

const Page = () => {
  const router = useRouter()
  const pathname = useSyncExternalStore(
    subscribe,
    getPathname,
    getServerPathname
  )
  const target = pathname ? getRedirectTarget(pathname) : null
  // Carry the query string and hash across the redirect so retired routes that take
  // params (e.g. an edit page's ?id=…) still resolve. target is only ever set client-side
  // (pathname comes from window.location), so window is available here.
  const targetWithParams =
    target && typeof window !== 'undefined'
      ? `${target}${window.location.search}${window.location.hash}`
      : target
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)

  // Static export (output: 'export') has no server-side redirects, so retired routes
  // land here (the host serves 404.html for an unknown path) and are sent on to their
  // replacement after a short visible countdown. setSecondsLeft runs in the timeout
  // callback, so no state is set synchronously in the effect body.
  useEffect(() => {
    if (!targetWithParams) return
    if (secondsLeft <= 0) {
      router.replace(targetWithParams)
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [targetWithParams, secondsLeft, router])

  if (target) {
    return (
      <DashboardLayout showBreadcrumb={false}>
        <Head>
          <title>Redirecting…</title>
        </Head>
        <CippErrorState
          title="This page has moved"
          description={`Taking you to ${target} in ${Math.max(secondsLeft, 0)}…`}
          imageUrl="/cippy-404.png"
          actionText="Go there now"
          actionHref={targetWithParams}
        />
      </DashboardLayout>
    )
  }

  return (
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
}

export default Page
