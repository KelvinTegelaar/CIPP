const initialState = {
  devices: {
    list: [],
    loading: false,
    loaded: false,
    error: undefined,
  },
  userDevices: {
    list: [],
    loading: false,
    loaded: false,
    error: undefined,
  },
}

const DEVICES_LOAD = 'devices/DEVICES_LOAD'
const DEVICES_LOAD_SUCCESS = 'devices/DEVICES_LOAD_SUCCESS'
const DEVICES_LOAD_ERROR = 'devices/DEVICES_LOAD_ERROR'

const USER_DEVICES_LOAD = 'devices/USER_DEVICES_LOAD'
const USER_DEVICES_LOAD_SUCCESS = 'devices/USER_DEVICES_LOAD_SUCCESS'
const USER_DEVICES_LOAD_FAIL = 'devices/USER_DEVICES_LOAD_FAIL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case USER_DEVICES_LOAD:
      return {
        ...state,
        userDevices: {
          ...initialState.userDevices,
          loading: true,
        },
      }
    case USER_DEVICES_LOAD_SUCCESS:
      return {
        ...state,
        userDevices: {
          loading: false,
          loaded: true,
          list: action.result,
        },
      }
    case USER_DEVICES_LOAD_FAIL:
      return {
        ...state,
        userDevices: {
          ...initialState.userDevices,
          error: action.error,
        },
      }
    case DEVICES_LOAD:
      return {
        ...state,
        devices: {
          ...initialState.devices,
          loading: true,
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
          ...initialState.devices,
          error: action.error,
        },
      }
    default:
      return state
  }
}

export function listDevices({ tenantDomain }) {
  return {
    types: [DEVICES_LOAD, DEVICES_LOAD_SUCCESS, DEVICES_LOAD_ERROR],
    promise: (client) =>
      client.get('/api/ListDevices?Tenantfilter=' + tenantDomain).then((result) => result.data),
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
