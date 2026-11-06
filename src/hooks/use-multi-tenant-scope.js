import { useSettings } from './use-settings'
import { isMultiTenant } from '../utils/tenant-selection'

// The selection an estate-wide view reads: the selected tenant group, otherwise every tenant.
// Send it as tenantFilter (the request interceptor turns a group into tenantGroup) and key queries on it.
export const useMultiTenantScope = () => {
  const currentTenant = useSettings()?.currentTenant
  return isMultiTenant(currentTenant) ? currentTenant : 'AllTenants'
}
