import React from 'react'
import SelectSearch, { fuzzySearch } from 'react-select-search'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useListTenantsQuery } from 'src/store/api/tenants'
import { setCurrentTenant } from 'src/store/features/app'
import { CippContentCard } from 'src/components/layout'
import { faCity, faBuilding } from '@fortawesome/free-solid-svg-icons'

const TenantSelector = ({ action, showAllTenantSelector = false }) => {
  const dispatch = useDispatch()
  const currentTenant = useSelector((state) => state.app.currentTenant)
  const { data: tenants = [], isLoading, error } = useListTenantsQuery({ showAllTenantSelector })

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
    <CippContentCard
      title={showAllTenantSelector ? 'Select a Tenant or All Tenants' : 'Select a Tenant'}
      icon={showAllTenantSelector ? faCity : faBuilding}
      className="tenant-selector"
    >
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
    </CippContentCard>
  )
}

TenantSelector.propTypes = {
  action: PropTypes.func,
  showAllTenantSelector: PropTypes.bool,
}

export default TenantSelector
