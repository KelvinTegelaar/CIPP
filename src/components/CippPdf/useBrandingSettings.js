import { useMemo } from 'react'
import { ApiGetCall } from '../../api/ApiCall'
import { DEFAULT_COVER_STOCK } from './resolveCoverImage'

/**
 * The branding a report is drawn with, before any preset is applied.
 *
 * What every consumer sees when branding has not loaded yet — or cannot be read at all. A report
 * rendered in CIPP's own colours is worth far more than one that fails to render, so nothing here
 * waits on the fetch.
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
 * The react-query keys branding is cached under. Invalidate both after any branding write —
 * `relatedQueryKeys: ['BrandingSettings*']` covers them with one entry.
 *
 * Two keys because they are two different payloads: the gallery form carries every uploaded logo
 * and cover inline, which is megabytes, and only the settings page needs it.
 */
export const BRANDING_QUERY_KEY = 'BrandingSettings'
export const BRANDING_GALLERY_QUERY_KEY = 'BrandingSettings-gallery'

/**
 * Read the report branding.
 *
 * Branding used to live on `useSettings().customBranding`, filled in by ListUserSettings. That put
 * every uploaded cover image — inline base64 data URLs, megabytes of them — into a response fetched
 * on every page load, for the benefit of the handful of screens that draw a PDF. It also meant the
 * branding a report used and the branding the settings page was editing were the same mutable blob
 * of client state, kept in step by an effect.
 *
 * Now it is a request, made by the components that need it, cached by react-query and shared
 * between them. `relatedQueryKeys: [BRANDING_QUERY_KEY]` on a write is what refreshes it.
 */
export const useBrandingSettings = ({ waiting = true, includeGallery = false } = {}) => {
  const branding = ApiGetCall({
    url: '/api/ListBrandingSettings',
    // Only the settings page asks for the galleries. A report needs the logo and cover that are
    // selected, and those come back either way.
    data: includeGallery ? { includeGallery: true } : undefined,
    queryKey: includeGallery ? BRANDING_GALLERY_QUERY_KEY : BRANDING_QUERY_KEY,
    waiting,
  })

  return useMemo(() => {
    const data = branding.data
    // The endpoint answers 200 with no body when branding cannot be read, so the app still renders.
    if (!data || typeof data !== 'object' || Array.isArray(data)) return DEFAULT_BRANDING
    return data
  }, [branding.data])
}

export default useBrandingSettings
