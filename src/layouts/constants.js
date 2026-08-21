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
