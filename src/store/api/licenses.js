import { baseApi } from 'src/store/api/baseApi'

export const licensesApi = baseApi.injectEndpoints({
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
