import { useLoadClientPrincipalQuery } from 'src/store/api/auth'
import { useDispatch } from 'react-redux'
import { updateAccessToken } from 'src/store/features/auth'
import routes from 'src/routes'

export const useRouteNavCompare = (navigation) => {
  const dispatch = useDispatch()
  const { data: profile, isFetching } = useLoadClientPrincipalQuery()

  if (isFetching) {
    return { isLoading: true, component: null }
  }

  dispatch(updateAccessToken(profile))
  const roles = profile?.clientPrincipal?.userRoles || []

  if (roles.includes('superadmin')) {
    // For 'superadmin', simplify to Dashboard and /cipp/ routes directly so people don't work under this account.
    return navigation.filter((nav) => nav.to === '/home' || nav.to?.startsWith('/cipp'))
  }

  // For other roles, use existing filtering logic
  return navigation
    .map((nav) => {
      if (nav.items) {
        nav.items = nav.items.filter((item) => {
          const route = routes.find((r) => r.path === item.to)
          return (
            route &&
            (!route.allowedRoles || route.allowedRoles.some((role) => roles.includes(role)))
          )
        })
        return nav
      }
      return nav
    })
    .filter((nav) => nav.items && nav.items.length > 0) // Remove empty navigation groups
}
