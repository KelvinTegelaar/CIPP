// Central client-side redirect map for routes that have moved or been retired.
//
// The frontend is a static export (next.config.js sets output: 'export'), so the
// redirects() block in next.config.js and Next middleware never run — there is no
// server to do the redirect. Instead the host serves 404.html for an unknown path,
// and the 404 page (src/pages/404.jsx) consults this map before showing its error
// state: a request for an old path is replaced with its destination in the browser.
//
// To retire or move a route, add one entry here — 'old path': 'new path'. Use a
// leading slash and no trailing slash on both; the lookup tolerates a trailing slash.
export const routeRedirects = {
  // The standalone Add User / Bulk Add User pages were removed — both flows now live
  // in drawers on the Users list page.
  '/identity/administration/users/add': '/identity/administration/users',
  '/identity/administration/users/bulk-add': '/identity/administration/users',
  // Vacation mode now lives under Identity Management. Its standalone add page is retired.
  '/tenant/conditional/deploy-vacation': '/identity/administration/vacation-mode',
  // Tenant onboarding runs through the setup wizard. The Add Tenant page redirects there
  // in-page; this entry is the fallback for the same route.
  '/tenant/administration/tenants/add': '/onboardingv2',
  // CIPP Roles moved out of the Super Admin area when it was split into Super Admin /
  // Container Management / Authentication.
  '/cipp/advanced/super-admin/cipp-roles':
    '/cipp/advanced/authentication/cipp-roles',
  '/cipp/advanced/super-admin/cipp-roles/add':
    '/cipp/advanced/authentication/cipp-roles/add',
  '/cipp/advanced/super-admin/cipp-roles/edit':
    '/cipp/advanced/authentication/cipp-roles/edit',
  // Vacation Mode moved to Identity Management; its standalone add page went with it, and
  // the add flow now lives in a drawer on the Vacation Mode list.
  '/tenant/conditional/deploy-vacation/add':
    '/identity/administration/vacation-mode',
  // User Templates moved from Manage Tenant tabs to the Users tabbed layout.
  '/tenant/manage/user-defaults':
    '/identity/administration/users/user-defaults',
}

export const getRedirectTarget = (pathname) => {
  if (!pathname) return undefined
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return routeRedirects[normalized]
}
