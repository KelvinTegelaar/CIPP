import { baseApi } from './baseApi'

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
    listUser: builder.query({
      query: ({ tenantDomain, userId }) => ({
        path: '/api/ListUsers',
        params: { userId, TenantFilter: tenantDomain },
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
  }),
})

export const {
  useEditUserMutation,
  useListUsersQuery,
  useListUserQuery,
  useListUserConditionalAccessPoliciesQuery,
  useListUserSigninLogsQuery,
  useAddUserMutation,
} = usersApi
export default usersApi
