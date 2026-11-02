import { useMemo } from 'react'
import { ApiGetCall } from '../api/ApiCall'

// One shared reference for the empty case, so callers can safely put it in a dependency array.
const EMPTY = []

// CIPP variables such as %tenantname% can stand in for a literal value anywhere in a template; they
// are substituted per tenant at deployment by Get-CIPPTextReplacement.
//
// CippVariableAutocomplete offers them from a popper anchored at the cursor, which suits free text
// but not a dropdown that already has its own options and its own popper. This exposes the same list
// as plain autocomplete options instead, so a selector can offer variables alongside its real
// choices - the approach CippTenantGroupRuleBuilder already takes for variable names.
//
// Deliberately not scoped to the selected tenant. A template is not tenant specific: it deploys to
// many, and each variable resolves against whichever tenant it lands on. Scoping the list to the
// tenant selector would hide names that are perfectly valid in the template being edited, and would
// change the available options every time the selector moved.
export function useCustomVariableOptions({ enabled = true } = {}) {
  const variables = ApiGetCall({
    url: '/api/ListCustomVariables?allTenants=true',
    queryKey: 'CustomVariables-allTenants',
    waiting: enabled,
    staleTime: Infinity,
  })

  return useMemo(() => {
    const results = variables.data?.Results
    if (!Array.isArray(results))
      return { options: EMPTY, isLoading: variables.isLoading }

    const options = results
      .filter((variable) => variable?.Variable)
      .map((variable) => ({
        label: variable.Variable,
        value: variable.Variable,
        // Shown under the option in the dropdown, so the declared type is visible while choosing.
        variableType: variable.VariableType || 'string',
        description: [variable.VariableType || 'string', variable.Description]
          .filter(Boolean)
          .join(' · '),
        // MUI renders a fresh header every time the group changes, so grouped options have to stay
        // contiguous. Reserved sort before custom below.
        group:
          variable.Type === 'reserved'
            ? 'Reserved variables'
            : 'Custom variables',
        isVariable: true,
      }))
      .sort((a, b) => {
        if (a.group !== b.group)
          return a.group === 'Reserved variables' ? -1 : 1
        return a.label.localeCompare(b.label)
      })

    return { options, isLoading: variables.isLoading }
  }, [variables.data, variables.isLoading])
}
