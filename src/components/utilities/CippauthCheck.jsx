import { useLoadClientPrincipalQuery } from 'src/store/api/auth'
import { useDispatch } from 'react-redux'
import { updateAccessToken } from 'src/store/features/auth'
import { Navigate } from 'react-router-dom'

export const useAuthCheck = (allowedRoles) => {
  const dispatch = useDispatch()
  const { data: profile, isFetching } = useLoadClientPrincipalQuery()
  if (isFetching) {
    return { isLoading: true, component: null }
  }
  dispatch(updateAccessToken(profile))
  let roles = profile?.clientPrincipal?.userRoles || []

  if (!profile?.clientPrincipal) {
    return {
      component: (
        <Navigate to={`/login?redirect_uri=${encodeURIComponent(window.location.href)}`} />
      ),
      result: false,
    }
  }
  if (allowedRoles && !allowedRoles.some((role) => roles.includes(role))) {
    return { component: <Navigate to="/403" />, result: true }
  }
  return { component: null, result: false }
}
