const transforms = new Map()

const newest = (values) =>
  values.reduce((a, b) =>
    new Date(b).getTime() > new Date(a).getTime() ? b : a
  )

// CippDataTable dataTransform: one row per distinct combination of `keys`, listing its tenants.
export const groupRowsBy = (keys) => {
  const fields = (Array.isArray(keys) ? keys : String(keys).split(','))
    .map((k) => k.trim())
    .filter(Boolean)
  const cacheKey = fields.join(',')
  if (transforms.has(cacheKey)) return transforms.get(cacheKey)
  const transform = (rows) => {
    const groups = new Map()
    for (const row of rows ?? []) {
      const id = JSON.stringify(fields.map((f) => row?.[f]))
      if (!groups.has(id)) groups.set(id, [])
      groups.get(id).push(row)
    }
    return [...groups.values()].map((group) => {
      const tenants = [
        ...new Set(group.map((row) => row?.Tenant).filter(Boolean)),
      ]
      const merged = {}
      for (const field of new Set(
        group.flatMap((row) => Object.keys(row ?? {}))
      )) {
        if (field === 'Tenant') continue
        const values = [
          ...new Map(
            group.map((row) => [JSON.stringify(row?.[field]), row?.[field]])
          ).values(),
        ]
        merged[field] =
          values.length === 1
            ? values[0]
            : field === 'CacheTimestamp'
              ? newest(values)
              : values
      }
      return {
        ...merged,
        Tenant: tenants.length > 1 ? `${tenants.length} tenants` : tenants[0],
        Tenants: tenants,
        TenantCount: tenants.length,
      }
    })
  }
  transforms.set(cacheKey, transform)
  return transform
}
