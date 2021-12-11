import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

export const oneDriveApi = createApi({
  reducerPath: 'oneDrive',
  baseQuery: baseQuery(() => ({})),
  endpoints: (builder) => ({
    listOneDriveUsage: builder.query({
      query: ({ userUPN, tenantDomain }) => ({
        path: '/api/ListSites',
        params: { type: 'OneDriveUsageAccount', userUPN, tenantFilter: tenantDomain },
      }),
    }),
    listOneDrives: builder.query({
      query: ({ tenantDomain }) => ({
        path: '/api/ListSites',
        params: {
          type: 'OneDriveUsageAccount',
          TenantFilter: tenantDomain,
        },
      }),
    }),
  }),
})

export const { useListOneDriveUsageQuery, useListOneDrivesQuery } = oneDriveApi
