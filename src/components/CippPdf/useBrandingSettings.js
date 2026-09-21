import { useMemo } from 'react'
import axios from 'axios'
import { ApiGetCall } from '../../api/ApiCall'
import { buildVersionedHeaders } from '../../utils/cippVersion'
import { impersonationCacheParams } from '../../utils/impersonation'
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

// Matches ApiGetCall's default, so the hook and the on-demand read agree on one cache entry.
const BRANDING_STALE_TIME = 300000

// The endpoint answers 200 with no body when branding cannot be read.
const normalizeBranding = (data) =>
  !data || typeof data !== 'object' || Array.isArray(data) ? DEFAULT_BRANDING : data

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

  return useMemo(() => normalizeBranding(branding.data), [branding.data])
}

/**
 * Read the branding at the moment an export runs, for the table toolbar's PDF buttons: those sit on
 * every grid, so holding the hook there fetched branding - logo and cover images inline - on every
 * table mount. Shares the hook's cache entry, so a page that already read branding costs no request.
 */
export const fetchBrandingSettings = async (queryClient) => {
  try {
    const data = await queryClient.fetchQuery({
      queryKey: [BRANDING_QUERY_KEY],
      queryFn: async () => {
        const response = await axios.get('/api/ListBrandingSettings', {
          params: impersonationCacheParams(),
          headers: await buildVersionedHeaders(),
          cippQueryKey: BRANDING_QUERY_KEY,
        })
        return response.data
      },
      staleTime: BRANDING_STALE_TIME,
    })
    return normalizeBranding(data)
  } catch {
    // An export in CIPP's own colours beats no export at all.
    return DEFAULT_BRANDING
  }
}

export default useBrandingSettings
