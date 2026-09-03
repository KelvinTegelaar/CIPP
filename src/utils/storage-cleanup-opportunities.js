/** Thresholds for storage-report cleanup opportunities (library ceiling). */
export const CLEANUP_THRESHOLDS = {
  versionBytes: 1 * 1024 ** 3, // 1 GB
  versionShareOfParent: 0.2, // 20%
  recycleBytes: 500 * 1024 ** 2, // 500 MB
  largeLibraryBytes: 5 * 1024 ** 3, // 5 GB
  largeLibraryShareOfSite: 0.4, // 40%
  scanSiteLimit: 25,
}

export const formatCleanupBytes = (bytes) => {
  const num = Number(bytes)
  if (!Number.isFinite(num) || num < 0) return '—'
  if (num < 1024) return `${Math.round(num)} B`
  const gb = num / 1024 ** 3
  if (gb >= 0.01) return `${gb.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB`
  const mb = num / 1024 ** 2
  return `${mb.toLocaleString(undefined, { maximumFractionDigits: 1 })} MB`
}

const siteUsedBytes = (site) => {
  const b = Number(site?.storageUsedInBytes)
  if (Number.isFinite(b)) return b
  const gb = Number(site?.storageUsedInGigabytes)
  if (Number.isFinite(gb)) return gb * 1024 ** 3
  return null
}

/**
 * Build ranked actionable cleanup items from site usage + per-site library/recycle scans.
 * @param {object[]} sites - enriched usage rows
 * @param {Record<string, { libraries?: object[], recycle?: object, composition?: object }>} scans - keyed by webUrl
 */
