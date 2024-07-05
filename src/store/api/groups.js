import { baseApi } from 'src/store/api/baseApi'

export const groupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addGroup: builder.mutation({
      query: ({ group }) => ({
        path: '/api/AddGroup',
        method: 'post',
        data: { group },
      }),
    }),
    editGroup: builder.mutation({
      query: ({ group }) => ({
        path: '/api/EditGroup',
        method: 'post',
        data: { group },
      }),
    }),
    listGroups: builder.query({
      query: ({ tenantDomain }) => ({
        path: '/api/ListGroups',
        params: {
          TenantFilter: tenantDomain,
        },
      }),
    }),
    listGroup: builder.query({
      query: ({ tenantDomain, groupId }) => ({
        path: '/api/ListGroups',
        params: {
          TenantFilter: tenantDomain,
          GroupId: groupId,
        },
      }),
    }),
    listGroupMembers: builder.query({
      query: ({ tenantDomain, groupId }) => ({
        path: '/api/ListGroups',
        params: {
          TenantFilter: tenantDomain,
          GroupId: groupId,
          members: true,
        },
      }),
    }),
    listGroupOwners: builder.query({
      query: ({ tenantDomain, groupId }) => ({
        path: '/api/ListGroups',
        params: {
          TenantFilter: tenantDomain,
          GroupId: groupId,
          owners: true,
        },
      }),
    }),
    listUserGroups: builder.query({
      query: ({ tenantDomain, userId }) => ({
        path: '/api/ListUserGroups',
        params: { tenantFilter: tenantDomain, userId },
      }),
    }),
    listGroupSenderAuth: builder.query({
      query: ({ tenantDomain, groupId, type }) => ({
        path: '/api/ListGroupSenderAuthentication',
        params: {
          TenantFilter: tenantDomain,
          GroupId: groupId,
          Type: type,
        },
      }),
    }),
  }),
})
export const {
  useAddGroupMutation,
  useEditGroupMutation,
  useListGroupQuery,
  useListGroupsQuery,
  useListGroupMembersQuery,
  useListGroupOwnersQuery,
  useListUserGroupsQuery,
  useListGroupSenderAuthQuery,
} = groupsApi
