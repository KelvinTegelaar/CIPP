import React, { useEffect } from 'react'
import SelectSearch, { fuzzySearch } from 'react-select-search'
import { listTenants } from 'src/store/modules/tenants'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentTenant } from '../../store/modules/app'
import PropTypes from 'prop-types'

const TenantSelector = (props) => {
  const { action } = props

  const dispatch = useDispatch()
  const tenants = useSelector((state) => state.tenants.tenants)
  const currentTenant = useSelector((state) => state.app.currentTenant)

  useEffect(() => {
    async function load() {
      dispatch(listTenants())
    }
    load()
  }, [dispatch])

  const activated = (customerId, b, c) => {
    const selectedTenant = tenants.filter((t) => {
      return t.customerId === customerId
    })
    dispatch(setCurrentTenant({ tenant: selectedTenant[0] }))
    if (typeof action === 'function') {
      action(selectedTenant[0])
    }
  }

  return (
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
  )
}

TenantSelector.propTypes = {
  action: PropTypes.func,
}

export default TenantSelector
