const initialState = {
  clientPrincipal: {},
  isLoggedIn: false,
}

const CLIENTPRINCIPAL_LOAD = 'profile/CLIENTPRINCIPAL_LOAD'
const CLIENTPRINCIPAL_LOAD_SUCCESS = 'profile/CLIENTPRINCIPAL_LOAD_SUCCESS'
const CLIENTPRINCIPAL_LOAD_FAILURE = 'profile/CLIENTPRINCIPAL_LOAD_FAILURE'

export default function reducer(state = initialState, action = {}) {
  console.log(action.result)
  switch (action.type) {
    case CLIENTPRINCIPAL_LOAD:
      return { ...state }
    case CLIENTPRINCIPAL_LOAD_SUCCESS:
      return { ...state, clientPrincipal: action.result, isLoggedIn: true }
    case CLIENTPRINCIPAL_LOAD_FAILURE:
      return { ...state, clientPrincipal: {}, isLoggedIn: false }
    default:
      return state
  }
}

export function loadClientPrincipal() {
  return {
    types: [CLIENTPRINCIPAL_LOAD, CLIENTPRINCIPAL_LOAD_SUCCESS, CLIENTPRINCIPAL_LOAD_FAILURE],
    promise: (client) => client.get('/.auth/me').then((result) => result.data.clientPrincipal),
  }
}

export function getClientPrincipal() {
  return (dispatch, getState) => {
    return getState().profile.clientPrincipal
  }
}
