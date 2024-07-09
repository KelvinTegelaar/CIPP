import { baseApi } from 'src/store/api/baseApi'

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listBestPracticeAnalyser: builder.query({
      query: () => ({ path: '/api/BestPracticeAnalyser_List' }),
    }),
    execBestPracticeAnalyser: builder.mutation({
      query: () => ({ path: '/api/BestPracticeAnalyser_OrchestrationStarter' }),
    }),
    execDomainsAnalyser: builder.mutation({
      query: () => ({ path: '/api/DomainAnalyser_OrchestrationStarter' }),
    }),
  }),
})

export const {
  useListBestPracticeAnalyserQuery,
  useExecBestPracticeAnalyserMutation,
  useExecDomainsAnalyserMutation,
} = reportsApi
