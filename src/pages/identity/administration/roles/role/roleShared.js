// Shared copy for the role detail header chips and field help icons.

export const POLICY_BELOW_FLOOR_TOOLTIP =
  "This role's PIM settings are weaker than CIPP's secure floor: activation must expire within 24 hours and require MFA or an authentication context plus a justification; eligible and active assignments must expire within a year; creating an active assignment requires a justification. Entra defaults often sit below this floor."

export const PRIVILEGED_ROLE_TOOLTIP =
  "This role is on CIPP's privileged-roles list (the same list standards and alerts use) — for example Global, Security, Exchange, SharePoint, User, Conditional Access, and Application administrators."

export const formatPimDuration = (iso) => {
  if (!iso) return 'No expiration (permanent allowed)'
  try {
    // PT8H / P90D / P365D — enough for the values PIM policies use.
    const match = String(iso).match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/i)
    if (!match) return iso
    const days = Number(match[1] || 0)
    const hours = Number(match[2] || 0)
    const minutes = Number(match[3] || 0)
    if (days >= 365 && days % 365 === 0) return `${days / 365} year${days === 365 ? '' : 's'}`
    if (days >= 30 && days % 30 === 0) return `${days / 30} month${days === 30 ? '' : 's'}`
    if (days > 0) return `${days} day${days === 1 ? '' : 's'}`
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'}`
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'}`
    return iso
  } catch {
    return iso
  }
}

export const getRoleRow = (data) =>
  Array.isArray(data)
    ? data[0]
    : data?.Results?.[0] ?? data?.[0]
