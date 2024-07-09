import { baseApi } from 'src/store/api/baseApi'

export const adconnectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAdConnectSettings: builder.query({
      query: ({ tenantDomain }) => ({
        path: '/api/ListAzureADConnectStatus',
        params: { TenantFilter: tenantDomain, DataToReturn: 'AzureADConnectSettings' },
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

export const { useListAdConnectSettingsQuery } = adconnectApi
