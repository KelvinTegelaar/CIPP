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
    }),
  }),
})

export const { useListMailboxDetailsQuery } = mailboxApi
