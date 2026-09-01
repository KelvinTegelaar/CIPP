const RECYCLE_BIN_CAP = 500

const STAGE_LABELS = {
  all: null,
  first: 'First Stage',
  second: 'Second Stage',
}

/**
 * Pathname segments of a SharePoint site webUrl (no leading empty).
 * e.g. https://contoso.sharepoint.com/sites/Foo → ['sites','Foo']
 */
export function sitePathSegments(siteWebUrl) {
  if (!siteWebUrl || typeof siteWebUrl !== 'string') return []
  try {
    const { pathname } = new URL(siteWebUrl)
    return pathname
      .split('/')
      .map((s) => decodeURIComponent(s))
      .filter(Boolean)
  } catch {
    return []
  }
}

/**
 * Split a recycle-bin DirName into segments and strip the site collection prefix when present.
 */
export function normalizeDirSegments(dirName, siteWebUrl) {
  const raw = (dirName ?? '')
    .toString()
    .replace(/\\/g, '/')
    .split('/')
    .map((s) => {
      try {
        return decodeURIComponent(s.trim())
      } catch {
        return s.trim()
      }
    })
    .filter(Boolean)

  const siteSegs = sitePathSegments(siteWebUrl)
  if (
    siteSegs.length > 0 &&
    raw.length >= siteSegs.length &&
    siteSegs.every((seg, i) => seg.toLowerCase() === raw[i].toLowerCase())
  ) {
    return raw.slice(siteSegs.length)
  }
  return raw
}

/**
 * Prefer library display name / URL path after the site as a DirName prefix for seeding.
 */
