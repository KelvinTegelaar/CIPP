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
    .replace(/\[tenantId\]/g, tenant)
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

  if (link.startsWith('/') && !rowOpen.external) {
    router.push(link, undefined, { shallow: rowOpen.shallow ?? true })
  } else {
    window.open(link, rowOpen.target || '_blank', 'noopener,noreferrer')
  }
  return true
}
