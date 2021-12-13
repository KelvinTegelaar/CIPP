import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

export const domainsApi = createApi({
  reducerPath: 'domains',
  baseQuery: baseQuery(),
  endpoints: (builder) => ({
    listDomains: builder.query({
      query: ({ tenantDomain }) => ({
        path: '/api/ListDomains',
        params: { TenantFilter: tenantDomain },
      }),
      transformResponse: (response) => {
        if (!response) {
          return []
        }
        return response
      },
    }),
  }),
})

export const { useListDomainsQuery } = domainsApi
