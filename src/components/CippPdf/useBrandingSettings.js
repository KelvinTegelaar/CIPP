import { useMemo } from 'react'
import { ApiGetCall } from '../../api/ApiCall'
import { DEFAULT_COVER_STOCK } from './resolveCoverImage'

/**
 * Branding used before the fetch lands, or when it cannot be read at all. Reports render in
 * CIPP's own colours rather than waiting.
 */
export const DEFAULT_BRANDING = Object.freeze({
  colour: '#F77F00',
  secondaryColour: '',
  logoImageId: null,
  logoImageIds: [],
  coverImageId: null,
  coverImageIds: [],
  coverStock: DEFAULT_COVER_STOCK,
  logo: null,
  logoUploads: [],
  coverImage: null,
  coverUploads: [],
  footerText: '',
  coverFooterText: '',
  showFooter: true,
  showPageNumbers: true,
  watermarkText: '',
  watermarkEnabled: true,
  reportDefaults: {},
  roleColours: {},
})

/**
 * Cache keys for the two payloads: with and without the upload galleries. Invalidate both after a
 * branding write with `relatedQueryKeys: ['BrandingSettings*']`.
 */
export const BRANDING_QUERY_KEY = 'BrandingSettings'
export const BRANDING_GALLERY_QUERY_KEY = 'BrandingSettings-gallery'

/**
 * Read the report branding. Replaces `useSettings().customBranding`, which carried inline images
 * on every page load and kept report and settings state in the same mutable blob.
 */
export const useBrandingSettings = ({ waiting = true, includeGallery = false } = {}) => {
  const branding = ApiGetCall({
    url: '/api/ListBrandingSettings',
    // Only the settings page needs the galleries; the selected logo and cover come back either way.
    data: includeGallery ? { includeGallery: true } : undefined,
    queryKey: includeGallery ? BRANDING_GALLERY_QUERY_KEY : BRANDING_QUERY_KEY,
    waiting,
  })

  return useMemo(() => {
    const data = branding.data
    // The endpoint answers 200 with no body when branding cannot be read.
    if (!data || typeof data !== 'object' || Array.isArray(data)) return DEFAULT_BRANDING
    return data
  }, [branding.data])
}

export default useBrandingSettings
