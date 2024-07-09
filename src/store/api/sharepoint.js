import { baseApi } from 'src/store/api/baseApi'

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
    listTeamSites: builder.query({
      query: ({ tenantDomain, groupId }) => ({
        path: '/api/ListTeams',
        params: {
          type: 'Team',
          TenantFilter: tenantDomain,
          id: groupId,
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

export const { useListSharepointSitesQuery, useListTeamSitesQuery } = sharepointApi
