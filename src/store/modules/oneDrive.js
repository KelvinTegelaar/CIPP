const initialState = {
  usage: {
    report: {},
    loading: false,
    loaded: false,
  },
  oneDrive: {
    list: [],
    loading: false,
    loaded: false,
    error: undefined,
  },
}

const ONEDRIVE_USAGE_LOAD = 'user/ONEDRIVE_USAGE_LOAD'
const ONEDRIVE_USAGE_LOAD_SUCCESS = 'user/ONEDRIVE_USAGE_LOAD_SUCCESS'
const ONEDRIVE_USAGE_LOAD_FAIL = 'user/ONEDRIVE_USAGE_LOAD_FAIL'

const ONEDRIVE_LOAD = 'oneDrive/ONEDRIVE_LOAD'
const ONEDRIVE_LOAD_SUCCESS = 'oneDrive/ONEDRIVE_LOAD_SUCCESS'
const ONEDRIVE_LOAD_ERROR = 'oneDrive/ONEDRIVE_LOAD_ERROR'

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
    case ONEDRIVE_LOAD:
      return {
        ...state,
        oneDrive: {
          ...state.oneDrive,
          loading: true,
          loaded: false,
        },
      }
    case ONEDRIVE_LOAD_SUCCESS:
      return {
        ...state,
        oneDrive: {
          ...state.oneDrive,
          list: action.result,
          loading: false,
          loaded: true,
        },
      }
    case ONEDRIVE_LOAD_ERROR:
      return {
        ...state,
        oneDrive: {
          ...initialState.oneDrive,
          error: action.error,
        },
      }
    default:
      return state
  }
}
export function listOneDrives({ tenant }) {
  return {
    types: [ONEDRIVE_LOAD, ONEDRIVE_LOAD_SUCCESS, ONEDRIVE_LOAD_ERROR],
    promise: (client) =>
      client
        .get('/api/ListSites?type=OneDriveUsageAccount&Tenantfilter=' + tenant.defaultDomainName)
        .then((result) => result.data),
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
