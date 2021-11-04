const initialState = {
  sidebarShow: true,
  sidebarUnfoldable: false,
}

const TOGGLE_SHOW = 'app/TOGGLE_SHOW'
const TOGGLE_UNFOLDABLE = 'app/TOGGLE_UNFOLDABLE'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_SHOW:
      return { ...state, sidebarShow: action.sidebarShow }
    case TOGGLE_UNFOLDABLE:
      return { ...state, sidebarUnfoldable: action.sidebarUnfoldable }
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
