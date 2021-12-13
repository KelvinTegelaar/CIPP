import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  visible: false,
  body: undefined,
  confirm: false,
  componentType: 'text',
  componentProps: {},
  data: undefined,
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
    resetModal: () => {
      return { ...initialState }
    },
    setModalContent: (state, { payload }) => {
      return { ...initialState, ...payload }
    },
  },
})

export const { resetModal, setVisible, setModalContent, hideModal, showModal } = modalSlice.actions
export default modalSlice.reducer
