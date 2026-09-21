const GUEST_TYPE_LABELS = {
  none: 'None',
  internalGuest: 'Internal guest',
  b2bCollaborationGuest: 'B2B collaboration guest',
  b2bCollaborationMember: 'B2B collaboration member',
  b2bDirectConnectUser: 'B2B direct connect user',
  otherExternalUser: 'Other external user',
  serviceProvider: 'Service provider',
}

const tokenFromValue = (value) => {
  if (typeof value !== 'string' || !value.includes(':')) return null
  return value.slice(value.indexOf(':') + 1)
}

export const formatGuestTypes = (raw) => {
  if (!raw || typeof raw !== 'string') return null
  return raw
    .split(',')
    .map((part) => GUEST_TYPE_LABELS[part.trim()] || part.trim())
    .filter(Boolean)
    .join(', ')
}

/**
 * Turn a CA coverage reason object into a short human-readable sentence.
 */
const formatViaNestedNames = (viaNestedGroups) =>
  (Array.isArray(viaNestedGroups) ? viaNestedGroups : [])
    .map((group) => group?.name || group?.displayName)
    .filter(Boolean)
    .join(', ')

const parseReasonNames = (reason) => {
  const { type, label, value, viaNestedGroups } = reason || {}
  const token = tokenFromValue(value)
  const groupName = label?.match(/^Group:\s*(.+?)(\s*\(nested\))?$/i)?.[1]?.trim()
  const roleViaGroup = label?.match(/^Role:\s*(.+?)\s+via group\s+(.+)$/i)
  const roleName = roleViaGroup
    ? roleViaGroup[1].trim()
    : label?.match(/^Role:\s*(.+)$/i)?.[1]?.trim()
  const roleGroupName = roleViaGroup?.[2]?.trim() || reason?.viaGroupLabel
  const guestTypesRaw =
    label?.match(/^Guest types:\s*(.+)$/i)?.[1]?.trim() || (type?.includes('Guests') ? token : null)
  const viaNested = (Array.isArray(viaNestedGroups) ? viaNestedGroups : [])
    .map((group) => ({
      id: group?.id,
      name: group?.name || group?.displayName || group?.id,
    }))
    .filter((group) => group.name)

  return {
    token,
    groupName,
    roleName,
    roleGroupName,
    guestTypesRaw,
    viaNested,
    viaNestedNames: formatViaNestedNames(viaNestedGroups),
  }
}

const textPart = (value) => ({ type: 'text', value })
const entityPart = (kind, name, id) => ({ type: kind, name, id: id || null })

/**
 * Sentence parts for rich why-drawer rendering (text + linkable group/role chips).
 * formatCaCoverageReason joins these for plain-text contexts (grid/export).
 */
export const getCaCoverageReasonParts = (reason) => {
  if (!reason || typeof reason !== 'object') return []

  const { type, label, transitive, id, viaGroupId, value } = reason
  const { token, groupName, roleName, roleGroupName, guestTypesRaw, viaNested } =
    parseReasonNames(reason)

  switch (type) {
    case 'includeUsers':
      if (token === 'All') return [textPart('Policy includes all users')]
      if (token === 'GuestsOrExternalUsers') {
        return [textPart('Matched as guest or external user')]
      }
      return [textPart('Listed directly under Include users')]

    case 'excludeUsers':
      if (token === 'GuestsOrExternalUsers') {
        return [textPart('Excluded as guest or external user')]
      }
      return [textPart('Listed directly under Exclude users')]

    case 'includeGroups': {
      if (!groupName) return [textPart(label || 'Member of an included group')]
      const parts = [textPart('Member of group '), entityPart('group', groupName, id)]
      if (viaNested.length) {
        parts.push(textPart(viaNested.length === 1 ? ' via nested group ' : ' via nested groups '))
        viaNested.forEach((group, index) => {
          if (index > 0) parts.push(textPart(', '))
          parts.push(entityPart('group', group.name, group.id))
        })
      } else if (transitive) {
        parts.push(textPart(' via a nested group'))
      }
      return parts
    }

    case 'excludeGroups': {
      if (!groupName) return [textPart(label || 'Excluded as member of a group')]
      const parts = [
        textPart('Excluded as member of group '),
        entityPart('group', groupName, id),
      ]
      if (viaNested.length) {
        parts.push(textPart(viaNested.length === 1 ? ' via nested group ' : ' via nested groups '))
        viaNested.forEach((group, index) => {
          if (index > 0) parts.push(textPart(', '))
          parts.push(entityPart('group', group.name, group.id))
        })
      } else if (transitive) {
        parts.push(textPart(' via a nested group'))
      }
      return parts
    }

    case 'includeRoles': {
      if (!roleName) return [textPart(label || 'Has an included directory role')]
      const parts = [
        textPart('Has directory role '),
        entityPart('role', roleName, id),
      ]
      if (roleGroupName) {
        parts.push(textPart(' via group '))
        parts.push(entityPart('group', roleGroupName, viaGroupId))
        if (viaNested.length) {
          parts.push(textPart(viaNested.length === 1 ? ' via nested group ' : ' via nested groups '))
          viaNested.forEach((group, index) => {
            if (index > 0) parts.push(textPart(', '))
            parts.push(entityPart('group', group.name, group.id))
          })
        }
      }
      return parts
    }

    case 'excludeRoles': {
      if (!roleName) return [textPart(label || 'Excluded because of a directory role')]
      const parts = [
        textPart('Excluded because of directory role '),
        entityPart('role', roleName, id),
      ]
      if (roleGroupName) {
        parts.push(textPart(' via group '))
        parts.push(entityPart('group', roleGroupName, viaGroupId))
        if (viaNested.length) {
          parts.push(textPart(viaNested.length === 1 ? ' via nested group ' : ' via nested groups '))
          viaNested.forEach((group, index) => {
            if (index > 0) parts.push(textPart(', '))
            parts.push(entityPart('group', group.name, group.id))
          })
        }
      }
      return parts
    }

    case 'includeGuestsOrExternalUsers': {
      const types = formatGuestTypes(guestTypesRaw)
      return [
        textPart(
          types
            ? `Included as guest or external user (${types})`
            : 'Included as guest or external user'
        ),
      ]
    }

    case 'excludeGuestsOrExternalUsers': {
      const types = formatGuestTypes(guestTypesRaw)
      return [
        textPart(
          types
            ? `Excluded as guest or external user (${types})`
            : 'Excluded as guest or external user'
        ),
      ]
    }

    default:
      return [textPart(label || value || type || '')]
  }
}

