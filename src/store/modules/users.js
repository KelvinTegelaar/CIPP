import { VIEW_USER_UNLOAD } from './ActionTypes'
import { setModalContent, showModal } from './modal'
import React from 'react'

const initialState = {
  users: {
    list: [],
    loading: false,
    loaded: false,
    error: undefined,
  },
  user: {
    user: {},
    loading: false,
    loaded: false,
    error: undefined,
  },
  userCAPs: {
    list: [],
    loading: false,
    loaded: false,
    error: undefined,
  },

  userSignInLogs: {
    list: [],
    loading: false,
    loaded: false,
    error: undefined,
  },
}

const USERS_LOAD = 'users/USERS_LOAD'
const USERS_LOAD_SUCCESS = 'users/USERS_LOAD_SUCCESS'
const USERS_LOAD_ERROR = 'users/USERS_LOAD_ERROR'

const USER_LOAD = 'user/USER_LOAD'
const USER_LOAD_SUCCESS = 'user/USER_LOAD_SUCCESS'
const USER_LOAD_FAIL = 'user/USER_LOAD_FAIL'

const USER_CAPS_LOAD = 'user/USER_CAPS_LOAD'
const USER_CAPS_LOAD_SUCCESS = 'user/USER_CAPS_LOAD_SUCCESS'
const USER_CAPS_LOAD_FAIL = 'user/USER_CAPS_LOAD_FAIL'

const USER_SIGNIN_LOGS_LOAD = 'user/USER_SIGNIN_LOGS_LOAD'
const USER_SIGNIN_LOGS_LOAD_SUCCESS = 'user/USER_SIGNIN_LOGS_LOAD_SUCCESS'
const USER_SIGNIN_LOGS_LOAD_FAIL = 'user/USER_SIGNIN_LOGS_LOAD_FAIL'

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
          ...initialState.users,
          error: action.error,
        },
      }
    case USER_LOAD:
      return {
        ...state,
        user: {
          ...initialState.user,
          loading: true,
        },
      }
    case USER_LOAD_SUCCESS:
      return {
        ...state,
        user: {
          loading: false,
          loaded: true,
          user: action.result,
        },
      }
    case USER_LOAD_FAIL:
      return {
        ...state,
        user: {
          ...initialState.user,
          error: action.error,
        },
      }
    case USER_CAPS_LOAD:
      return {
        ...state,
        userCAPs: {
          ...initialState.userCAPs,
          loading: true,
        },
      }
    case USER_CAPS_LOAD_SUCCESS:
      return {
        ...state,
        userCAPs: {
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case USER_CAPS_LOAD_FAIL:
      return {
        ...state,
        userCAPs: {
          ...initialState.userCAPs,
          error: action.error,
        },
      }
    case USER_SIGNIN_LOGS_LOAD:
      return {
        ...state,
        userSignInLogs: {
          ...initialState.userSignInLogs,
          loading: true,
        },
      }
    case USER_SIGNIN_LOGS_LOAD_SUCCESS:
      return {
        ...state,
        userSignInLogs: {
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case USER_SIGNIN_LOGS_LOAD_FAIL:
      return {
        ...state,
        userSignInLogs: {
          ...initialState.userSignInLogs,
          error: action.error,
        },
      }
    case VIEW_USER_UNLOAD:
      return {
        ...state,
        user: initialState.user,
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

export function listUser({ tenantDomain, userId }) {
  return (dispatch) =>
    dispatch({
      types: [USER_LOAD, USER_LOAD_SUCCESS, USER_LOAD_FAIL],
      hideToastError: true,
      promise: async (client) => {
        try {
          const result = await client.get('/api/ListUsers', {
            params: { TenantFilter: tenantDomain, userId },
          })

          if (result.data && result.data.length > 0) {
            return result.data[0]
          }

          dispatch(setModalContent({ body: 'Error loading user', title: 'User Not Found' }))
          dispatch(showModal())
          dispatch({
            type: USER_LOAD_FAIL,
            hideToastError: true,
            error: new Error('User not found'),
          })
          return {}
        } catch (error) {
          dispatch(
            setModalContent({
              body: (
                <div>
                  Error loading user
                  <br />
                  <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
              ),
              title: 'User Not Found',
            }),
          )
          dispatch(showModal())
          return error
        }
      },
    })
}

export function listUserConditionalAccessPolicies({ tenantDomain, userId }) {
  return {
    types: [USER_CAPS_LOAD, USER_CAPS_LOAD_SUCCESS, USER_CAPS_LOAD_FAIL],
    hideToastError: true,
    promise: (client) =>
      client
        .get('/api/ListUserConditionalAccessPolicies', {
          params: { userId, tenantFilter: tenantDomain },
        })
        .then((result) => result.data),
  }
}

export function listUserSigninLogs({ tenantDomain, userId }) {
  return {
    types: [USER_SIGNIN_LOGS_LOAD, USER_SIGNIN_LOGS_LOAD_SUCCESS, USER_SIGNIN_LOGS_LOAD_FAIL],
    promise: (client) =>
      client
        .get('/api/ListUserSigninLogs', { params: { userId, tenantFilter: tenantDomain } })
        .then((result) => result.data)
        .then((result) => {
          if (!Array.isArray(result)) {
            return result
          }
          return result
        }),
  }
}

export function unloadViewUser() {
  return {
    type: VIEW_USER_UNLOAD,
  }
}
