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
    listExcludedTenants: builder.query({
      query: () => ({
        path: '/api/ExecExcludeTenant',
        params: {
          list: true,
        },
      }),
      transformResponse: (response) => {
        if (!Array.isArray(response)) {
          return []
        }
        return response
      },
    }),
    execExcludeTenant: builder.query({
      query: (tenantfilter) => ({
        path: '/api/ExecExcludeTenant',
        params: {
          RemoveExclusion: true,
          TenantFilter: tenantfilter,
        },
      }),
    }),
    execAddExcludeTenant: builder.query({
      query: (tenantfilter) => ({
        path: '/api/ExecExcludeTenant',
        params: {
          AddExclusion: true,
          TenantFilter: tenantfilter,
        },
      }),
    }),
  }),
})

export const {
  useListTenantsQuery,
  useListTenantQuery,
  useEditTenantMutation,
  useListConditionalAccessPoliciesQuery,
  useLazyListExcludedTenantsQuery,
  useLazyExecExcludeTenantQuery,
  useLazyExecAddExcludeTenantQuery,
} = tenantsApi
