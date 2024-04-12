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
  let roles = profile?.clientPrincipal?.userRoles || []
  let newNavigation = navigation.map((nav) => {
    if (nav.items) {
      nav.items = nav.items.filter((item) => {
        const route = routes.find((r) => r.path === item.to)
        if (
          !route ||
          (route.allowedRoles && route.allowedRoles.some((role) => roles.includes(role)))
        ) {
          return true
        } else {
          //console.log('Removing route', item)
          return false
        }
      })
    }
    return nav
  })

  return newNavigation
}
