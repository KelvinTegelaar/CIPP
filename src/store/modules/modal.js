const initialState = {
  visible: false,
  body: undefined,
  title: undefined,
}

const SET_VISIBLE = 'modal/SET_VISIBLE'
const SET_CONTENT = 'modal/SET_CONTENT'
const RESET_MODAL = 'modal/RESET_MODAL'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_VISIBLE:
      return {
        ...state,
        visible: action.visible,
      }
    case SET_CONTENT:
      return {
        ...state,
        body: action.body,
        title: action.title,
      }
    case RESET_MODAL:
      return initialState
    default:
      return state
  }
}

export function setVisible(visible) {
  return { type: SET_VISIBLE, visible }
}

export function showModal() {
  return setVisible(true)
}

export function hideModal() {
  return resetModal()
}

export function resetModal() {
  return {
    type: RESET_MODAL,
  }
}

export function setModalContent({ body, title }) {
  return {
    type: SET_CONTENT,
    body: body,
    title,
  }
}
