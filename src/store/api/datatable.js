import { baseQuery } from './baseQuery'
import { createApi } from '@reduxjs/toolkit/query/react'

export const datatableApi = createApi({
  reducerPath: 'datatable',
  baseQuery: baseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    listDatatable: builder.query({
      query: ({ path, params }) => ({ path, params }),
    }),
  }),
})

export const { useListDatatableQuery } = datatableApi
