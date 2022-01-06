import { baseApi } from './baseApi'

export const sharepointApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSharepointSites: builder.query({
      query: ({ tenantDomain, groupId }) => ({
        path: '/api/ListSites',
        params: {
          type: 'SharepointSiteUsage',
          TenantFilter: tenantDomain,
          groupId,
        },
      }),
    }),
    listSharepointSitesUsage: builder.query({
      query: ({ tenantDomain }) => ({
        path: '/api/ListSites',
        params: {
          type: 'SharePointSiteUsage',
          TenantFilter: tenantDomain,
        },
      }),
    }),
  }),
})

export const { useListSharepointSitesQuery } = sharepointApi
