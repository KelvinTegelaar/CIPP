const initialState = {
  tenants: [],
  selectedTenant: {},
  loading: false,
  loaded: false,
}

const LOADING = 'tenants/LOADING'
const LOADING_SUCCESS = 'tenants/LOADING_SUCCESS'
const LOADING_FAILURE = 'tenants/LOADING_FAILURE'

const SET_TENANT = 'tenants/SET_TENANT'

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
