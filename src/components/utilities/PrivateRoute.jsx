import React from 'react'
import { FullScreenLoading } from 'src/components/utilities'
import PropTypes from 'prop-types'
import { useAuthCheck } from './CippauthCheck'

export const PrivateRoute = ({ children, allowedRoles }) => {
  const { isLoading, component: authComponent } = useAuthCheck(allowedRoles)
  if (isLoading) {
    return <FullScreenLoading />
  }
  if (authComponent) {
    return authComponent
  }
  return children
}

PrivateRoute.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]).isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
}
