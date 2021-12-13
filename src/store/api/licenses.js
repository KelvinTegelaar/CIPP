import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

export const licensesApi = createApi({
  reducerPath: 'licenses',
  baseQuery: baseQuery(() => ({})),
  endpoints: (builder) => ({
    listLicenses: builder.query({
      query: ({ tenantDomain }) => ({
        path: '/api/ListLicenses',
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

export const { useListLicensesQuery, useListUserLicensesQuery } = licensesApi
