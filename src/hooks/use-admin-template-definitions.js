// Resolves groupPolicyDefinitions metadata per-tenant. Can't be a static JSON:
// tenants can import custom ADMX files, so the available definitions are
// tenant-specific.
import { useMemo } from 'react'
import { ApiGetCall } from '../api/ApiCall'
import { useSettings } from './use-settings'
import { definitionBindPattern, extractBindGuid } from '../utils/intune-bind-helpers'

export const useAdminTemplateDefinitions = ({ added = [], manualTenant = null, waiting = true } = {}) => {
  const tenantFilter = useSettings().currentTenant
  const activeTenant = manualTenant || tenantFilter

  const definitionIds = useMemo(() => {
    if (!Array.isArray(added)) {
      return []
    }

    const ids = new Set()
    added.forEach((item) => {
      const definitionId = extractBindGuid(item?.['definition@odata.bind'], definitionBindPattern)
      if (definitionId) {
        ids.add(definitionId)
      }
    })

    return Array.from(ids).sort()
  }, [added])

  const canResolveDefinitions =
    waiting && Boolean(activeTenant) && activeTenant !== 'AllTenants' && definitionIds.length > 0

  const definitionsRequest = ApiGetCall({
    url: '/api/ListIntunePolicy',
    queryKey: `AdminTemplateDefinitions-${activeTenant}-${definitionIds.join(',') || 'none'}`,
    data: {
      TenantFilter: activeTenant,
      URLName: 'GroupPolicyDefinitions',
      DefinitionIds: definitionIds.join(','),
    },
    waiting: canResolveDefinitions,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    toast: false,
    staleTime: 15 * 60 * 1000,
  })

  const definitions = useMemo(() => {
    if (Array.isArray(definitionsRequest.data)) {
      return definitionsRequest.data
    }

    if (Array.isArray(definitionsRequest.data?.Results)) {
      return definitionsRequest.data.Results
    }

    if (Array.isArray(definitionsRequest.data?.value)) {
      return definitionsRequest.data.value
    }

    return []
  }, [definitionsRequest.data])

  const definitionsMap = useMemo(() => {
    const mapping = {}

    definitions.forEach((definition) => {
      if (definition?.id) {
        mapping[String(definition.id).toLowerCase()] = definition
      }
    })

    return mapping
  }, [definitions])

  return {
    definitionsMap,
    isLoadingDefinitions:
      canResolveDefinitions && (definitionsRequest.isLoading || definitionsRequest.isFetching),
    isDefinitionsError: canResolveDefinitions && definitionsRequest.isError,
  }
}
