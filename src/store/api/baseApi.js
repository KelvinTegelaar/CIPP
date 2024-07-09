import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from 'src/store/api/baseQuery'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQuery(),
  keepUnusedDataFor: 0,
  endpoints: () => ({}),
})
