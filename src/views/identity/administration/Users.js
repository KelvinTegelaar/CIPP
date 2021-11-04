import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { listTenants } from '../../../store/modules/tenants'

const Users = () => {
  const dispatch = useDispatch()
  const tenants = useSelector((state) => state.tenants.tenants)
  const tenantsLoading = useSelector((state) => state.tenants.loading)

  useEffect(async () => {
    dispatch(listTenants())
  }, [])

  return (
    <div>
      Loading: {JSON.stringify(tenantsLoading)}
      <br />
      Tenants: <pre>{JSON.stringify(tenants, null, 2)}</pre>
    </div>
  )
}

export default Users
