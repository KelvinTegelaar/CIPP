import React from 'react'
import { CSpinner } from '@coreui/react'
import { Navigate } from 'react-router-dom'
import { useLoadClientPrincipalQuery } from 'src/store/api/auth'
import { FullScreenLoading } from 'src/components/utilities'

const Login = () => {
  const { data: profile, isFetching, error } = useLoadClientPrincipalQuery()

  const isAuthenticated = !!profile?.clientPrincipal || error

  if (isFetching) {
    return <FullScreenLoading />
  } else if (!isAuthenticated) {
    const root = window.location.protocol + '//' + window.location.host
    window.location.href = root + '/.auth/login/azure'
    return <CSpinner />
  } else {
    return <Navigate to="/home" />
  }
}

export default Login
