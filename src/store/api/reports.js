import { baseApi } from './baseApi'

export const reportsApi = baseApi.injectEndpoints({
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
