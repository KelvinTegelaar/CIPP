import { resolveRowTemplates, getRowTenant } from '../../utils/resolve-row-templates'

const UNRESOLVED = /\[([^\]]+)\]/

const resolveEffectiveTenant = (row, { fallbackTenant, currentTenant } = {}) => {
  if (fallbackTenant && fallbackTenant !== 'AllTenants') {
    return fallbackTenant
  }
  const fromRow = getRowTenant(row, currentTenant ?? 'AllTenants')
  if (fromRow && fromRow !== 'AllTenants') {
    return fromRow
  }
  if (currentTenant && currentTenant !== 'AllTenants') {
    return currentTenant
  }
  return null
}

const applyTenantFallback = (link, row, options) => {
  if (!link.includes('[Tenant]') && !link.includes('[tenantId]')) {
    return link
  }
  const tenant = resolveEffectiveTenant(row, options)
  if (!tenant) {
    return link
  }
  return link
    .replace(/\[Tenant\]/g, tenant)
    .replace(/\[tenantId\]/g, tenant);
}

export const rowOpenEnabled = (rowOpen, row) => {
  if (!rowOpen || !row) {
    return false
  }
  if (typeof rowOpen.condition === 'function' && !rowOpen.condition(row)) {
    return false
  }
  if (typeof rowOpen.onOpen === 'function') {
    return true
  }
  if (typeof rowOpen.link === 'string' && rowOpen.link.length > 0) {
    return true
  }
  return false
}

export const resolveRowOpenLink = (rowOpen, row, options = {}) => {
  if (!rowOpen?.link || !row) {
    return null
  }
  let link = resolveRowTemplates(rowOpen.link, row)
  link = applyTenantFallback(link, row, options)
  if (UNRESOLVED.test(link)) {
    return null
  }
  return link
}

export const resolveActionLink = (action, row, options = {}) => {
  if (!action?.link || !row) {
    return null
  }
  let link = resolveRowTemplates(action.link, row)
  link = applyTenantFallback(link, row, options)
  if (UNRESOLVED.test(link)) {
    return null
  }
  return link
}

export const actionMatchesRowOpen = (action, rowOpen, row, options = {}) => {
  if (!action?.link || !rowOpen?.link) {
    return false
  }
  if (action.link === rowOpen.link) {
    return true
  }
  const actionLink = resolveActionLink(action, row, options)
  const rowOpenLink = resolveRowOpenLink(rowOpen, row, options)
  return Boolean(actionLink && rowOpenLink && actionLink === rowOpenLink)
}

export const isPinnedRowAction = (action) => Boolean(action?.pinned)

export const filterVisibleRowActions = (actions, row) =>
  (actions ?? []).filter(
    (action) =>
      typeof action.hideCondition !== 'function' || !action.hideCondition(row)
  )

export const findRowOpenMatchingAction = (actions, rowOpen, row, options = {}) => {
  if (!Array.isArray(actions) || !rowOpen?.link) {
    return null
  }
  return (
    actions.find((action) => actionMatchesRowOpen(action, rowOpen, row, options)) ??
    null
  )
}

export const partitionRowMenuActions = (actions) => {
  const visible = Array.isArray(actions) ? actions : []
  // Preserve declaration order within each partition (not alpha/priority sorted).
  const pinnedActions = visible.filter(isPinnedRowAction)
  const menuActions = visible.filter((action) => !isPinnedRowAction(action))
  return { pinnedActions, menuActions }
}

export const resolveRowOpenHref = (rowOpen, row, options = {}) => {
  const link = resolveRowOpenLink(rowOpen, row, options)
  if (!link) {
    return null
  }
  if (/^https?:\/\//i.test(link)) {
    return link
  }
  if (typeof window !== 'undefined') {
    const path = link.startsWith('/') ? link : `/${link}`
    return `${window.location.origin}${path}`
  }
  return link
}

export const rowOpenSupportsNewTab = (rowOpen, row, options = {}) =>
  Boolean(resolveRowOpenLink(rowOpen, row, options))

export const dispatchRowOpen = (rowOpen, row, router, options = {}) => {
  if (!rowOpenEnabled(rowOpen, row)) {
    return false
  }

  if (typeof rowOpen.onOpen === 'function') {
    rowOpen.onOpen(row)
    return true
  }

  const link = resolveRowOpenLink(rowOpen, row, options)
  if (!link) {
    return false
  }

  const { newTab = false } = options

  if (newTab || rowOpen.external) {
    const href = resolveRowOpenHref(rowOpen, row, options)
    window.open(href, rowOpen.target || '_blank', 'noopener,noreferrer')
    return true
  }

  if (link.startsWith('/')) {
    router.push(link, undefined, { shallow: rowOpen.shallow ?? true })
  } else {
    window.open(link, rowOpen.target || '_blank', 'noopener,noreferrer')
  }
  return true
}
