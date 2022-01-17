import { baseApi } from 'src/store/api/baseApi'

export const devicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listDevices: builder.query({
      query: ({ tenantDomain }) => ({ path: '/api/ListDevices', params: { tenantDomain } }),
    }),

    listUserDevices: builder.query({
      query: ({ userId, tenantDomain }) => ({
        path: '/api/ListUserDevices',
        params: { userId, tenantFilter: tenantDomain },
      }),
    }),
    listDevicePolicies: builder.query({
      query: ({ PolicyID, tenantDomain }) => ({
        path: '/api/ListIntunePolicy',
        params: { ID: PolicyID, tenantFilter: tenantDomain },
      }),
    }),
  }),
})

export const { useListDevicesQuery, useListUserDevicesQuery, useListDevicePoliciesQuery } =
  devicesApi
