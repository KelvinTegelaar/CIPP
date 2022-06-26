import { createSlice } from '@reduxjs/toolkit'

export const azSlice = createSlice({
  name: 'az',
  initialState: {
    contactAZId: '',
  },
  reducers: {
    setContactAZId: (state, action) => {
      state.contactAZId = action.payload
    },
  },
})

export const { setContactAZId } = azSlice.actions

export default azSlice.reducer
