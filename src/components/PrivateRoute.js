import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getClientPrincipal, loadClientPrincipal } from '../store/modules/profile'

export const PrivateRoute = ({ ...rest }) => {
  const dispatch = useDispatch()
  dispatch(loadClientPrincipal())
  const clientPrincipal = dispatch(getClientPrincipal())
  return Object.keys(clientPrincipal).length === 0 ? <Redirect to="/login" /> : <Route {...rest} />
}
