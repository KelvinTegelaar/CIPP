/**
 * Permission rule helpers for custom roles.
 *
 * Rules use the same include/exclude glob format as base roles (cipp-roles.json):
 * patterns match against "Category.Object.Read|ReadWrite" strings, exclude wins.
 * Matching mirrors PowerShell -like: * is the only wildcard, case-insensitive.
 */

const escapeRegex = (str) => str.replace(/[.+?^${}()|[\]\\]/g, '\\$&')

export const matchPattern = (pattern, value) => {
  if (typeof pattern !== 'string' || typeof value !== 'string') return false
  const regex = new RegExp(
    `^${escapeRegex(pattern).replace(/\*/g, '.*')}$`,
    'i'
  )
  return regex.test(value)
}

// Flatten the ExecAPIPermissionList tree ({Cat: {Obj: {Read|ReadWrite: {...}}}})
// into the sorted list of concrete permission strings.
export const flattenPermissionTree = (apiPermissions) => {
  const universe = []
  if (!apiPermissions || typeof apiPermissions !== 'object') return universe
  Object.keys(apiPermissions).forEach((cat) => {
    Object.keys(apiPermissions[cat] || {}).forEach((obj) => {
      Object.keys(apiPermissions[cat][obj] || {}).forEach((type) => {
        universe.push(`${cat}.${obj}.${type}`)
      })
    })
  })
  return universe.sort()
}

const normalizeRuleList = (list) =>
  (Array.isArray(list) ? list : [])
    .map((entry) => (typeof entry === 'string' ? entry : entry?.value))
    .filter((entry) => typeof entry === 'string' && entry.length > 0)

/**
 * Expand include/exclude rules over a permission universe.
 * Returns the matched permissions plus per-pattern stats for the live preview:
 * - includeCounts: pattern -> total universe matches
 * - excludeCounts: pattern -> included permissions this pattern removed
 * - excludedBy: permission -> first exclude pattern that removed it
 */
export const expandRules = (rules, universe) => {
  const include = normalizeRuleList(rules?.Include)
  const exclude = normalizeRuleList(rules?.Exclude)
  const includeCounts = {}
  const excludeCounts = {}
  const excludedBy = {}
  include.forEach((pattern) => (includeCounts[pattern] = 0))
  exclude.forEach((pattern) => (excludeCounts[pattern] = 0))

  const matched = []
  ;(universe || []).forEach((permission) => {
    let included = false
    include.forEach((pattern) => {
      if (matchPattern(pattern, permission)) {
        includeCounts[pattern] += 1
        included = true
      }
    })
    if (!included) return
    const excludedByPattern = exclude.find((pattern) =>
      matchPattern(pattern, permission)
    )
    if (excludedByPattern !== undefined) {
      excludeCounts[excludedByPattern] += 1
      excludedBy[permission] = excludedByPattern
      return
    }
    matched.push(permission)
  })

  return { matched, includeCounts, excludeCounts, excludedBy }
}

/**
 * Convert rules into the flat editor/storage map: { "CatObj": "Cat.Obj.None|Read|ReadWrite" }.
 * ReadWrite beats Read; CIPP.Core is floored at Read (login breaks without it).
 */
export const rulesToFlatMap = (rules, apiPermissions) => {
  const flat = {}
  if (!apiPermissions || typeof apiPermissions !== 'object') return flat
  const include = normalizeRuleList(rules?.Include)
  const exclude = normalizeRuleList(rules?.Exclude)

  const granted = (permission) =>
    include.some((pattern) => matchPattern(pattern, permission)) &&
    !exclude.some((pattern) => matchPattern(pattern, permission))

  Object.keys(apiPermissions).forEach((cat) => {
    Object.keys(apiPermissions[cat] || {}).forEach((obj) => {
      let level = 'None'
      if (granted(`${cat}.${obj}.ReadWrite`)) {
        level = 'ReadWrite'
      } else if (granted(`${cat}.${obj}.Read`)) {
        level = 'Read'
      }
      if (cat === 'CIPP' && obj === 'Core' && level === 'None') {
        level = 'Read'
      }
      flat[`${cat}${obj}`] = `${cat}.${obj}.${level}`
    })
  })
  return flat
}

// Convert the flat map back into concrete-string rules (the canonical storage
// format for advanced-mode roles): Include = explicit non-None values.
export const flatMapToRules = (flatMap) => {
  const include = [
    ...new Set(
      Object.values(flatMap || {}).filter(
        (value) =>
          typeof value === 'string' &&
          value.length > 0 &&
          !value.endsWith('.None')
      )
    ),
  ].sort()
  return { Include: include, Exclude: [] }
}

// 1-3 dot-separated segments of letters/digits/wildcards, e.g. "*", "*.Read",
// "Identity.User.*", "Identity.User.ReadWrite". Same grammar the backend enforces.
export const validateRulePattern = (str) =>
  typeof str === 'string' && /^[A-Za-z0-9*]+(\.[A-Za-z0-9*]+){0,2}$/.test(str)

// Suggestion options for the rule autocompletes, grouped for CippAutocompleteGrouping.
export const buildRuleSuggestions = (apiPermissions) => {
  const suggestions = [
    { label: '* (everything)', value: '*', category: 'Global' },
    { label: '*.Read (all read-only)', value: '*.Read', category: 'Global' },
    {
      label: '*.ReadWrite (all read/write)',
      value: '*.ReadWrite',
      category: 'Global',
    },
  ]
  if (!apiPermissions || typeof apiPermissions !== 'object') return suggestions
  Object.keys(apiPermissions)
    .sort()
    .forEach((cat) => {
      suggestions.push({
        label: `${cat}.* (entire category)`,
        value: `${cat}.*`,
        category: cat,
      })
      suggestions.push({
        label: `${cat}.*.Read`,
        value: `${cat}.*.Read`,
        category: cat,
      })
      suggestions.push({
        label: `${cat}.*.ReadWrite`,
        value: `${cat}.*.ReadWrite`,
        category: cat,
      })
      Object.keys(apiPermissions[cat] || {})
        .sort()
        .forEach((obj) => {
          suggestions.push({
            label: `${cat}.${obj}.*`,
            value: `${cat}.${obj}.*`,
            category: cat,
          })
          Object.keys(apiPermissions[cat][obj] || {}).forEach((type) => {
            suggestions.push({
              label: `${cat}.${obj}.${type}`,
              value: `${cat}.${obj}.${type}`,
              category: cat,
            })
          })
        })
    })
  return suggestions
}
