import { baseQuery } from './baseQuery'
import { createApi } from '@reduxjs/toolkit/query/react'

export const TENANTS_API_REDUCER_PATH = 'tenants'
export const tenantsApi = createApi({
  reducerPath: TENANTS_API_REDUCER_PATH,
  baseQuery: baseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    listTenants: builder.query({
      query: () => ({ path: '/api/ListTenants' }),
    }),
    listTenant: builder.query({
      query: (tenantDomain) => ({
        path: '/api/ListTenants',
        params: { TenantFilter: tenantDomain },
      }),
    }),
    editTenant: builder.mutation({
      query: (tenant) => ({
        path: '/api/EditTenant',
        method: 'post',
        data: tenant,
      }),
    }),
    listConditionalAccessPolicies: builder.query({
      query: ({ domain }) => ({
        path: '/api/ListConditionalAccessPolicies',
        params: { TenantFilter: domain },
      }),
    }),
  }),
})

export const {
  useListTenantsQuery,
  useListTenantQuery,
  useEditTenantMutation,
  useListConditionalAccessPoliciesQuery,
} = tenantsApi
