import { baseApi } from 'src/store/api/baseApi'

export const tenantsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listTenants: builder.query({
      query: () => '/api/ListTenants',
    }),
  }),
})

export const { useListTenantsQuery } = tenantsApi
