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

  const activated = (tenantId) => {
    dispatch(
      setTenant(
        tenants.filter((t) => {
          return t.tenantId === tenantId
        }),
      ),
    )
  }

  return (
    <div>
      <SelectSearch
        search
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
