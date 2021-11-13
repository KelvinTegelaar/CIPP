const initialState = {
  tenants: [],
  selectedTenant: {},
  loading: false,
  loaded: false,
  cap: {
    loading: false,
    loaded: false,
    policies: [],
  },
}

const LOADING = 'tenants/LOADING'
const LOADING_SUCCESS = 'tenants/LOADING_SUCCESS'
const LOADING_FAILURE = 'tenants/LOADING_FAILURE'

const SET_TENANT = 'tenants/SET_TENANT'

const LOAD_CONDITIONAL_ACCESS = 'tenants/LOAD_CONDITIONAL_ACCESS'
const LOAD_CONDITIONAL_ACCESS_SUCCESS = 'tenants/LOAD_CONDITIONAL_ACCESS_SUCCESS'
const LOAD_CONDITIONAL_ACCESS_FAIL = 'tenants/LOAD_CONDITIONAL_ACCESS_FAIL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOADING:
      return { ...state, loading: true, loaded: false }
    case LOADING_SUCCESS:
      return { ...state, tenants: action.result, loading: false, loaded: true }
    case LOADING_FAILURE:
      return { ...state, loading: false, loaded: false, tenants: [] }
    case SET_TENANT:
      return { ...state, selectedTenant: action.tenant }
    case LOAD_CONDITIONAL_ACCESS:
      return {
        ...state,
        cap: {
          ...state.cap,
          loading: true,
          loaded: false,
          policies: [],
        },
      }
    case LOAD_CONDITIONAL_ACCESS_SUCCESS:
      return {
        ...state,
        cap: {
          ...state.cap,
          loading: false,
          loaded: true,
          policies: action.result,
        },
      }
    case LOAD_CONDITIONAL_ACCESS_FAIL:
      return {
        ...state,
        cap: initialState.cap,
      }
    default:
      return state
  }
}

export function listTenants() {
  return {
    types: [LOADING, LOADING_SUCCESS, LOADING_FAILURE],
    promise: (client) => client.get('/api/ListTenants').then((result) => result.data),
  }
}

export function setTenant({ tenant }) {
  return {
    type: SET_TENANT,
    tenant,
  }
}

export function loadConditionalAccessPolicies({ domain }) {
  return {
    types: [LOAD_CONDITIONAL_ACCESS, LOAD_CONDITIONAL_ACCESS_SUCCESS, LOAD_CONDITIONAL_ACCESS_FAIL],
    promise: (client) =>
      client
        .get('/api/ListConditionalAccessPolicies', { params: { TenantFilter: domain } })
        .then((result) => result.data),
  }
}
