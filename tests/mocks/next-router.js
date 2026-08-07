const noop = () => {}
const noopPromise = () => Promise.resolve()

const router = {
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  basePath: '',
  isReady: true,
  isLocaleDomain: false,
  push: noopPromise,
  replace: noopPromise,
  reload: noop,
  back: noop,
  forward: noop,
  prefetch: noopPromise,
  beforePopState: noop,
  events: { on: noop, off: noop, emit: noop },
}

export default router
export const useRouter = () => router
export const withRouter = (Component) => Component
