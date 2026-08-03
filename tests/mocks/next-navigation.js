const noop = () => {}

export const useRouter = () => ({
  push: noop,
  replace: noop,
  refresh: noop,
  back: noop,
  forward: noop,
  prefetch: noop,
})

export const usePathname = () => '/'
export const useSearchParams = () => new URLSearchParams()
export const useParams = () => ({})
export const redirect = noop
export const notFound = noop
