import { createSlice } from '@reduxjs/toolkit'

export const azSlice = createSlice({
  name: 'az',
  initialState: {
    contactAZ: { id: 0, displayName: '', userPrincipalName: '' },
  },
  reducers: {
    setContactAZ: (state, action) => {
      state.contactAZ = action.payload
    },
  },
})

export const { setContactAZ } = azSlice.actions

export default azSlice.reducer
