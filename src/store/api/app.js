import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery, axiosQuery } from './baseQuery'

export const appApi = createApi({
  reducerPath: 'app-api',
  baseQuery: baseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    loadVersions: builder.query({
      queryFn: () =>
        axiosQuery({ path: '/version_latest.txt' }).then(({ data }) =>
          axiosQuery({
            path: '/api/GetVersion',
            params: { localversion: data.replace('\r\n', '') },
          }),
        ),
    }),
    loadVersionLocal: builder.query({
      query: () => ({ path: '/version_latest.txt' }),
    }),
    loadVersionRemote: builder.query({
      query: (localVersion) => ({
        path: '/api/GetVersion',
        params: { localversion: localVersion },
      }),
    }),
  }),
})

export const { useLoadVersionLocalQuery, useLoadVersionRemoteQuery, useLoadVersionsQuery } = appApi
