import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

export const sharepointApi = createApi({
  reducerPath: 'sharepoint',
  baseQuery: baseQuery(),
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
