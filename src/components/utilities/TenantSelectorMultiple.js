import React from 'react'
import { useListTenantsQuery } from 'src/store/api/tenants'
import SelectSearch, { fuzzySearch } from 'react-select-search'
import PropTypes from 'prop-types'

const TenantSelectorMultiple = React.forwardRef(
  ({ values = [], onChange = () => {}, ...rest }, ref) => {
    const { data: tenants = [], isLoading, error } = useListTenantsQuery()

    let placeholder = 'Select Tenants'
    if (isLoading) {
      placeholder = 'Loading...'
    } else if (error) {
      placeholder = 'Error loading tenants'
    }

    return (
      <SelectSearch
        ref={ref}
        search
        onChange={onChange}
        filterOptions={fuzzySearch}
        placeholder={placeholder}
        value={values}
        disabled={isLoading}
        options={tenants.map(({ customerId, defaultDomainName, displayName }) => ({
          value: customerId,
          name: [displayName] + [` (${defaultDomainName})`],
        }))}
        multiple
        printOptions="on-focus"
        closeOnSelect={false}
        {...rest}
      />
    )
  },
)

TenantSelectorMultiple.propTypes = {
  onChange: PropTypes.func,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
}

TenantSelectorMultiple.displayName = 'MultipleTenantSelector'

export default TenantSelectorMultiple
