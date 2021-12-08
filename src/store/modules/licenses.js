const initialState = {
  licenses: {
    list: [],
    loading: false,
    loaded: false,
  },
}

const LICENSE_LOAD = 'license/LICENSE_LOAD'
const LICENSE_LOAD_SUCCESS = 'license/LICENSE_LOAD_SUCCESS'
const LICENSE_LOAD_FAIL = 'license/LICENSE_LOAD_FAIL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LICENSE_LOAD:
      return {
        ...state,
        licenses: {
          loaded: false,
          loading: true,
        },
      }
    case LICENSE_LOAD_SUCCESS:
      return {
        ...state,
        licenses: {
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case LICENSE_LOAD_FAIL:
      return {
        ...state,
        licenses: {
          ...initialState.licenses,
          error: action.error,
        },
      }
    default:
      return state
  }
}
export function listLicenses({ tenantDomain }) {
  return {
    types: [LICENSE_LOAD, LICENSE_LOAD_SUCCESS, LICENSE_LOAD_FAIL],
    hideToastError: true,
    promise: (client) =>
      client
        .get('/api/ListLicenses', { params: { tenantFilter: tenantDomain } })
        .then((result) => result.data),
  }
}
