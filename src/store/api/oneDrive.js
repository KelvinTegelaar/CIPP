import { baseApi } from 'src/store/api/baseApi'

export const oneDriveApi = baseApi.injectEndpoints({
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
