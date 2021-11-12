const initialState = {
  toasts: [],
  // index toasts to allow multiple, used for removal
  currentIndex: 0,
}

const SHOW_TOAST = 'toast/SHOW_TOAST'
const RESET_TOAST = 'toast/RESET_TOAST'
const CLOSE_TOAST = 'toast/CLOSE_TOAST'

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SHOW_TOAST:
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        toasts: [
          ...state.toasts,
          {
            message: action.message,
            title: action.title,
            toastError: action.toastError,
            index: state.currentIndex + 1,
          },
        ],
      }
    case CLOSE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((el) => el.index !== action.index),
      }
    case RESET_TOAST:
      return initialState
    default:
      return state
  }
}

export function showToast({ message, title, toastError = {} }) {
  return {
    type: SHOW_TOAST,
    message,
    title,
    toastError,
  }
}

export function makeToast({ message, title, toastError }) {
  return showToast({ message, title, toastError })
}

export function closeToast({ index }) {
  return {
    type: CLOSE_TOAST,
    index,
  }
}

export function resetToast() {
  return {
    type: RESET_TOAST,
  }
}
