import { createApi } from '@reduxjs/toolkit/query/react'

export const reportsApi = createApi({
  reducerPath: 'reports',
  baseQuery: () => ({}),
  endpoints: (builder) => ({
    listBestPracticeAnalyser: builder.query({
      query: () => ({ path: '/api/BestPracticeAnalyser_List' }),
    }),
    execBestPracticeAnalyser: builder.query({
      query: () => ({ path: '/api/BestPracticeAnalyser_OrchestrationStarter' }),
    }),
  }),
})

export const { useListBestPracticeAnalyserQuery, useExecBestPracticeAnalyserQuery } = reportsApi
