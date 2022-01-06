import { baseApi } from './baseApi'

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
  }),
})

export const { useListDevicesQuery, useListUserDevicesQuery } = devicesApi
