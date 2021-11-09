const initialState = {
  users: [],
  loading: false,
  loaded: false,
}

const USERS_LOAD = 'users/USERS_LOAD'
const USERS_LOAD_SUCCESS = 'users/USERS_LOAD_SUCCESS'
const USERS_LOAD_ERROR = 'users/USERS_LOAD_ERROR'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case USERS_LOAD:
      return { ...state, loading: true, loaded: false }
    case USERS_LOAD_SUCCESS:
      return { ...state, users: action.result, loading: false, loaded: true }
    case USERS_LOAD_ERROR:
      return { ...state, loading: false, loaded: false, users: [] }
    default:
      return state
  }
}

export function listUsers({ tenant }) {
  return {
    types: [USERS_LOAD, USERS_LOAD_SUCCESS, USERS_LOAD_ERROR],
    promise: (client) =>
      client
        .get('/api/ListUsers?TenantFilter=' + tenant.defaultDomainName)
        .then((result) => result.data),
  }
}
