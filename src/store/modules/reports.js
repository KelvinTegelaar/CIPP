const initialState = {
  mfa: {
    report: [],
    loading: false,
    loaded: false,
  },
  basicAuth: {
    report: [],
    loading: false,
    loaded: false,
  },
}

const MFA_LOAD = 'reports/MFA_LOAD'
const MFA_LOAD_SUCCESS = 'reports/MFA_LOAD_SUCCESS'
const MFA_LOAD_FAIL = 'reports/MFA_LOAD_FAIL'

const BASIC_AUTH_LOAD = 'reports/BASIC_AUTH_LOAD'
const BASIC_AUTH_LOAD_SUCCESS = 'reports/BASIC_AUTH_LOAD_SUCCESS'
const BASIC_AUTH_LOAD_FAIL = 'reports/BASIC_AUTH_LOAD_FAIL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case MFA_LOAD:
      return {
        ...state,
        mfa: {
          ...state.mfa,
          loading: true,
          loaded: false,
        },
      }
    case MFA_LOAD_SUCCESS:
      return {
        ...state,
        mfa: {
          ...state.mfa,
          report: action.result,
          loading: false,
          loaded: true,
        },
      }
    case MFA_LOAD_FAIL:
      return {
        ...state,
        mfa: initialState.mfa,
      }
    case BASIC_AUTH_LOAD:
      return {
        ...state,
        basicAuth: {
          ...state.basicAuth,
          loading: true,
          loaded: false,
        },
      }
    case BASIC_AUTH_LOAD_SUCCESS:
      return {
        ...state,
        basicAuth: {
          ...state.basicAuth,
          report: action.result,
          loading: false,
          loaded: true,
        },
      }
    case BASIC_AUTH_LOAD_FAIL:
      return {
        ...state,
        basicAuth: initialState.basicAuth,
      }
    default:
      return state
  }
}

export function loadMFAReport({ domain }) {
  return {
    types: [MFA_LOAD, MFA_LOAD_SUCCESS, MFA_LOAD_FAIL],
    promise: (client) =>
      client
        .get('/api/ListMFAUsers', { params: { TenantFilter: domain } })
        .then((result) => result.data),
  }
}

export function loadBasicAuthReport({ domain }) {
  return {
    types: [BASIC_AUTH_LOAD, BASIC_AUTH_LOAD_SUCCESS, BASIC_AUTH_LOAD_FAIL],
    promise: (client) =>
      client
        .get('/api/ListBasicAuth', { params: { TenantFilter: domain } })
        .then((result) => result.data),
  }
}
