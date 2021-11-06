import React, { useEffect } from 'react'
import SelectSearch, { fuzzySearch } from 'react-select-search'
import { listTenants, setTenant } from 'src/store/modules/tenants'
import { useDispatch, useSelector } from 'react-redux'

const TenantSelector = () => {
  const dispatch = useDispatch()
  const tenants = useSelector((state) => state.tenants.tenants)
  const tenantsLoading = useSelector((state) => state.tenants.loading)

  useEffect(async () => {
    dispatch(listTenants())
  }, [])

  const activated = (customerId, b, c) => {
    const selectedTenant = tenants.filter((t) => {
      return t.customerId === customerId
    })
    dispatch(setTenant({ tenant: selectedTenant[0] }))
  }

  return (
    <div>
      <SelectSearch
        search
        // onChange={(tenantId) => dispatch(setTenant({ tenant: tenantId }))}
        onChange={activated}
        filterOptions={fuzzySearch}
        placeholder="Select Tenant"
        options={tenants.map(({ customerId, displayName }) => ({
          value: customerId,
          name: displayName,
        }))}
      />
    </div>
  )
}

export default TenantSelector
