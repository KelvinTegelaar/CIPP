const initialState = {
  domains: {
    list: [],
    loading: false,
    loaded: false,
  },
}

const DOMAINS_LOAD = 'domains/DOMAINS_LOAD'
const DOMAINS_LOAD_SUCCESS = 'domains/DOMAINS_LOAD_SUCCESS'
const DOMAINS_LOAD_FAIL = 'domains/DOMAINS_LOAD_FAIL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DOMAINS_LOAD:
      return {
        ...state,
        domains: {
          ...initialState.domains,
          loading: true,
        },
      }
    case DOMAINS_LOAD_SUCCESS:
      return {
        ...state,
        domains: {
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case DOMAINS_LOAD_FAIL:
      return {
        ...state,
        domains: {
          ...initialState.domains,
          error: action.error,
        },
      }
    default:
      return state
  }
}

export function listDomains({ tenantDomain }) {
  return {
    types: [DOMAINS_LOAD, DOMAINS_LOAD_SUCCESS, DOMAINS_LOAD_FAIL],
    promise: (client) =>
      client
        .get('/api/ListDomains', { params: { tenantFilter: tenantDomain } })
        .then((result) => result.data)
        .then((result) => {
          if (Array.isArray(result)) {
            return result
          }
          return []
        }),
  }
}
