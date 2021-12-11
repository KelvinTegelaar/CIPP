import { baseQuery } from './baseQuery'
import { createApi } from '@reduxjs/toolkit/query/react'

export const devicesApi = createApi({
  reducerPath: 'devices',
  baseQuery: baseQuery({ baseUrl: '/' }),
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
