import { useMemo } from 'react'
import { ApiGetCall } from '../api/ApiCall'

const TENANT_COLUMNS = new Set([
  'Tenant',
  'tenantFilter',
  'Tenants',
  'AllowedTenants',
  'BlockedTenants',
])

export const isTenantColumn = (key) => TENANT_COLUMNS.has(key)

// Per-page choice from the table's Columns menu, else the global preference
export const getShowTenantNames = (settings, pageName) =>
  Boolean(settings?.tenantNamePages?.[pageName] ?? settings?.showTenantNames)

export const toTenantName = (value, names) => {
  if (!names) return value
  const lookup = (v) =>
    typeof v === 'string' ? names.get(v.toLowerCase()) : undefined
  // Tenant pickers store { label, value } with the domain in value
  const one = (v) => {
    const name = lookup(v) ?? lookup(v?.value)
    if (!name) return v
    return typeof v === 'string' ? name : { ...v, label: name }
  }
  return Array.isArray(value) ? value.map(one) : one(value)
}

// Domain/customerId -> display name (the alias when one is set), from the tenant selector's cached list.
export const useTenantNames = (enabled) => {
  const tenants = ApiGetCall({
    url: '/api/listTenants',
    data: { AllTenantSelector: true },
    queryKey: 'TenantSelector',
    waiting: enabled,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
  return useMemo(() => {
    if (!enabled || !Array.isArray(tenants.data)) return null
    const names = new Map()
    for (const tenant of tenants.data) {
      if (!tenant?.displayName) continue
      for (const key of [
        tenant.defaultDomainName,
        tenant.initialDomainName,
        tenant.customerId,
      ]) {
        if (key) names.set(String(key).toLowerCase(), tenant.displayName)
      }
    }
    return names
  }, [enabled, tenants.data])
}
