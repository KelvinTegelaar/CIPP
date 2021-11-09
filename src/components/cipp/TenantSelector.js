import React, { useEffect } from 'react'
import SelectSearch, { fuzzySearch } from 'react-select-search'
import { listTenants } from 'src/store/modules/tenants'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentTenant } from '../../store/modules/app'

const TenantSelector = () => {
  const dispatch = useDispatch()
  const tenants = useSelector((state) => state.tenants.tenants)
  let currentTenant = useSelector((state) => state.app.currentTenant)

  useEffect(async () => {
    dispatch(listTenants())
  }, [])

  const activated = (customerId, b, c) => {
    const selectedTenant = tenants.filter((t) => {
      return t.customerId === customerId
    })
    dispatch(setCurrentTenant({ tenant: selectedTenant[0] }))
  }

  return (
    <div>
      <SelectSearch
        search
        onChange={activated}
        filterOptions={fuzzySearch}
        placeholder="Select Tenant"
        value={currentTenant && currentTenant.customerId}
        options={tenants.map(({ customerId, defaultDomainName }) => ({
          value: customerId,
          name: defaultDomainName,
        }))}
      />
    </div>
  )
}

export default TenantSelector
