import React from 'react'
import { CSpinner } from '@coreui/react'
import { Redirect } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getClientPrincipal } from 'src/store/modules/profile'

const Login = () => {
  const dispatch = useDispatch()
  const clientPrincipal = dispatch(getClientPrincipal())
  if (Object.keys(clientPrincipal).length === 0) {
    const root = window.location.protocol + '//' + window.location.host
    window.location.href = root + '/.auth/login/azure'
    return <CSpinner />
  } else {
    return <Redirect to="/" />
  }
}

export default Login
