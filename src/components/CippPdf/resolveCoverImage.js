export const DEFAULT_COVER_STOCK = '/reportImages/soc.jpg'
export const COVER_STOCK_NONE = 'none'
export const COVER_IMAGE_NOT_FOUND = '/reportImages/image-not-found.png'

export const COVER_STOCK_OPTIONS = [
  { key: 'none', path: COVER_STOCK_NONE, label: 'No cover image' },
  { key: 'soc', path: '/reportImages/soc.jpg', label: 'SOC' },
  { key: 'board', path: '/reportImages/board.jpg', label: 'Board' },
  { key: 'glasses', path: '/reportImages/glasses.jpg', label: 'Glasses' },
  { key: 'working', path: '/reportImages/working.jpg', label: 'Working' },
  { key: 'laptop', path: '/reportImages/laptop.jpg', label: 'Laptop' },
  { key: 'city', path: '/reportImages/city.jpg', label: 'City' },
]

/**
 * Normalize image id lists from array, JSON string, or a single id string.
 * PowerShell often serializes a one-item array as a bare string.
 */
const normalizeImageIdList = (ids) => {
  if (ids == null || ids === '') {
    return []
  }
  if (typeof ids === 'string') {
    try {
      const parsed = JSON.parse(ids)
      ids = Array.isArray(parsed) ? parsed : parsed ? [parsed] : []
    } catch {
      ids = [ids]
    }
  }
  if (!Array.isArray(ids)) {
    ids = [ids]
  }
  return ids.filter((id) => typeof id === 'string' && id)
}

export const normalizeCoverImageIds = (brandingSettings) =>
  normalizeImageIdList(brandingSettings?.coverImageIds)

export const normalizeLogoImageIds = (brandingSettings) => {
  const ids = normalizeImageIdList(brandingSettings?.logoImageIds)
  if (ids.length > 0) return ids
  if (brandingSettings?.logoImageId) {
    return [brandingSettings.logoImageId]
  }
  return []
}

const parseUploadsArray = (uploads) => {
  if (uploads == null || uploads === '') {
    return []
  }
  if (typeof uploads === 'string') {
    if (uploads.startsWith('data:image/')) {
      return [uploads]
    }
    try {
      const parsed = JSON.parse(uploads)
      if (Array.isArray(parsed)) return parsed
      if (typeof parsed === 'string' && parsed.startsWith('data:image/')) return [parsed]
      return []
    } catch {
      return []
    }
  }
  return Array.isArray(uploads) ? uploads : []
}

const normalizeUploadsForIds = (uploads, ids, selectedFallback) => {
  let parsed = parseUploadsArray(uploads)
  if (ids.length > 0) {
    return ids.map((_, index) => {
      const item = parsed[index]
      return typeof item === 'string' && item.startsWith('data:image/') ? item : ''
    })
  }
  if (
    typeof selectedFallback === 'string' &&
    selectedFallback.startsWith('data:image/') &&
    !parsed.includes(selectedFallback)
  ) {
    parsed = [selectedFallback, ...parsed]
  }
  return parsed.filter((item) => typeof item === 'string' && item.startsWith('data:image/'))
}

/**
 * Normalize persisted cover upload gallery (array or JSON string).
 * When coverImageIds are present, keep index alignment (empty string = missing/deleted).
 */
export const normalizeCoverUploads = (brandingSettings) =>
  normalizeUploadsForIds(
    brandingSettings?.coverUploads,
    normalizeCoverImageIds(brandingSettings),
    brandingSettings?.coverImage
  )

/**
 * Normalize persisted logo upload gallery.
 * When logoImageIds are present, keep index alignment with logoUploads.
 */
export const normalizeLogoUploads = (brandingSettings) =>
  normalizeUploadsForIds(
    brandingSettings?.logoUploads,
    normalizeLogoImageIds(brandingSettings),
    brandingSettings?.logo
  )

/**
 * Resolve the cover background for report PDFs and the branding preview.
 * Custom upload wins. Missing custom cover id uses the not-found placeholder.
 * Explicit "none" stock means no cover (no fallback).
 * Otherwise selected stock, then the report-specific fallback.
 */
export const resolveCoverImage = (brandingSettings, fallback = DEFAULT_COVER_STOCK) => {
  if (brandingSettings?.coverImage) {
    return brandingSettings.coverImage
  }
  if (brandingSettings?.coverImageId) {
    return COVER_IMAGE_NOT_FOUND
  }
  if (brandingSettings?.coverStock === COVER_STOCK_NONE) {
    return null
  }
  return brandingSettings?.coverStock || fallback
}
