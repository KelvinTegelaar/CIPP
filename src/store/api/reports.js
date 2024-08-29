import { baseApi } from 'src/store/api/baseApi'

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listBestPracticeAnalyser: builder.query({
      query: () => ({ path: '/api/BestPracticeAnalyser_List' }),
    }),
    execBestPracticeAnalyser: builder.mutation({
      query: () => ({ path: '/api/ExecBPA' }),
    }),
    execDomainsAnalyser: builder.mutation({
      query: () => ({ path: '/api/ExecDomainAnalyser' }),
    }),
  }),
})

export const {
  useListBestPracticeAnalyserQuery,
  useExecBestPracticeAnalyserMutation,
  useExecDomainsAnalyserMutation,
} = reportsApi
