import React from 'react'
import { CSpinner } from '@coreui/react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { useLoadClientPrincipalQuery } from 'src/store/api/auth'
import { FullScreenLoading } from 'src/components/utilities'

const Login = () => {
  const { data: profile, isFetching, error } = useLoadClientPrincipalQuery()

  const [searchParams] = useSearchParams()
  const isAuthenticated = !!profile?.clientPrincipal || error

  var redirectUri = searchParams.get('redirect_uri')
  if (redirectUri === undefined || redirectUri === '') {
    redirectUri = '/home'
  }

  if (isFetching) {
    return <FullScreenLoading />
  } else if (!isAuthenticated) {
    const root = window.location.protocol + '//' + window.location.host
    window.location.href = root + '/.auth/login/aad?post_login_redirect_uri=' + redirectUri
    return <CSpinner />
  } else {
    return <Navigate to="/home" />
  }
}

export default Login
