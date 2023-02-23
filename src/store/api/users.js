import { baseApi } from 'src/store/api/baseApi'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    editUser: builder.mutation({
      query: (user) => ({
        path: '/api/EditUser',
        method: 'post',
        data: user,
      }),
    }),
    listUsers: builder.query({
      query: ({ tenantDomain }) => ({
        path: '/api/ListUsers',
        params: {
          TenantFilter: tenantDomain,
        },
      }),
    }),
    listContacts: builder.query({
      query: ({ tenantDomain }) => ({
        path: '/api/ListContacts',
        params: {
          TenantFilter: tenantDomain,
        },
      }),
    }),
    listUser: builder.query({
      query: ({ tenantDomain, userId, IncludeLogonDetails }) => ({
        path: '/api/ListUsers',
        params: { userId, TenantFilter: tenantDomain, IncludeLogonDetails },
      }),
      transformResponse: (response) => {
        if (response?.length > 0) {
          return response[0]
        }
        return {}
      },
    }),
    listUserConditionalAccessPolicies: builder.query({
      query: ({ tenantDomain, userId }) => ({
        path: '/api/ListUserConditionalAccessPolicies',
        params: { userId, tenantFilter: tenantDomain },
      }),
    }),
    listUserSigninLogs: builder.query({
      query: ({ tenantDomain, userId }) => ({
        path: '/api/ListUserSigninLogs',
        params: { userId, tenantFilter: tenantDomain },
      }),
    }),
    addUser: builder.mutation({
      query: ({ user }) => ({
        path: '/api/AddUser',
        data: user,
      }),
    }),
    execBecCheck: builder.query({
      queryFn: async (_args, _baseQueryApi, _options, baseQuery) => {
        const startRequest = await baseQuery({
          path: '/api/execBECCheck',
          params: { userId: _args.userId, tenantFilter: _args.tenantFilter },
        })
        if (startRequest.error) {
          return { error: startRequest.error }
        }

        const GUID = startRequest.data?.GUID

        return new Promise((resolve) => {
          let retries = 0
          const interval = setInterval(async () => {
            const { data, error } = await baseQuery({
              path: '/api/execBECCheck',
              params: { GUID },
            })
            if (error) {
              clearInterval(interval)
              resolve({ error })
            }
            if (data.Results) {
              clearInterval(interval)
              resolve({
                error: {
                  message: `Error: ${data.Results}`,
                  status: 503,
                  data: 'Request failed.',
                },
              })
            }
            if (!data['Waiting'] === true) {
              if (!Array.isArray(data['MSResults'])) {
                data['MSResults'] = []
              }
              clearInterval(interval)
              resolve({ data })
            }
            if (retries >= 60) {
              clearInterval(interval)
              resolve({
                error: {
                  message: 'Failed to retrieve data in 5 minutes',
                  status: 503,
                  data: 'Request failed with status 503',
                },
              })
            }
            retries++
          }, 5000)
        })
      },
    }),
  }),
})

export const {
  useEditUserMutation,
  useListUsersQuery,
  useListUserQuery,
  useListContactsQuery,
  useListUserConditionalAccessPoliciesQuery,
  useListUserSigninLogsQuery,
  useAddUserMutation,
  useLazyExecBecCheckQuery,
} = usersApi
export default usersApi
