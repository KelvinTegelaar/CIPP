import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useLoadClientPrincipalQuery } from '../store/api/auth'
import { FullScreenLoading } from './Loading'

export const PrivateRoute = ({ ...rest }) => {
  const { data: clientPrincipal, error, isLoading } = useLoadClientPrincipalQuery()

  if (isLoading) {
    return <FullScreenLoading />
  }
  return Object.keys(clientPrincipal).length === 0 || error ? (
    <Redirect to="/login" />
  ) : (
    <Route {...rest} />
  )
}
