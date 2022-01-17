import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const initialState = {}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAccessToken(state, action) {
      state.accessToken = action.payload
    },
  },
})

export const { updateAccessToken } = authSlice.actions

export default persistReducer(
  {
    key: 'rtk:auth',
    storage,
    whitelist: ['accessToken'],
  },
  authSlice.reducer,
)
