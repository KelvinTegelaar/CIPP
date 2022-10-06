import React from 'react'
import { useListTenantsQuery } from 'src/store/api/tenants'
import Select from 'react-select'
import PropTypes from 'prop-types'

const TenantSelectorMultiple = React.forwardRef(
  ({ values = [], onChange = () => {}, ...rest }, ref) => {
    const {
      data: tenants = [],
      isLoading,
      error,
    } = useListTenantsQuery({ showAllTenantsSelector: false })

    let placeholder = 'Select Tenants'
    if (isLoading) {
      placeholder = 'Loading...'
    } else if (error) {
      placeholder = 'Error loading tenants'
    }
    const mappedValue = values.map((val) => val.value)
    return (
      <Select
        className="react-select-container"
        classNamePrefix="react-select"
        ref={ref}
        isMulti={true}
        onChange={onChange}
        placeholder={placeholder}
        value={mappedValue.value}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        disabled={isLoading}
        options={tenants.map(({ customerId, defaultDomainName, displayName }) => ({
          value: customerId,
          label: [displayName] + [` (${defaultDomainName})`],
        }))}
        multiple
        printOptions="on-focus"
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
