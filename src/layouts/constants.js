// Shared layout chrome dimensions.
//
// These used to be redeclared per file and had drifted apart - layouts/index.js padded the content
// by 50px against a nav that top-nav.js and side-nav.js both rendered at 64px, so content sat 14px
// underneath it. Keep them here so the fixed nav, the side nav, and the content offset can't
// disagree again.

export const TOP_NAV_HEIGHT = 64
export const SIDE_NAV_WIDTH = 290
export const SIDE_NAV_COLLAPSED_WIDTH = 73 // icon size + padding + border right; also the unpinned content offset

// Height of the hosted maintenance banner, published by CippMaintenanceBanner via a CSS custom
// property on :root so the fixed chrome can offset itself without prop threading. Resolves to 0px
// whenever no banner is mounted, which is the overwhelmingly common case.
export const BANNER_HEIGHT_VAR = 'var(--cipp-banner-h, 0px)'

// Notch / status-bar inset. Requires viewport-fit=cover on the meta viewport. When a banner is
// showing it already pads itself with this inset and publishes that in --cipp-banner-h, so chrome
// below the banner must not add it again — see SAFE_AREA_TOP_OFFSET.
export const SAFE_AREA_TOP_VAR = 'env(safe-area-inset-top, 0px)'

// Safe-area to apply above the top nav only when no banner is eating the top of the screen.
// max() keeps a single expression working for both "banner on" and "banner off".
export const SAFE_AREA_TOP_OFFSET = `max(0px, calc(${SAFE_AREA_TOP_VAR} - ${BANNER_HEIGHT_VAR}))`

// Fixed chrome below the status bar / banner: top nav + residual safe-area + banner height.
export const CHROME_TOP_OFFSET = `calc(${TOP_NAV_HEIGHT}px + ${BANNER_HEIGHT_VAR} + ${SAFE_AREA_TOP_OFFSET})`
