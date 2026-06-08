import { useEffect, useState } from 'react'
import { CippFormComponent } from './CippFormComponent'
import { ApiGetCall } from '../../api/ApiCall'

/**
 * A tenant selector scoped to the tenants applicable to a given standards template.
 *
 * - If the template targets AllTenants, all tenants are offered plus an "All Tenants" option.
 * - If the template targets tenant groups, each group's members are fetched and offered,
 *   plus the group itself as a "run for whole group" option.
 * - Individual tenant entries are offered directly.
 *
 * The final value sent to the API will be the tenant's defaultDomainName, a group ID, or
 * "allTenants".
 */
export const CippFormTemplateTenantSelector = ({
  formControl,
  templateTenants = [],
  excludedTenants = [],
  name = 'tenantFilter',
  label = 'Select Tenant',
  placeholder = 'Select a tenant, group, or All Tenants...',
  required = true,
  ...other
}) => {
  // Build a set of excluded values for fast lookup
  const excludedValues = new Set(
    excludedTenants.map((t) => (typeof t === 'object' ? t?.value : t)).filter(Boolean)
  )
  const isExcluded = (value) => excludedValues.has(value)
  const [options, setOptions] = useState([])

  // Determine what the template targets
  const hasAllTenants = templateTenants.some(
    (t) => t?.value === 'AllTenants' || t?.value === 'allTenants'
  )
  const groupIds = templateTenants.filter((t) => t?.type === 'Group').map((t) => t.value)
  const individualTenants = templateTenants.filter(
    (t) => t?.type !== 'Group' && t?.value !== 'AllTenants' && t?.value !== 'allTenants'
  )

  // Fetch all tenants when AllTenants is targeted
  const allTenantList = ApiGetCall({
    url: '/api/ListTenants?AllTenantSelector=true',
    queryKey: 'ListTenants-TemplateTenantSelector',
    waiting: hasAllTenants,
  })

  // Fetch each group's members (one request per group)
  const groupRequests = groupIds.map((id) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ApiGetCall({
      url: `/api/ListTenantGroups?groupId=${id}`,
      queryKey: `TenantGroup-${id}`,
      waiting: groupIds.length > 0,
    })
  )

  useEffect(() => {
    const built = [{ label: 'All Tenants in Template', value: 'allTenants', group: 'All Tenants' }]

    if (hasAllTenants) {
      if (allTenantList.isSuccess && Array.isArray(allTenantList.data)) {
        allTenantList.data.forEach((tenant) => {
          if (isExcluded(tenant.defaultDomainName)) return
          built.push({
            label: `${tenant.displayName} (${tenant.defaultDomainName})`,
            value: tenant.defaultDomainName,
            group: 'Individual Tenants',
          })
        })
      }
    }

    groupRequests.forEach((req, idx) => {
      const groupId = groupIds[idx]
      const groupEntry = templateTenants.find((t) => t.value === groupId)
      const groupName = groupEntry?.label ?? groupId

      if (req.isSuccess) {
        const results = Array.isArray(req.data?.Results)
          ? req.data.Results
          : Array.isArray(req.data)
            ? req.data
            : []
        const matchedGroup = results.find((g) => g.Id === groupId) ?? results[0]

        if (matchedGroup) {
          // Individual members only — group itself is not selectable
          const members = Array.isArray(matchedGroup.Members) ? matchedGroup.Members : []
          members.forEach((m) => {
            if (isExcluded(m.defaultDomainName)) return
            built.push({
              label: `${m.displayName ?? m.defaultDomainName} (${m.defaultDomainName})`,
              value: m.defaultDomainName,
              group: matchedGroup.Name ?? groupName,
            })
          })
        }
      }
    })

    // Individual tenant entries from the template
    individualTenants.forEach((t) => {
      if (isExcluded(t.value)) return
      if (!built.some((b) => b.value === t.value)) {
        built.push({
          label: t.label ?? t.value,
          value: t.value,
          group: 'Individual Tenants',
        })
      }
    })

    setOptions(built)
  }, [
    hasAllTenants,
    allTenantList.isSuccess,
    allTenantList.data,
    ...groupRequests.map((r) => r.isSuccess),
    ...groupRequests.map((r) => r.data),
  ])

  const isFetching =
    (hasAllTenants && allTenantList.isFetching) || groupRequests.some((r) => r.isFetching)

  return (
    <CippFormComponent
      type="autoComplete"
      name={name}
      label={label}
      placeholder={placeholder}
      formControl={formControl}
      options={options}
      multiple={false}
      creatable={false}
      disableClearable={false}
      isFetching={isFetching}
      groupBy={(option) => option.group}
      validators={
        required ? { required: { value: true, message: 'Please select a tenant' } } : undefined
      }
      {...other}
    />
  )
}
