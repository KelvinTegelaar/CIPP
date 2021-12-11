import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

export const mailboxApi = createApi({
  reducerPath: 'mailbox',
  baseQuery: baseQuery(() => ({})),
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
  }),
})

export const { useListMailboxDetailsQuery } = mailboxApi
