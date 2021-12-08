const initialState = {
  usage: {
    list: [],
    loading: false,
    loaded: false,
  },
}

const SHAREPOINT_LOAD = 'sharepoint/SHAREPOINT_LOAD'
const SHAREPOINT_LOAD_SUCCESS = 'sharepoint/SHAREPOINT_LOAD_SUCCESS'
const SHAREPOINT_LOAD_ERROR = 'sharepoint/SHAREPOINT_LOAD_ERROR'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SHAREPOINT_LOAD:
      return {
        ...state,
        usage: {
          ...state.usage,
          loading: true,
          loaded: false,
        },
      }
    case SHAREPOINT_LOAD_SUCCESS:
      return {
        ...state,
        usage: {
          ...state.usage,
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case SHAREPOINT_LOAD_ERROR:
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

export function listSharepointSitesUsage({ tenantDomain }) {
  return {
    types: [SHAREPOINT_LOAD, SHAREPOINT_LOAD_SUCCESS, SHAREPOINT_LOAD_ERROR],
    promise: (client) =>
      client
        .get('/api/ListSites?type=SharePointSiteUsage&Tenantfilter=' + tenantDomain)
        .then((result) => result.data),
  }
}
