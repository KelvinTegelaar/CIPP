const initialState = {
  users: {
    list: [],
    loading: false,
    loaded: false,
  },
  groups: {
    list: [],
    loading: false,
    loaded: false,
  },
}

const USERS_LOAD = 'users/USERS_LOAD'
const USERS_LOAD_SUCCESS = 'users/USERS_LOAD_SUCCESS'
const USERS_LOAD_ERROR = 'users/USERS_LOAD_ERROR'

const GROUPS_LOAD = 'groups/GROUPS_LOAD'
const GROUPS_LOAD_SUCCESS = 'groups/GROUPS_LOAD_SUCCESS'
const GROUPS_LOAD_ERROR = 'groups/GROUPS_LOAD_ERROR'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case USERS_LOAD:
      return {
        ...state,
        users: {
          ...state.users,
          loading: true,
          loaded: false,
        },
      }
    case USERS_LOAD_SUCCESS:
      return {
        ...state,
        users: {
          ...state.users,
          list: action.result,
          loading: false,
          loaded: true,
        },
      }
    case USERS_LOAD_ERROR:
      return {
        ...state,
        users: {
          ...state.users,
          loading: false,
          loaded: false,
        },
      }
    case GROUPS_LOAD:
      return {
        ...state,
        groups: {
          ...state.groups,
          loading: true,
          loaded: false,
        },
      }
    case GROUPS_LOAD_SUCCESS:
      return {
        ...state,
        groups: {
          ...state.groups,
          list: action.result,
          loading: false,
          loaded: true,
        },
      }
    case USERS_LOAD_ERROR:
      return {
        ...state,
        users: {
          ...state.groups,
          loading: false,
          loaded: false,
        },
      }
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

export function listGroups({ tenant }) {
  return {
    types: [GROUPS_LOAD, GROUPS_LOAD_SUCCESS, GROUPS_LOAD_ERROR],
    promise: (client) =>
      client
        .get('/api/ListGroups?Tenantfilter=' + tenant.defaultDomainName)
        .then((result) => result.data),
  }
}
