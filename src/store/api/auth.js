import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

export const AUTH_API_REDUCER_PATH = 'auth-api'
export const authApi = createApi({
  reducerPath: AUTH_API_REDUCER_PATH,
  baseQuery: baseQuery(),
  endpoints: (builder) => ({
    loadClientPrincipal: builder.query({
      query: () => ({ path: '/.auth/me' }),
    }),
  }),
})

export const { useLoadClientPrincipalQuery } = authApi