export const buildCleanupOpportunities = (sites, scans = {}) => {
  const items = []
  if (!Array.isArray(sites)) return items

  for (const site of sites) {
    const siteUrl = site?.webUrl
    if (!siteUrl) continue
    const scan = scans[siteUrl] || scans[siteUrl.replace(/\/+$/, '')] || {}
    const libraries = Array.isArray(scan.libraries) ? scan.libraries : []
    const siteBytes = siteUsedBytes(site)
    const displayName = site.displayName || siteUrl

    let siteVersionBytes = 0
    for (const lib of libraries) {
      const versionBytes = Number(lib.versionEstimateBytes)
      const libBytes = Number(lib.storageUsedInBytes)
      if (Number.isFinite(versionBytes) && versionBytes > 0) {
        siteVersionBytes += versionBytes
      }

      const versionHit =
        Number.isFinite(versionBytes) &&
        (versionBytes >= CLEANUP_THRESHOLDS.versionBytes ||
          (Number.isFinite(libBytes) &&
            libBytes > 0 &&
            versionBytes / libBytes >= CLEANUP_THRESHOLDS.versionShareOfParent))

      if (versionHit) {
        items.push({
          id: `versions:${siteUrl}:${lib.id || lib.name}`,
          type: 'versions',
          siteUrl,
          displayName,
          libraryId: lib.id,
          libraryName: lib.displayName || lib.name,
          estimatedBytes: versionBytes,
          percentOfSite:
            siteBytes > 0 ? Math.round((versionBytes / siteBytes) * 1000) / 10 : null,
          recommendedAction: 'versionCleanup',
          severity: versionBytes >= CLEANUP_THRESHOLDS.versionBytes * 5 ? 'high' : 'medium',
          site,
        })
      }

      const largeHit =
        Number.isFinite(libBytes) &&
        (libBytes >= CLEANUP_THRESHOLDS.largeLibraryBytes ||
          (siteBytes > 0 && libBytes / siteBytes >= CLEANUP_THRESHOLDS.largeLibraryShareOfSite))

      if (largeHit) {
        items.push({
          id: `largeLibrary:${siteUrl}:${lib.id || lib.name}`,
          type: 'largeLibrary',
          siteUrl,
          displayName,
          libraryId: lib.id,
          libraryName: lib.displayName || lib.name,
          estimatedBytes: libBytes,
          percentOfSite: siteBytes > 0 ? Math.round((libBytes / siteBytes) * 1000) / 10 : null,
          recommendedAction: 'versionCleanup',
          severity: libBytes >= CLEANUP_THRESHOLDS.largeLibraryBytes * 2 ? 'high' : 'medium',
          site,
        })
      }
    }

    // Site-level version rollup when libraries scanned but no per-lib item fired
    if (
      siteVersionBytes >= CLEANUP_THRESHOLDS.versionBytes &&
      !items.some((i) => i.type === 'versions' && i.siteUrl === siteUrl)
    ) {
      items.push({
        id: `versions:${siteUrl}:site`,
        type: 'versions',
        siteUrl,
        displayName,
        libraryId: null,
        libraryName: null,
        estimatedBytes: siteVersionBytes,
        percentOfSite:
          siteBytes > 0 ? Math.round((siteVersionBytes / siteBytes) * 1000) / 10 : null,
        recommendedAction: 'versionCleanup',
        severity: 'medium',
        site,
      })
    }

    const recycleBytes = Number(
      scan.recycle?.totalBytes ?? scan.composition?.recycleEstimateBytes
    )
    if (Number.isFinite(recycleBytes) && recycleBytes >= CLEANUP_THRESHOLDS.recycleBytes) {
      items.push({
        id: `recycle:${siteUrl}`,
        type: 'recycle',
        siteUrl,
        displayName,
        libraryId: null,
        libraryName: null,
        estimatedBytes: recycleBytes,
        percentOfSite:
          siteBytes > 0 ? Math.round((recycleBytes / siteBytes) * 1000) / 10 : null,
        recommendedAction: 'emptyRecycle',
        severity: recycleBytes >= CLEANUP_THRESHOLDS.recycleBytes * 4 ? 'high' : 'medium',
        site,
        recycle: scan.recycle,
      })
    }
  }

  // Prefer highest estimated reclaim; de-dupe largeLibrary when versions already covers same lib
  const seen = new Set()
  return items
    .sort((a, b) => (b.estimatedBytes || 0) - (a.estimatedBytes || 0))
    .filter((item) => {
      if (item.type === 'largeLibrary') {
        const versionKey = `versions:${item.siteUrl}:${item.libraryId || item.libraryName}`
        if (seen.has(versionKey) || items.some((i) => i.id === versionKey && i !== item)) {
          // Keep large library only if no versions item for same library
          const hasVersion = items.some(
            (i) =>
              i.type === 'versions' &&
              i.siteUrl === item.siteUrl &&
              (i.libraryId === item.libraryId || i.libraryName === item.libraryName)
          )
          if (hasVersion) return false
        }
      }
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
}

/**
 * Sites to scan for opportunities: top by size, near quota, inactive.
 */
export const pickSitesToScan = (sites, { limit = CLEANUP_THRESHOLDS.scanSiteLimit, isSystemSite } = {}) => {
  if (!Array.isArray(sites)) return []
  const eligible = sites.filter((s) => s?.webUrl && !(isSystemSite && isSystemSite(s)))
  const byUrl = new Map()

  const add = (row) => {
    if (!row?.webUrl || byUrl.has(row.webUrl)) return
    byUrl.set(row.webUrl, row)
  }

  ;[...eligible]
    .filter((r) => Number.isFinite(Number(r.storageUsedInGigabytes)))
    .sort((a, b) => Number(b.storageUsedInGigabytes) - Number(a.storageUsedInGigabytes))
    .slice(0, limit)
    .forEach(add)

  eligible.filter((r) => Number.isFinite(r.percentUsed) && r.percentUsed >= 80).forEach(add)

  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000
  eligible
    .filter((r) => {
      if (!r.lastActivityDate) return true
      const t = Date.parse(r.lastActivityDate)
      return !Number.isFinite(t) || t < cutoff
    })
    .slice(0, Math.ceil(limit / 2))
    .forEach(add)

  return [...byUrl.values()].slice(0, limit)
}

/**
 * Roll flat library/site opportunity items into one row per site for the report summary.
 * Reclaim = versions + recycle only (large libraries are watch signals, not reclaim).
 */
export const rollupCleanupBySite = (opportunities = []) => {
  const byUrl = new Map()

  for (const item of opportunities) {
    if (!item?.siteUrl) continue
    let row = byUrl.get(item.siteUrl)
    if (!row) {
      row = {
        id: `site:${item.siteUrl}`,
        siteUrl: item.siteUrl,
        displayName: item.displayName || item.siteUrl,
        site: item.site,
        versionsBytes: 0,
        recycleBytes: 0,
        reclaimBytes: 0,
        hasLargeLibrary: false,
        largeLibraryCount: 0,
        severity: 'medium',
        items: [],
        recommendedAction: null,
      }
      byUrl.set(item.siteUrl, row)
    }

    row.items.push(item)
    if (item.type === 'versions') {
      row.versionsBytes += Number(item.estimatedBytes) || 0
    } else if (item.type === 'recycle') {
      row.recycleBytes += Number(item.estimatedBytes) || 0
    } else if (item.type === 'largeLibrary') {
      row.hasLargeLibrary = true
      row.largeLibraryCount += 1
    }
    if (item.severity === 'high') row.severity = 'high'
  }

  const sites = [...byUrl.values()].map((row) => {
    row.reclaimBytes = row.versionsBytes + row.recycleBytes
    // Prefer the larger reclaimable action when opening the drawer
    if (row.recycleBytes > 0 || row.versionsBytes > 0) {
      row.recommendedAction =
        row.recycleBytes > row.versionsBytes ? 'emptyRecycle' : 'versionCleanup'
    } else if (row.hasLargeLibrary) {
      row.recommendedAction = 'versionCleanup'
    }
    return row
  })

  return sites
    .filter((s) => s.reclaimBytes > 0 || s.hasLargeLibrary)
    .sort((a, b) => (b.reclaimBytes || 0) - (a.reclaimBytes || 0))
}

export const summarizeCleanupSites = (siteRows = []) => {
  let reclaimBytes = 0
  let versionsBytes = 0
  let recycleBytes = 0
  let sitesWithReclaim = 0
  for (const row of siteRows) {
    reclaimBytes += Number(row.reclaimBytes) || 0
    versionsBytes += Number(row.versionsBytes) || 0
    recycleBytes += Number(row.recycleBytes) || 0
    if ((Number(row.reclaimBytes) || 0) > 0) sitesWithReclaim += 1
  }
  return {
    reclaimBytes,
    versionsBytes,
    recycleBytes,
    siteCount: siteRows.length,
    sitesWithReclaim,
  }
}

