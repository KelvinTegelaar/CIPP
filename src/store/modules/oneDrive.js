const initialState = {
  usage: {
    report: {},
    loading: false,
    loaded: false,
  },
}

const ONEDRIVE_USAGE_LOAD = 'user/ONEDRIVE_USAGE_LOAD'
const ONEDRIVE_USAGE_LOAD_SUCCESS = 'user/ONEDRIVE_USAGE_LOAD_SUCCESS'
const ONEDRIVE_USAGE_LOAD_FAIL = 'user/ONEDRIVE_USAGE_LOAD_FAIL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ONEDRIVE_USAGE_LOAD:
      return {
        ...state,
        usage: {
          ...initialState.usage,
          loading: true,
        },
      }
    case ONEDRIVE_USAGE_LOAD_SUCCESS:
      return {
        ...state,
        usage: {
          loading: false,
          loaded: true,
          report: action.result,
        },
      }
    case ONEDRIVE_USAGE_LOAD_FAIL:
      return {
        ...state,
        usage: {
          ...initialState.usage,
          error: action.error,
        },
      }
    default:
      return state
  }
}

// @todo is this only used for onedrive?
export function listOneDriveUsage({ tenantDomain, userUPN }) {
  return (dispatch) =>
    dispatch({
      types: [ONEDRIVE_USAGE_LOAD, ONEDRIVE_USAGE_LOAD_SUCCESS, ONEDRIVE_USAGE_LOAD_FAIL],
      hideToastError: true,
      promise: (client) =>
        client
          .get('/api/ListSites', {
            params: { type: 'OneDriveUsageAccount', userUPN, tenantFilter: tenantDomain },
          })
          .then((result) => {
            if (result.data && result.data.length > 0) {
              return result.data[0]
            }
            return {}
          }),
    })
}
