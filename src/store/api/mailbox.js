import { baseApi } from 'src/store/api/baseApi'

export const mailboxApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listMailboxDetails: builder.query({
      query: ({ userId, tenantDomain }) => ({
        path: '/api/ListUserMailboxDetails',
        params: { userId, tenantFilter: tenantDomain },
      }),
      transformResponse: (response) => {
        if (response?.length > 0) {
          return response[0]
        }
        return {}
      },
    }),
    listMailboxPermissions: builder.query({
      query: ({ userId, tenantDomain }) => ({
        path: '/api/ListMailboxPermissions',
        params: { userId, tenantFilter: tenantDomain },
      }),
    }),
  }),
})

export const { useListMailboxDetailsQuery, useListMailboxPermissionsQuery } = mailboxApi
