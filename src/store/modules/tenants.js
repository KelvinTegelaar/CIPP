const initialState = {
  tenants: [],
  selectedTenant: {},
  loading: false,
}

const LOADING = 'tenants/LOADING'
const LOADING_SUCCESS = 'tenants/LOADING'
const LOADING_FAILURE = 'tenants/LOADING'

const SET_TENANT = 'tenants/SET_TENANT'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOADING:
      return { ...state, loading: true }
    case LOADING_SUCCESS:
      return { ...state, tenants: action.result, loading: false }
    case LOADING_FAILURE:
      return { ...state, loading: false, tenants: [] }
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
