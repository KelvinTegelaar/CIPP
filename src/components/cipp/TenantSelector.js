import React from 'react'
import SelectSearch, { fuzzySearch } from 'react-select-search'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useListTenantsQuery } from 'src/store/api/tenants'
import { setCurrentTenant } from 'src/store/features/app'

const TenantSelector = ({ action }) => {
  const dispatch = useDispatch()
  const currentTenant = useSelector((state) => state.app.currentTenant)
  const { data: tenants = [], isLoading, error } = useListTenantsQuery()

  const activated = (customerId) => {
    const selectedTenant = tenants.filter((t) => {
      return t.customerId === customerId
    })
    dispatch(setCurrentTenant({ tenant: selectedTenant[0] }))

    if (typeof action === 'function') {
      action(selectedTenant[0])
    }
  }

  let placeholder = 'Select Tenant'
  if (isLoading) {
    placeholder = 'Loading...'
  } else if (error) {
    placeholder = 'Error loading tenants'
  }

  return (
    <SelectSearch
      search
      onChange={activated}
      filterOptions={fuzzySearch}
      placeholder={placeholder}
      disabled={isLoading}
      value={currentTenant && currentTenant.customerId}
      options={tenants.map(({ customerId, displayName, defaultDomainName }) => ({
        value: customerId,
        name: [displayName] + [` (${defaultDomainName})`],
      }))}
    />
  )
}

TenantSelector.propTypes = {
  action: PropTypes.func,
}

export default TenantSelector
