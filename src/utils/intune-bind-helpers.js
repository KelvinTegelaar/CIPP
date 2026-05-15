// Parsers for Intune Admin Template @odata.bind refs (e.g. `groupPolicyDefinitions('GUID')`).
// Shared so the hook and CippJSONView renderer can't drift.

export const definitionBindPattern = /groupPolicyDefinitions\('([0-9a-f-]{36})'\)/i
export const presentationBindPattern = /presentations\('([0-9a-f-]{36})'\)/i

export const extractBindGuid = (value, pattern) => {
  if (typeof value !== 'string') {
    return null
  }

  const match = value.match(pattern)
  return match?.[1]?.toLowerCase() || null
}
