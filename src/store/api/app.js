import { baseApi } from 'src/store/api/baseApi'

export const appApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loadVersions: builder.query({
      queryFn: (_args, _baseQueryApi, _options, baseQuery) =>
        baseQuery({ path: '/version_latest.txt' }).then(({ data }) =>
          baseQuery({
            path: '/api/GetVersion',
            params: { localversion: data.replace(/(\r\n|\n|\r)/gm, '') },
          }),
        ),
    }),
    loadVersionLocal: builder.query({
      query: () => ({ path: '/version_latest.txt' }),
    }),
    loadVersionRemote: builder.query({
      query: (localVersion) => ({
        path: '/api/GetVersion',
        params: { localversion: localVersion },
      }),
    }),
    execPermissionsAccessCheck: builder.query({
      query: () => ({
        path: '/api/ExecAccessChecks',
        params: {
          Permissions: true,
        },
      }),
    }),
    execNotificationConfig: builder.query({
      query: ({
        email,
        webhook,
        tokenUpdater,
        removeUser,
        removeStandard,
        addPolicy,
        addUser,
        addStandardsDeploy,
        addChocoApp,
      }) => ({
        path: '/api/ExecNotificationConfig',
        data: {
          email: email,
          webhook: webhook,
          tokenUpdater: tokenUpdater,
          removeUser: removeUser,
          removeStandard: removeStandard,
          addPolicy: addPolicy,
          addUser: addUser,
          addStandardsDeploy: addStandardsDeploy,
          addChocoApp: addChocoApp,
        },
        method: 'post',
      }),
    }),
    execTenantsAccessCheck: builder.query({
      query: ({ tenantDomains }) => ({
        path: '/api/ExecAccessChecks',
        params: {
          Tenants: true,
        },
        data: {
          tenantid: tenantDomains.join(','),
        },
        method: 'post',
      }),
    }),
    execClearCache: builder.query({
      query: () => ({
        path: '/api/ListTenants',
        params: {
          ClearCache: true,
        },
      }),
    }),
    listNotificationConfig: builder.query({
      query: () => ({
        path: '/api/listNotificationConfig',
      }),
    }),
    genericPostRequest: builder.query({
      query: ({ path, values }) => ({
        path,
        data: values,
        method: 'post',
      }),
    }),
    genericGetRequest: builder.query({
      query: ({ path, params }) => ({
        path,
        params: params,
        method: 'GET',
      }),
    }),
  }),
})

export const {
  useLoadVersionLocalQuery,
  useLoadVersionRemoteQuery,
  useLoadVersionsQuery,
  useExecPermissionsAccessCheckQuery,
  useLazyExecPermissionsAccessCheckQuery,
  useExecTenantsAccessCheckQuery,
  useLazyExecTenantsAccessCheckQuery,
  useExecClearCacheQuery,
  useLazyExecClearCacheQuery,
  useLazyExecNotificationConfigQuery,
  useLazyListNotificationConfigQuery,
  useLazyGenericPostRequestQuery,
  useLazyGenericGetRequestQuery,
} = appApi
