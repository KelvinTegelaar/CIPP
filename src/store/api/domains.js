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
    listDomainTests: builder.query({
      query: ({ domain }) => ({
        path: '/api/ListDomainTests',
        data: {
          DomainToCheck: domain,
        },
        method: 'post',
      }),
      transformResponse: (response) => {
        if (Array.isArray(response) && response?.length > 0) {
          return response[0]
        }
        return {}
      },
    }),
  }),
})

export const { useListDomainsQuery, useListDomainTestsQuery, useLazyListDomainTestsQuery } =
  domainsApi