export const formatCaCoverageReason = (reason) =>
  getCaCoverageReasonParts(reason)
    .map((part) => (part.type === 'text' ? part.value : part.name))
    .join('')

export const formatCaCoverageReasons = (reasons) =>
  (Array.isArray(reasons) ? reasons : []).map(formatCaCoverageReason).filter(Boolean)

export const formatCaCoverageStatus = (status) => {
  if (status === 'covered') return 'Covered by this policy'
  if (status === 'excluded') return 'Excluded from this policy'
  return status || ''
}

const REASON_TYPE_META = {
  includeUsers: {
    chip: 'Include users',
    tooltip:
      'This identity is listed under Include users on the policy, or matched a special token such as All or Guests or external users.',
  },
  excludeUsers: {
    chip: 'Exclude users',
    tooltip:
      'This identity is listed under Exclude users on the policy, or matched a guest or external users token there.',
  },
  includeGroups: {
    chip: 'Include groups',
    tooltip:
      'This identity is a member of a group under Include groups. Nested group membership counts.',
  },
  excludeGroups: {
    chip: 'Exclude groups',
    tooltip:
      'This identity is a member of a group under Exclude groups. Nested group membership counts.',
  },
  includeRoles: {
    chip: 'Include roles',
    tooltip:
      'This identity has a directory role under Include roles, either assigned directly or through a group that holds the role.',
  },
  excludeRoles: {
    chip: 'Exclude roles',
    tooltip:
      'This identity has a directory role under Exclude roles, either assigned directly or through a group that holds the role.',
  },
  includeGuestsOrExternalUsers: {
    chip: 'Include guests',
    tooltip:
      'This identity matched the Include guests or external users block on the policy.',
  },
  excludeGuestsOrExternalUsers: {
    chip: 'Exclude guests',
    tooltip:
      'This identity matched the Exclude guests or external users block on the policy.',
  },
}

/**
 * Chip label + tooltip for a coverage reason type (used in the why drawer).
 */
export const getCaCoverageReasonTypeMeta = (reason) => {
  const type = reason?.type
  if (type && REASON_TYPE_META[type]) return REASON_TYPE_META[type]
  return {
    chip: type || 'Assignment',
    tooltip: 'How this identity was matched on the policy assignment.',
  }
}

const GUID_PATTERN = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i

/**
 * Concrete targets on a reason (group / role / via-group) for chips and deep links.
 */
export const getCaCoverageReasonTargets = (reason) => {
  if (!reason || typeof reason !== 'object') return []

  const { type, label, id, transitive, viaGroupId, viaGroupLabel, value } = reason
  const targets = []
  const token = tokenFromValue(value)

  const groupName = label?.match(/^Group:\s*(.+?)(\s*\(nested\))?$/i)?.[1]?.trim()
  const roleViaGroup = label?.match(/^Role:\s*(.+?)\s+via group\s+(.+)$/i)
  const roleName = roleViaGroup
    ? roleViaGroup[1].trim()
    : label?.match(/^Role:\s*(.+)$/i)?.[1]?.trim()
  const roleGroupName = roleViaGroup?.[2]?.trim() || viaGroupLabel

  if (type === 'includeGroups' || type === 'excludeGroups') {
    if (id || groupName) {
      targets.push({
        kind: 'group',
        id: GUID_PATTERN.test(id) ? id : null,
        name: groupName || id,
        nested: Boolean(transitive),
      })
    }
    for (const via of Array.isArray(reason.viaNestedGroups) ? reason.viaNestedGroups : []) {
      if (!via?.id && !via?.name && !via?.displayName) continue
      targets.push({
        kind: 'group',
        id: GUID_PATTERN.test(via.id) ? via.id : null,
        name: via.name || via.displayName || via.id,
        nested: true,
        viaNested: true,
      })
    }
    return targets
  }

  if (type === 'includeRoles' || type === 'excludeRoles') {
    if (id || roleName) {
      targets.push({
        kind: 'role',
        id: GUID_PATTERN.test(id) ? id : null,
        name: roleName || id,
        nested: false,
      })
    }
    if (viaGroupId || roleGroupName) {
      targets.push({
        kind: 'group',
        id: GUID_PATTERN.test(viaGroupId) ? viaGroupId : null,
        name: roleGroupName || viaGroupId,
        nested: false,
        viaRole: true,
      })
    }
    return targets
  }

  if (
    (type === 'includeUsers' || type === 'excludeUsers') &&
    token &&
    !GUID_PATTERN.test(token) &&
    token !== 'None'
  ) {
    targets.push({
      kind: 'token',
      id: null,
      name: token === 'All' ? 'All users' : token === 'GuestsOrExternalUsers' ? 'Guests or external users' : token,
      nested: false,
    })
  }

  return targets
}


