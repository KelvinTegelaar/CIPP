import { setModalContent, showModal } from './modal'
import React from 'react'

const initialState = {
  users: {
    list: [],
    loading: false,
    loaded: false,
  },
  user: {
    loading: false,
    loaded: false,
    user: undefined,
  },
  licenses: {
    loading: false,
    loaded: false,
    list: [],
  },
  cap: {
    loading: false,
    loaded: false,
    policies: [],
  },
  groups: {
    list: [],
    loading: false,
    loaded: false,
  },
  devices: {
    list: [],
    loading: false,
    loaded: false,
  },
  oneDrive: {
    usage: {},
    loading: false,
    loaded: false,
  },
  mailbox: {
    details: {},
    loading: false,
    loaded: false,
  },
  signin: {
    logs: [],
    loading: false,
    loaded: false,
  },
  domains: {
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

const DEVICES_LOAD = 'devices/DEVICES_LOAD'
const DEVICES_LOAD_SUCCESS = 'devices/DEVICES_LOAD_SUCCESS'
const DEVICES_LOAD_ERROR = 'devices/DEVICES_LOAD_ERROR'

const DOMAINS_LOAD = 'users/DOMAINS_LOAD'
const DOMAINS_LOAD_SUCCESS = 'users/DOMAINS_LOAD_SUCCESS'
const DOMAINS_LOAD_FAIL = 'users/DOMAINS_LOAD_FAIL'

const USER_LOAD = 'user/USER_LOAD'
const USER_LOAD_SUCCESS = 'user/USER_LOAD_SUCCESS'
const USER_LOAD_FAIL = 'user/USER_LOAD_FAIL'

const LICENSE_LOAD = 'user/LICENSE_LOAD'
const LICENSE_LOAD_SUCCESS = 'user/LICENSE_LOAD_SUCCESS'
const LICENSE_LOAD_FAIL = 'user/LICENSE_LOAD_FAIL'

const USER_DEVICES_LOAD = 'user/USER_DEVICES_LOAD'
const USER_DEVICES_LOAD_SUCCESS = 'user/USER_DEVICES_LOAD_SUCCESS'
const USER_DEVICES_LOAD_FAIL = 'user/USER_DEVICES_LOAD_FAIL'

const USER_CAPS_LOAD = 'user/USER_CAPS_LOAD'
const USER_CAPS_LOAD_SUCCESS = 'user/USER_CAPS_LOAD_SUCCESS'
const USER_CAPS_LOAD_FAIL = 'user/USER_CAPS_LOAD_FAIL'

const ONEDRIVE_USAGE_LOAD = 'user/ONEDRIVE_USAGE_LOAD'
const ONEDRIVE_USAGE_LOAD_SUCCESS = 'user/ONEDRIVE_USAGE_LOAD_SUCCESS'
const ONEDRIVE_USAGE_LOAD_FAIL = 'user/ONEDRIVE_USAGE_LOAD_FAIL'

const USER_MAILBOX_DETAILS_LOAD = 'user/USER_MAILBOX_DETAILS_LOAD'
const USER_MAILBOX_DETAILS_LOAD_SUCCESS = 'user/USER_MAILBOX_DETAILS_LOAD_SUCCESS'
const USER_MAILBOX_DETAILS_LOAD_FAIL = 'user/USER_MAILBOX_DETAILS_LOAD_FAIL'

const USER_GROUPS_LOAD = 'user/USER_GROUPS_LOAD'
const USER_GROUPS_LOAD_SUCCESS = 'user/USER_GROUPS_LOAD_SUCCESS'
const USER_GROUPS_LOAD_FAIL = 'user/USER_GROUPS_LOAD_FAIL'

const USER_SIGNIN_LOGS_LOAD = 'user/USER_SIGNIN_LOGS_LOAD'
const USER_SIGNIN_LOGS_LOAD_SUCCESS = 'user/USER_SIGNIN_LOGS_LOAD_SUCCESS'
const USER_SIGNIN_LOGS_LOAD_FAIL = 'user/USER_SIGNIN_LOGS_LOAD_FAIL'

const VIEW_USER_UNLOAD = 'user/VIEW_USER_UNLOAD'

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
    case GROUPS_LOAD_ERROR:
      return {
        ...state,
        users: {
          ...state.groups,
          loading: false,
          loaded: false,
        },
      }
    case DEVICES_LOAD:
      return {
        ...state,
        devices: {
          ...state.devices,
          loading: true,
          loaded: false,
        },
      }
    case DEVICES_LOAD_SUCCESS:
      return {
        ...state,
        devices: {
          ...state.devices,
          list: action.result,
          loading: false,
          loaded: true,
        },
      }
    case DEVICES_LOAD_ERROR:
      return {
        ...state,
        devices: {
          ...state.devices,
          loading: false,
          loaded: false,
        },
      }
    case USER_LOAD:
      return {
        ...state,
        user: {
          loading: true,
          loaded: false,
          user: {},
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
          loading: false,
          loaded: false,
          error: action.error,
        },
      }
    case LICENSE_LOAD:
      return {
        ...state,
        licenses: {
          loaded: false,
          loading: true,
        },
      }
    case LICENSE_LOAD_SUCCESS:
      return {
        ...state,
        licenses: {
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case LICENSE_LOAD_FAIL:
      return {
        ...state,
        licenses: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      }
    case USER_DEVICES_LOAD:
      return {
        ...state,
        devices: {
          ...initialState.devices,
          loading: true,
        },
      }
    case USER_DEVICES_LOAD_SUCCESS:
      return {
        ...state,
        devices: {
          loading: false,
          loaded: true,
          devices: action.result,
        },
      }
    case USER_DEVICES_LOAD_FAIL:
      return {
        ...state,
        devices: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      }
    case USER_CAPS_LOAD:
      return {
        ...state,
        cap: {
          ...initialState.cap,
          loading: true,
        },
      }
    case USER_CAPS_LOAD_SUCCESS:
      return {
        ...state,
        cap: {
          loading: false,
          loaded: true,
          policies: action.result,
        },
      }
    case USER_CAPS_LOAD_FAIL:
      return {
        ...state,
        cap: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      }
    case USER_GROUPS_LOAD:
      return {
        ...state,
        groups: {
          ...initialState.groups,
          loading: true,
        },
      }
    case USER_GROUPS_LOAD_SUCCESS:
      return {
        ...state,
        groups: {
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case USER_GROUPS_LOAD_FAIL:
      return {
        ...state,
        groups: {
          ...initialState.groups,
          error: action.error,
        },
      }
    case ONEDRIVE_USAGE_LOAD:
      return {
        ...state,
        oneDrive: {
          ...initialState.oneDrive,
          loading: true,
        },
      }
    case ONEDRIVE_USAGE_LOAD_SUCCESS:
      return {
        ...state,
        oneDrive: {
          loading: false,
          loaded: true,
          report: action.result,
        },
      }
    case ONEDRIVE_USAGE_LOAD_FAIL:
      return {
        ...state,
        oneDrive: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      }
    case USER_MAILBOX_DETAILS_LOAD:
      return {
        ...state,
        mailbox: {
          ...initialState.mailbox,
          loading: true,
        },
      }
    case USER_MAILBOX_DETAILS_LOAD_SUCCESS:
      return {
        ...state,
        mailbox: {
          loading: false,
          loaded: true,
          details: action.result,
        },
      }
    case USER_MAILBOX_DETAILS_LOAD_FAIL:
      return {
        ...state,
        mailbox: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      }
    case USER_SIGNIN_LOGS_LOAD:
      return {
        ...state,
        signin: {
          ...initialState.signin,
          loading: true,
        },
      }
    case USER_SIGNIN_LOGS_LOAD_SUCCESS:
      return {
        ...state,
        signin: {
          loading: false,
          loaded: true,
          logs: action.result,
        },
      }
    case USER_SIGNIN_LOGS_LOAD_FAIL:
      return {
        ...state,
        signin: {
          ...initialState.logs,
          error: action.error,
        },
      }
    case VIEW_USER_UNLOAD:
      return {
        ...state,
        user: initialState.user,
        cap: initialState.cap,
        oneDrive: initialState.oneDrive,
        devices: initialState.devices,
        licenses: initialState.licenses,
        groups: initialState.groups,
        mailbox: initialState.mailbox,
      }
    case DOMAINS_LOAD:
      return {
        ...state,
        domains: {
          ...initialState.domains,
          loading: true,
        },
      }
    case DOMAINS_LOAD_SUCCESS:
      return {
        ...state,
        domains: {
          loading: false,
          loaded: true,
          list: [...action.result],
        },
      }
    case DOMAINS_LOAD_FAIL:
      return {
        ...state,
        domains: {
          ...initialState.domains,
          error: action.error,
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

export function listDevices({ tenant }) {
  return {
    types: [DEVICES_LOAD, DEVICES_LOAD_SUCCESS, DEVICES_LOAD_ERROR],
    promise: (client) =>
      client
        .get('/api/ListDevices?Tenantfilter=' + tenant.defaultDomainName)
        .then((result) => result.data),
  }
}

export function listDomains({ tenantDomain }) {
  return {
    types: [DOMAINS_LOAD, DOMAINS_LOAD_SUCCESS, DOMAINS_LOAD_FAIL],
    promise: (client) =>
      client
        .get('/api/ListDomains', { params: { tenantFilter: tenantDomain } })
        .then((result) => result.data),
  }
}

export function listUser({ tenantDomain, userId }) {
  return (dispatch) =>
    dispatch({
      types: [USER_LOAD, USER_LOAD_SUCCESS, USER_LOAD_FAIL],
      hideToastError: true,
      promise: (client) =>
        client
          .get('/api/ListUsers', { params: { TenantFilter: tenantDomain, userId } })
          .then((result) => {
            if (result.data && result.data.length > 0) {
              return result.data[0]
            }
            dispatch(setModalContent({ body: 'Error loading user', title: 'User Not Found' }))
            dispatch(showModal())
          })
          .catch((error) => {
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
          }),
    })
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

export function listLicenses({ tenantDomain }) {
  return {
    types: [LICENSE_LOAD, LICENSE_LOAD_SUCCESS, LICENSE_LOAD_FAIL],
    hideToastError: true,
    promise: (client) =>
      client
        .get('/api/ListLicenses', { params: { tenantFilter: tenantDomain } })
        .then((result) => result.data),
  }
}

export function listUserDevices({ tenantDomain, userId }) {
  return {
    types: [USER_DEVICES_LOAD, USER_DEVICES_LOAD_SUCCESS, USER_DEVICES_LOAD_FAIL],
    hideToastError: true,
    promise: (client) =>
      client
        .get('/api/ListUserDevices', { params: { userId, tenantFilter: tenantDomain } })
        .then((result) => result.data),
  }
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

export function listUserMailboxDetails({ tenantDomain, userId }) {
  return {
    types: [
      USER_MAILBOX_DETAILS_LOAD,
      USER_MAILBOX_DETAILS_LOAD_SUCCESS,
      USER_MAILBOX_DETAILS_LOAD_FAIL,
    ],
    promise: (client) =>
      client
        .get('/api/ListUserMailboxDetails', { params: { userId, tenantFilter: tenantDomain } })
        .then((result) => {
          if (result.data && result.data.length > 0) {
            return result.data[0]
          }
          return {}
        }),
  }
}

// @todo is this only used for onedrive?
export function listOneDriveUsage({ tenantDomain, userUPN }) {
  return (dispatch) =>
    dispatch({
      types: [ONEDRIVE_USAGE_LOAD, ONEDRIVE_USAGE_LOAD_SUCCESS, ONEDRIVE_USAGE_LOAD_FAIL],
      hideToastError: true,
      promise: (client) =>
        client
          .get('/api/ListSites', {
            params: { type: 'OneDriveUsageAccount', userUPN, tenantFilter: tenantDomain },
          })
          .then((result) => {
            if (result.data && result.data.length > 0) {
              return result.data[0]
            }
            return {}
          }),
    })
}

export function unloadViewUser() {
  return {
    type: VIEW_USER_UNLOAD,
  }
}
