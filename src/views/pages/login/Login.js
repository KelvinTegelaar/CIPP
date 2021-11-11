import React from 'react'
import { CSpinner } from '@coreui/react'

const Login = () => {
  const root = window.location.protocol + '//' + window.location.host
  window.location.href = root + '/.auth/login/azure'
  return <CSpinner />
}

export default Login
