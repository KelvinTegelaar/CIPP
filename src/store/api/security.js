import { baseApi } from 'src/store/api/baseApi'

export const securityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    execAlertsList: builder.query({
      queryFn: async (_args, _baseQueryApi, _options, baseQuery) => {
        const startRequest = await baseQuery({
          path: '/api/ExecAlertsList',
          params: { tenantFilter: _args.tenantFilter },
        })
        if (startRequest.error) {
          return { error: startRequest.error }
        }

        return new Promise((resolve) => {
          let retries = 0
          const interval = setInterval(async () => {
            const { data, error } = await baseQuery({
              path: '/api/ExecAlertsList',
              params: { tenantFilter: _args.tenantFilter },
            })
            if (error) {
              clearInterval(interval)
              resolve({ error })
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
    execIncidentsList: builder.query({
      queryFn: async (_args, _baseQueryApi, _options, baseQuery) => {
        const startRequest = await baseQuery({
          path: '/api/ExecIncidentsList',
          params: { tenantFilter: _args.tenantFilter },
        })
        if (startRequest.error) {
          return { error: startRequest.error }
        }

        return new Promise((resolve) => {
          let retries = 0
          const interval = setInterval(async () => {
            const { data, error } = await baseQuery({
              path: '/api/ExecIncidentsList',
              params: { tenantFilter: _args.tenantFilter },
            })
            if (error) {
              clearInterval(interval)
              resolve({ error })
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

export const { useLazyExecAlertsListQuery, useLazyExecIncidentsListQuery } = securityApi
