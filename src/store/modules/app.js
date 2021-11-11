const initialState = {
  sidebarShow: true,
  sidebarUnfoldable: false,
  currentTenant: {},
}

const TOGGLE_SHOW = 'app/TOGGLE_SHOW'
const TOGGLE_UNFOLDABLE = 'app/TOGGLE_UNFOLDABLE'
const SET_TENANT = 'app/SET_TENANT'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_SHOW:
      return { ...state, sidebarShow: action.sidebarShow }
    case TOGGLE_UNFOLDABLE:
      return { ...state, sidebarUnfoldable: action.sidebarUnfoldable }
    case SET_TENANT:
      return { ...state, currentTenant: action.currentTenant }
    default:
      return state
  }
}

export function toggleSidebarShow({ sidebarShow }) {
  return {
    type: TOGGLE_SHOW,
    sidebarShow: !sidebarShow,
  }
}

export function toggleSidebarUnfoldable({ unfoldable }) {
  return {
    type: TOGGLE_UNFOLDABLE,
    sidebarUnfoldable: !unfoldable,
  }
}

export function setCurrentTenant({ tenant }) {
  return {
    type: SET_TENANT,
    currentTenant: tenant,
  }
}

export function getCurrentTenant() {
  return (dispatch, getState) => {
    return getState().app.currentTenant
  }
}
