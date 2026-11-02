// Every Intune surface that renders a settings catalog policy needs the same thing up front: the
// set of setting definition ids the policy references, so it can ask for those definitions and
// nothing else.
//
// The ids are reachable through several shapes - settingInstance, groupSettingCollectionValue
// children, choice children, nested collections - and new ones appear as Intune adds setting types.
// Walking for the key rather than encoding a path per variant means a shape this code has never
// seen still contributes its ids.
export const collectSettingDefinitionIds = (policy) => {
  const ids = new Set()
  if (!policy || typeof policy !== 'object') return ids

  // Policies are trees, but they arrive from callers that may have shared subobjects between
  // branches; visited also stops a cyclic object from hanging the walk.
  const visited = new Set()

  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    if (visited.has(node)) return
    visited.add(node)

    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }

    if (
      typeof node.settingDefinitionId === 'string' &&
      node.settingDefinitionId
    ) {
      ids.add(node.settingDefinitionId)
    }

    Object.values(node).forEach(walk)
  }

  walk(policy)
  return ids
}
