import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  visible: false,
  body: undefined,
  title: undefined,
  size: undefined,
}
export const REDUCER_PATH = 'modal'
export const modalSlice = createSlice({
  name: REDUCER_PATH,
  initialState,
  reducers: {
    setVisible: (state, action) => {
      state.visible = action.payload
    },
    showModal: (state) => {
      state.visible = true
    },
    hideModal: (state) => {
      state.visible = false
    },
    resetModal: (state) => {
      state = initialState
    },
    setContent: (state, { title, body, size }) => {
      state.title = title
      state.body = body
      state.size = size
    },
  },
})

export const { resetModal, setVisible, setContent, hideModal, showModal } = modalSlice.actions
export default modalSlice.reducer
