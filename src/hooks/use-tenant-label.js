import { ApiGetCall } from '../api/ApiCall'
import { tenantGroupId } from '../utils/tenant-selection'

// A readable name for a tenant selection: "All Tenants", the group's name, or the tenant domain.
// Reads the tenant selector's cached group list rather than fetching its own.
export const useTenantLabel = (selection) => {
  const groupId = tenantGroupId(selection)
  const groups = ApiGetCall({
    url: '/api/ListTenantGroups',
    data: { TenantSelector: true },
    queryKey: 'TenantSelectorGroups',
    refetchOnMount: false,
    waiting: Boolean(groupId),
  })
  if (selection === 'AllTenants') return 'All Tenants'
  if (groupId) {
    const group = (
      Array.isArray(groups.data?.Results) ? groups.data.Results : []
    ).find((g) => g.Id === groupId)
    return group?.Name ?? 'Selected tenant group'
  }
  return selection
}
