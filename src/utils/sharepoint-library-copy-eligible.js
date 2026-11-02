const DENIED_TITLES = new Set([
  'form templates',
  'style library',
  'preservation hold library',
  'site assets',
  'site pages',
])

/**
 * Mirrors Test-CIPPSharePointLibraryCopyEligible.ps1 — keep rules in sync.
 */
export function isSharePointLibraryCopyEligible(library) {
  const template = library?.Template ?? library?.template ?? library?.list?.template
  if (template !== 'documentLibrary') {
    return false
  }
  const title = (library?.Title ?? library?.displayName ?? library?.title ?? '').trim().toLowerCase()
  const name = (library?.Name ?? library?.name ?? '').trim().toLowerCase()
  if (DENIED_TITLES.has(title)) return false
  if (name === 'siteassets') return false
  return true
}

export function filterEligibleCopyLibraries(libraries) {
  if (!Array.isArray(libraries)) return []
  return libraries.filter(isSharePointLibraryCopyEligible)
}
