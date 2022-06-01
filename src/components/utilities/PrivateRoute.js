import React from 'react'
import { Navigate } from 'react-router-dom'
import { useLoadClientPrincipalQuery } from 'src/store/api/auth'
import { FullScreenLoading } from 'src/components/utilities'
import { useDispatch } from 'react-redux'
import { updateAccessToken } from 'src/store/features/auth'
import PropTypes from 'prop-types'

export const PrivateRoute = ({ children, routeType }) => {
  const dispatch = useDispatch()
  const { data: profile, error, isFetching } = useLoadClientPrincipalQuery()
  //console.log()
  if (isFetching) {
    return <FullScreenLoading />
  }

  dispatch(updateAccessToken(profile))
  let roles
  if (null !== profile.clientPrincipal) {
    roles = profile?.clientPrincipal.userRoles
  } else if (null === profile.clientPrincipal) {
    return <Navigate to={`/login?redirect_uri=${window.location.href}`} />
  }
  if (null === roles) {
    return <Navigate to={`/login?redirect_uri=${window.location.href}`} />
  } else {
    const isAuthenticated =
      roles.includes('admin') || roles.includes('editor') || (roles.includes('readonly') && !error)
    const isAdmin = roles.includes('admin')
    if (routeType === 'admin') {
      return !isAdmin ? <Navigate to="/403" /> : children
    } else {
      return !isAuthenticated ? <Navigate to="/403" /> : children
    }
  }
}

PrivateRoute.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  routeType: PropTypes.string,
}
