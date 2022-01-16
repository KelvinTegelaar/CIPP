import { baseApi } from 'src/store/api/baseApi'

export const datatableApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listDatatable: builder.query({
      query: ({ path, params }) => ({ path, params }),
    }),
  }),
})

export const { useListDatatableQuery } = datatableApi
