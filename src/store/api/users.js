import { axiosQuery, baseQuery } from './baseQuery'
import { createApi } from '@reduxjs/toolkit/query/react'

export const USERS_API_REDUCER_PATH = 'users'
export const usersApi = createApi({
  reducerPath: USERS_API_REDUCER_PATH,
  baseQuery: baseQuery({ baseUrl: '/' }),
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
      queryFn: ({ tenantDomain, userId }) =>
        axiosQuery({
          path: '/api/ListUsers',
          params: { userId, TenantFilter: tenantDomain },
        }).then(({ data }) => {
          if (data?.length > 0) {
            return { data: data[0] }
          }
          return { data: {} }
        }),
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
  }),
})

export const {
  useEditUserMutation,
  useListUsersQuery,
  useListUserQuery,
  useListUserConditionalAccessPoliciesQuery,
  useListUserSigninLogsQuery,
} = usersApi
export default usersApi
