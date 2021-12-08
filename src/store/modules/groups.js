const initialState = {
  groups: {
    list: [],
    loading: false,
    loaded: false,
    error: undefined,
  },
  userGroups: {
    list: [],
    loading: false,
    loaded: false,
    error: undefined,
  },
}

const GROUPS_LOAD = 'groups/GROUPS_LOAD'
const GROUPS_LOAD_SUCCESS = 'groups/GROUPS_LOAD_SUCCESS'
const GROUPS_LOAD_ERROR = 'groups/GROUPS_LOAD_ERROR'

const USER_GROUPS_LOAD = 'groups/USER_GROUPS_LOAD'
const USER_GROUPS_LOAD_SUCCESS = 'groups/USER_GROUPS_LOAD_SUCCESS'
const USER_GROUPS_LOAD_FAIL = 'groups/USER_GROUPS_LOAD_FAIL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case USER_GROUPS_LOAD:
      return {
        ...state,
        userGroups: {
          ...initialState.userGroups,
          loading: true,
        },
      }
    case USER_GROUPS_LOAD_SUCCESS:
      return {
        ...state,
        userGroups: {
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case USER_GROUPS_LOAD_FAIL:
      return {
        ...state,
        userGroups: {
          ...initialState.userGroups,
          error: action.error,
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
    case GROUPS_LOAD_ERROR:
      return {
        ...state,
        groups: {
          ...initialState.groups,
          error: action.error,
        },
      }
    default:
      return state
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

export function listUserGroups({ tenantDomain, userId }) {
  return {
    types: [USER_GROUPS_LOAD, USER_GROUPS_LOAD_SUCCESS, USER_GROUPS_LOAD_FAIL],
    promise: (client) =>
      client
        .get('/api/ListUserGroups', { params: { TenantFilter: tenantDomain, userId } })
        .then((result) => result.data),
  }
}
