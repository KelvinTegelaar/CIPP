import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

export const reportsApi = createApi({
  reducerPath: 'reports',
  baseQuery: baseQuery(),
  endpoints: (builder) => ({
    listBestPracticeAnalyser: builder.query({
      query: () => ({ path: '/api/BestPracticeAnalyser_List' }),
    }),
    execBestPracticeAnalyser: builder.mutation({
      query: () => ({ path: '/api/BestPracticeAnalyser_OrchestrationStarter' }),
    }),
  }),
})

export const { useListBestPracticeAnalyserQuery, useExecBestPracticeAnalyserMutation } = reportsApi
