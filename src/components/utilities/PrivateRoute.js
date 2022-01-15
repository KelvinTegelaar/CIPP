import React from 'react'
import { Navigate } from 'react-router-dom'
import { useLoadClientPrincipalQuery } from 'src/store/api/auth'
import { FullScreenLoading } from 'src/components/utilities/Loading'
import { useDispatch } from 'react-redux'
import { updateAccessToken } from 'src/store/features/auth'
import PropTypes from 'prop-types'

export const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch()
  const { data: profile, error, isFetching } = useLoadClientPrincipalQuery()

  if (isFetching) {
    return <FullScreenLoading />
  }

  dispatch(updateAccessToken(profile))

  const isAuthenticated = !!profile?.clientPrincipal && !error

  return !isAuthenticated ? <Navigate to="/login" /> : children
}

PrivateRoute.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
}
