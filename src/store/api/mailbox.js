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
    listMailboxes: builder.query({
      query: ({ tenantDomain }) => ({
        path: '/api/ListMailboxes',
        params: { tenantFilter: tenantDomain },
      }),
    }),
    listMailboxPermissions: builder.query({
      query: ({ userId, tenantDomain }) => ({
        path: '/api/ListMailboxPermissions',
        params: { userId, tenantFilter: tenantDomain },
      }),
    }),
    listCalendarPermissions: builder.query({
      query: ({ userId, tenantDomain }) => ({
        path: '/api/ListCalendarPermissions',
        params: { userId, tenantFilter: tenantDomain },
      }),
    }),
  }),
})

export const {
  useListMailboxDetailsQuery,
  useListMailboxPermissionsQuery,
  useListCalendarPermissionsQuery,
  useListMailboxesQuery,
} = mailboxApi
