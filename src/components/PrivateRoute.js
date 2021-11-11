import React, { useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { loadClientPrincipal } from 'src/store/modules/profile'

export const PrivateRoute = ({ ...rest }) => {
  const dispatch = useDispatch()
  useEffect(async () => {
    dispatch(loadClientPrincipal())
  }, [])
  const profile = useSelector((state) => state.profile)
  console.log(profile)
  return profile.isLoggedIn ? <Route {...rest} /> : <Redirect to="/login" />
}
