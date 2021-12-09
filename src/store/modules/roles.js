const initialState = {
  roles: {
    list: [],
    loading: false,
    loaded: false,
  },
}

const ROLES_LOAD = 'roles/ROLES_LOAD'
const ROLES_LOAD_SUCCESS = 'roles/ROLES_LOAD_SUCCESS'
const ROLES_LOAD_FAIL = 'roles/ROLES_LOAD_FAIL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ROLES_LOAD:
      return {
        ...state,
        roles: {
          ...initialState.roles,
          loading: true,
        },
      }
    case ROLES_LOAD_SUCCESS:
      return {
        ...state,
        roles: {
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case ROLES_LOAD_FAIL:
      return {
        ...state,
        roles: {
          ...initialState.roles,
          error: action.error,
        },
      }
    default:
      return state
  }
}

export function listRoles({ tenant }) {
  return {
    types: [ROLES_LOAD, ROLES_LOAD_SUCCESS, ROLES_LOAD_FAIL],
    promise: (client) =>
      client
        .get('/api/ListRoles?Tenantfilter=' + tenant.defaultDomainName)
        .then((result) => result.data),
  }
}
