import React from 'react'
import { CSpinner } from '@coreui/react'
import { Redirect } from 'react-router-dom'
import { useLoadClientPrincipalQuery } from '../../../store/api/auth'
import { FullScreenLoading } from '../../../components'

const Login = () => {
  const { data: clientPrincipal, isLoading } = useLoadClientPrincipalQuery()

  if (isLoading) {
    return <FullScreenLoading />
  } else if (Object.keys(clientPrincipal).length === 0) {
    const root = window.location.protocol + '//' + window.location.host
    window.location.href = root + '/.auth/login/azure'
    return <CSpinner />
  } else {
    return <Redirect to="/" />
  }
}

export default Login
