import React, { useEffect } from 'react'
import SelectSearch, { fuzzySearch } from 'react-select-search'
import { listTenants } from 'src/store/modules/tenants'
import { useDispatch, useSelector } from 'react-redux'
// import { setCurrentTenant } from '../../store/modules/app'
import PropTypes from 'prop-types'
import { useListTenantsQuery } from '../../store/api/tenants'
import { setCurrentTenant } from '../../store/features/app'

const TenantSelector = (props) => {
  const { action } = props

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
      value={currentTenant && currentTenant.customerId}
      options={tenants.map(({ customerId, defaultDomainName }) => ({
        value: customerId,
        name: defaultDomainName,
      }))}
    />
  )
}

TenantSelector.propTypes = {
  action: PropTypes.func,
}

export default TenantSelector
