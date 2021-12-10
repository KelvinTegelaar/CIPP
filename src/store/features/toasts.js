import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  toasts: [],
  currentIndex: 0,
}

export const TOAST_REDUCER_PATH = 'toasts'
export const toastsSlice = createSlice({
  name: TOAST_REDUCER_PATH,
  initialState,
  reducers: {
    showToast: (state, { message, title, toastError }) => {
      state.currentIndex++
      state.toasts.push({ message, title, toastError, index: state.currentIndex })
    },
    closeToast: (state, { index }) => {
      state.toasts.filter((el) => el.index !== index)
    },
    resetToast: (state) => {
      state = initialState
    },
  },
})

export const { showToast } = toastsSlice.actions
export default toastsSlice.reducer
