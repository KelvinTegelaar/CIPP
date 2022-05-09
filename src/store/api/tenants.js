import { baseApi } from 'src/store/api/baseApi'

export const tenantsApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ['ExcludedTenants', 'Tenants', 'ConditionalAccessPolicies'],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      listTenants: builder.query({
        query: ({ showAllTenantSelector = false }) => ({
          path: '/api/ListTenants',
          params: { AllTenantSelector: showAllTenantSelector },
        }),
        providesTags: ['Tenants'],
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
        providesTags: ['ConditionalAccessPolicies'],
      }),
      listExcludedTenants: builder.query({
        query: () => ({
          path: '/api/ExecExcludeTenant',
          params: {
            list: true,
          },
        }),
        transformResponse: (response) => {
          // @todo fix in api
          if (!Array.isArray(response) && Object.keys(response).length > 0) {
            return [response]
          }
          if (!Array.isArray(response)) {
            return []
          }
          return response
        },
        providesTags: ['ExcludedTenants'],
      }),
      execRemoveExcludeTenant: builder.mutation({
        query: (tenantDomain) => ({
          path: '/api/ExecExcludeTenant',
          params: {
            RemoveExclusion: true,
            TenantFilter: tenantDomain,
          },
        }),
        invalidatesTags: ['ExcludedTenants'],
      }),
      execAddExcludeTenant: builder.mutation({
        query: (tenantDomain) => ({
          path: '/api/ExecExcludeTenant',
          params: {
            AddExclusion: true,
            TenantFilter: tenantDomain,
          },
        }),
        invalidatesTags: ['ExcludedTenants'],
      }),
    }),
  })

export const {
  useListTenantsQuery,
  useListTenantQuery,
  useEditTenantMutation,
  useListConditionalAccessPoliciesQuery,
  useListExcludedTenantsQuery,
  useLazyListExcludedTenantsQuery,
  useExecRemoveExcludeTenantMutation,
  useExecAddExcludeTenantMutation,
} = tenantsApi
