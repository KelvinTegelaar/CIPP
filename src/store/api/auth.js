import { baseApi } from 'src/store/api/baseApi'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loadClientPrincipal: builder.query({
      query: () => ({ path: '/.auth/me' }),
    }),
  }),
})

export const { useLoadClientPrincipalQuery } = authApi
