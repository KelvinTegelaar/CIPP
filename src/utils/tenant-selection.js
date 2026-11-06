// The tenant selection (settings.currentTenant) is one of three kinds:
//   a tenant domain        'contoso.com'
//   every tenant           'AllTenants'
//   a tenant group         'group:<id>'
// Pages ask isMultiTenant() for "show the multi-tenant view", never compare to 'AllTenants'.
const GROUP_PREFIX = 'group:'

export const isTenantGroup = (value) =>
  typeof value === 'string' && value.startsWith(GROUP_PREFIX)

export const tenantGroupId = (value) =>
  isTenantGroup(value) ? value.slice(GROUP_PREFIX.length) : null

export const toTenantGroup = (id) => `${GROUP_PREFIX}${id}`

export const isMultiTenant = (value) =>
  value === 'AllTenants' || isTenantGroup(value)

// A request names a tenant (tenantFilter) or a group (tenantGroup), never both, and never a
// group inside tenantFilter. Build a request's tenant parameter from a selection with this.
export const tenantScope = (selection) =>
  isTenantGroup(selection)
    ? { tenantGroup: tenantGroupId(selection) }
    : { tenantFilter: selection }

export const isMultiTenantScope = (data) =>
  !!data?.tenantGroup || isMultiTenant(data?.tenantFilter)