export function libraryRecyclePathSeed(library, siteWebUrl) {
  if (!library) return []
  const fromUrl = normalizeDirSegments(
    (() => {
      try {
        if (!library.webUrl) return ''
        const { pathname } = new URL(library.webUrl)
        // Drop /Forms/... list UI suffix if present
        const cleaned = pathname.replace(/\/Forms\/.*$/i, '')
        return cleaned.replace(/^\//, '');
      } catch {
        return ''
      }
    })(),
    siteWebUrl
  )
  if (fromUrl.length) return fromUrl
  const name = (library.displayName ?? library.name ?? '').trim()
  return name ? [name] : []
}

function pathKey(segments) {
  return segments.join('/')
}

function matchesStage(item, recycleStage) {
  const expected = STAGE_LABELS[recycleStage] ?? null
  if (!expected) return true
  return (item?.ItemState ?? item?.itemState) === expected
}

function isFolderItemType(itemType) {
  const t = (itemType ?? '').toString().toLowerCase()
  return t === 'folder'
}

function toLeaf(item) {
  return {
    id: item.Id,
    type: 'recycleItem',
    displayName: item.LeafName ?? item.Title ?? 'Item',
    leafName: item.LeafName ?? item.Title ?? 'Item',
    canOpen: false,
    storageUsedInBytes: item.Size ?? null,
    webUrl: null,
    siteType: item.ItemType ?? 'Unknown',
    createdDateTime: item.DeletedDate,
    deletedByName: item.DeletedByName ?? '—',
    itemState: item.ItemState ?? '—',
    dirName: item.DirName ?? '',
    fileCount: null,
  }
}

function toFolder(fullSegments, segment, restoreSource = null) {
  const fullDirName = pathKey(fullSegments)
  const base = {
    id: restoreSource?.Id ? restoreSource.Id : `dir:${fullDirName}`,
    type: 'recycleFolder',
    displayName: segment,
    canOpen: true,
    storageUsedInBytes: restoreSource?.Size ?? null,
    webUrl: null,
    siteType: 'Folder',
    createdDateTime: restoreSource?.DeletedDate ?? null,
    deletedByName: restoreSource?.DeletedByName ?? null,
    itemState: restoreSource?.ItemState ?? null,
    dirName: fullDirName,
    fileCount: null,
    // Real SPO deleted-folder row (if present) — RestoreByIds can restore this object.
    canRestore: Boolean(restoreSource?.Id),
    leafName: restoreSource
      ? (restoreSource.LeafName ?? restoreSource.Title ?? segment)
      : segment,
  }
  return base
}

function underPath(itemKey, prefixKey) {
  if (!prefixKey) return true
  return itemKey === prefixKey || itemKey.startsWith(`${prefixKey}/`)
}

function attachRestoreSource(folder, item) {
  if (!folder || !item?.Id) return folder
  if (folder.canRestore) return folder
  return {
    ...folder,
    id: item.Id,
    canRestore: true,
    leafName: item.LeafName ?? item.Title ?? folder.displayName,
    storageUsedInBytes: item.Size ?? null,
    createdDateTime: item.DeletedDate ?? null,
    deletedByName: item.DeletedByName ?? null,
    itemState: item.ItemState ?? null,
  }
}

/**
 * Project a flat ListSiteRecycleBin Results list into FolderView rows at recyclePath.
 *
 * @param {object[]} results - API Results array
 * @param {object} options
 * @param {string[]} [options.recyclePath=[]] - current DirName segments under the site
 * @param {'all'|'first'|'second'} [options.recycleStage='all']
 * @param {'folders'|'list'} [options.recycleView='folders'] - folders = drill-in; list = flat leaves under path
 * @param {string} [options.siteWebUrl] - used to strip site prefix from DirName
 * @returns {{ items: object[], capped: boolean, totalMatching: number }}
 */
export function projectRecycleBinTree(
  results,
  { recyclePath = [], recycleStage = 'all', recycleView = 'folders', siteWebUrl } = {}
) {
  const list = Array.isArray(results) ? results : []
  const capped = list.length >= RECYCLE_BIN_CAP
  const staged = list.filter((item) => matchesStage(item, recycleStage))
  const depth = recyclePath.length
  const prefixKey = pathKey(recyclePath).toLowerCase()

  // Flat list: every leaf under the current site/folder scope (no synthetic folders).
  if (recycleView === 'list') {
    const leaves = []
    for (const item of staged) {
      const segs = normalizeDirSegments(item.DirName, siteWebUrl)
      const itemKey = pathKey(segs).toLowerCase()
      if (!underPath(itemKey, prefixKey)) continue
      const leaf = toLeaf(item)
      const relative =
        depth === 0 ? pathKey(segs) : pathKey(segs.slice(depth))
      leaf.relativePath = relative || '—'
      leaves.push(leaf)
    }
    return {
      items: leaves,
      capped,
      totalMatching: staged.length,
    }
  }

  const folderMap = new Map()
  const leaves = []

  for (const item of staged) {
    const segs = normalizeDirSegments(item.DirName, siteWebUrl)
    const itemKey = pathKey(segs).toLowerCase()
    const leafName = (item.LeafName ?? item.Title ?? '').toString()

    if (depth === 0) {
      if (segs.length === 0) {
        // Deleted folder at site root → restorable drill-in row, not a plain leaf.
        if (isFolderItemType(item.ItemType) && leafName) {
          const full = [leafName]
          const key = pathKey(full).toLowerCase()
          const existing = folderMap.get(key)
          folderMap.set(
            key,
            existing
              ? attachRestoreSource(existing, item)
              : toFolder(full, leafName, item)
          )
        } else {
          leaves.push(toLeaf(item))
        }
      } else {
        const segment = segs[0]
        const full = [segment]
        const key = pathKey(full).toLowerCase()
        if (!folderMap.has(key)) folderMap.set(key, toFolder(full, segment))
      }
      continue
    }

    if (!underPath(itemKey, prefixKey) && itemKey !== prefixKey) continue

    // Exact parent DirName → item lives in this folder.
    if (itemKey === prefixKey) {
      if (isFolderItemType(item.ItemType) && leafName) {
        const full = [...recyclePath, leafName]
        const key = pathKey(full).toLowerCase()
        const existing = folderMap.get(key)
        folderMap.set(
          key,
          existing
            ? attachRestoreSource(existing, item)
            : toFolder(full, leafName, item)
        )
      } else {
        leaves.push(toLeaf(item))
      }
      continue
    }

    // Deeper child: next path segment becomes a synthetic (or later enriched) folder.
    const expected = prefixKey.length ? `${prefixKey}/` : ''
    if (!itemKey.startsWith(expected)) continue
    const rest = segs.slice(depth)
    if (rest.length === 0) continue
    const segment = rest[0]
    const full = [...recyclePath, segment]
    const key = pathKey(full).toLowerCase()
    if (!folderMap.has(key)) folderMap.set(key, toFolder(full, segment))
  }

  const folders = [...folderMap.values()].sort((a, b) =>
    a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' })
  )

  return {
    items: [...folders, ...leaves],
    capped,
    totalMatching: staged.length,
  }
}

/**
 * All recycle-bin API rows for a folder path: the folder object (if present) plus every
 * item whose DirName is that folder or nested under it.
 */
export function collectItemsUnderRecyclePath(
  results,
  folderSegments,
  { siteWebUrl, recycleStage = 'all' } = {}
) {
  const segments = Array.isArray(folderSegments)
    ? folderSegments.filter(Boolean)
    : String(folderSegments ?? '')
        .split('/')
        .filter(Boolean)
  if (!segments.length) return []

  const list = Array.isArray(results) ? results : []
  const staged = list.filter((item) => matchesStage(item, recycleStage))
  const folderKey = pathKey(segments).toLowerCase()
  const parentKey = pathKey(segments.slice(0, -1)).toLowerCase()
  const folderLeaf = segments[segments.length - 1]
  const folderLeafLower = folderLeaf.toLowerCase()

  const out = []
  const seen = new Set()

  for (const item of staged) {
    if (!item?.Id || seen.has(item.Id)) continue
    const segs = normalizeDirSegments(item.DirName, siteWebUrl)
    const itemKey = pathKey(segs).toLowerCase()
    const leafName = (item.LeafName ?? item.Title ?? '').toString()

    const isFolderObject =
      leafName.toLowerCase() === folderLeafLower && itemKey === parentKey
    const isUnderFolder =
      itemKey === folderKey || itemKey.startsWith(`${folderKey}/`)

    if (!isFolderObject && !isUnderFolder) continue
    seen.add(item.Id)
    out.push(toLeaf(item))
  }

  return out
}

/**
 * Expand selected explorer rows into concrete recycle-bin items for RestoreByIds.
 * Folders expand to the folder object + all contents under that path (within the loaded set).
 */
export function expandRecycleRestoreRows(
  results,
  rows,
  { siteWebUrl, recycleStage = 'all' } = {}
) {
  const selected = Array.isArray(rows) ? rows : [rows]
  const seen = new Set()
  const items = []
  let folderLabel = null

  for (const row of selected) {
    if (!row) continue
    if (row.type === 'recycleFolder') {
      const segs = (row.dirName ?? '')
        .toString()
        .split('/')
        .filter(Boolean)
      if (!folderLabel && row.displayName) folderLabel = row.displayName
      for (const item of collectItemsUnderRecyclePath(results, segs, {
        siteWebUrl,
        recycleStage,
      })) {
        if (seen.has(item.id)) continue
        seen.add(item.id)
        items.push(item)
      }
      continue
    }
    if (row.type === 'recycleItem' && row.id && !seen.has(row.id)) {
      seen.add(row.id)
      items.push(row)
    }
  }

  return { items, folderLabel }
}

export { RECYCLE_BIN_CAP }
