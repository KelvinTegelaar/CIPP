import { baseApi } from 'src/store/api/baseApi'

export const domainsApi = baseApi.injectEndpoints({
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
    editDnsConfig: builder.query({
      query: ({ resolver }) => ({
        path: '/api/ExecDnsConfig',
        params: {
          Action: 'SetConfig',
          Resolver: resolver,
        },
      }),
    }),
    getDnsConfig: builder.query({
      query: () => ({
        path: '/api/ExecDnsConfig',
        params: { Action: 'GetConfig' },
      }),
    }),
  }),
})

export const {
  useListDomainsQuery,
  useListDomainTestsQuery,
  useLazyListDomainTestsQuery,
  useEditDnsConfigQuery,
  useLazyEditDnsConfigQuery,
  useGetDnsConfigQuery,
  useLazyGetDnsConfigQuery,
} = domainsApi
