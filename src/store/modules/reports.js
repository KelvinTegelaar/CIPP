const initialState = {
  mfa: {
    report: [],
    loading: false,
    loaded: false,
  },
}

const MFA_LOAD = 'reports/MFA_LOAD'
const MFA_LOAD_SUCCESS = 'reports/MFA_LOAD_SUCCESS'
const MFA_LOAD_FAIL = 'reports/MFA_LOAD_FAIL'

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
