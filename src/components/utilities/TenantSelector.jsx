import React, { useCallback, useEffect } from 'react'
import SelectSearch, { fuzzySearch } from 'react-select-search'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useListTenantsQuery } from 'src/store/api/tenants'
import { setCurrentTenant } from 'src/store/features/app'
import { CButton } from '@coreui/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { queryString } from 'src/helpers'
import { faBuilding } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CippTenantOffcanvas from './CippTenantOffcanvas'
import CippfuzzySearch from './CippFuzzySearch'

const TenantSelector = ({ action, showAllTenantSelector = true, NavSelector = false }) => {
  const [refreshState, setRefreshState] = React.useState(false)
  const currentTenant = useSelector((state) => state.app.currentTenant)
  const {
    data: tenants = [
      {
        defaultDomainName: '',
        customerId: '',
        displayName: 'Did not retrieve tenants. Perform a permissions check',
      },
    ],
    isLoading,
    isFetching,
    isSuccess,
    error,
  } = useListTenantsQuery({ showAllTenantSelector, Refresh: refreshState })

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const updateSearchParams = useCallback(
    (params) => {
      navigate(`${queryString(params)}`, { replace: true })
    },
    [navigate],
  )

  useEffect(() => {
    const Paramcount = Array.from(searchParams).length
    if (Paramcount <= 1) {
      const customerId = searchParams.get('customerId')
      const tableFilter = searchParams.get('tableFilter')
      var newSearchParams = {}
      if (tableFilter) {
        newSearchParams.tableFilter = tableFilter
      }
      if (customerId && isSuccess) {
        const currentTenant = tenants.filter((tenant) => tenant.customerId === customerId)
        if (currentTenant.length > 0) {
          dispatch(setCurrentTenant({ tenant: currentTenant[0] }))
        }
      }
      if (!customerId && Object.keys(currentTenant).length > 0) {
        newSearchParams.customerId = currentTenant?.customerId
        updateSearchParams(newSearchParams)
      }
    }
  }, [dispatch, isSuccess, searchParams, currentTenant, tenants, updateSearchParams])

  const activated = (customerId) => {
    const selectedTenant = tenants.filter((t) => {
      return t.customerId === customerId
    })
    dispatch(setCurrentTenant({ tenant: selectedTenant[0] }))
    if (typeof action === 'function') {
      action(selectedTenant[0])
    } else {
      setSearchParams({ customerId: customerId })
    }
  }

  let placeholder = 'Select Tenant'
  if (isLoading) {
    placeholder = 'Loading...'
  } else if (error) {
    placeholder = 'Error loading tenants'
  }

  return (
    <>
      {NavSelector && (
        <>
          {currentTenant?.customerId !== 'AllTenants' ? (
            <CippTenantOffcanvas tenant={currentTenant} buildingIcon={true} />
          ) : (
            <CButton disabled size="sm" variant="ghost" className="mx-2">
              <FontAwesomeIcon icon={faBuilding} />
            </CButton>
          )}
          <div className="flex-grow-1 my-auto d-flex align-items-center">
            <SelectSearch
              search
              className="select-search tenantDropdown"
              onChange={activated}
              filterOptions={CippfuzzySearch}
              placeholder={placeholder}
              disabled={isLoading}
              value={currentTenant && currentTenant.customerId}
              options={tenants.map(({ customerId, displayName, defaultDomainName }) => ({
                value: customerId,
                name: `${displayName} (${defaultDomainName})`,
              }))}
            />
            <CButton
              onClick={() =>
                //set a random number to force a refresh
                setRefreshState(Math.random())
              }
              variant="ghost"
              className="ml-2"
            >
              <FontAwesomeIcon icon={'refresh'} spin={isFetching} />
            </CButton>
          </div>
        </>
      )}
      {!NavSelector && (
        <SelectSearch
          search
          onChange={activated}
          filterOptions={CippfuzzySearch}
          placeholder={placeholder}
          disabled={isLoading}
          value={currentTenant && currentTenant.customerId}
          options={tenants.map(({ customerId, displayName, defaultDomainName }) => ({
            value: customerId,
            name: [displayName] + [` (${defaultDomainName})`],
          }))}
        />
      )}
    </>
  )
}

TenantSelector.propTypes = {
  action: PropTypes.func,
  NavSelector: PropTypes.bool,
  showAllTenantSelector: PropTypes.bool,
}

export default TenantSelector
