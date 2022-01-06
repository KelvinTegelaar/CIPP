import { combineReducers } from '@reduxjs/toolkit'

// features
import appReducer, { appSlice } from './features/app'
import authReducer, { authSlice } from './features/auth'
import { modalSlice } from './features/modal'
import { toastsSlice } from './features/toasts'
import { switcherSlice } from './features/switcher'

// apis
import { baseApi } from './api/baseApi'

// actions
import { RESET_STATE_ACTION_TYPE } from './actions/resetState'
import { RESET_AUTH_ACTION_TYPE } from './actions/resetAuth'

export const root = {
  // slices
  [appSlice.name]: appReducer,
  [authSlice.name]: authReducer,
  [modalSlice.name]: modalSlice.reducer,
  [switcherSlice.name]: switcherSlice.reducer,
  [toastsSlice.name]: toastsSlice.reducer,

  // api
  [baseApi.reducerPath]: baseApi.reducer,
}

export const apiMiddleware = [baseApi.middleware]

const combinedReducer = combineReducers(root)

// global reducer
export const rootReducer = (state = {}, action = {}) => {
  switch (action.type) {
    case RESET_STATE_ACTION_TYPE:
      state = {}
      break
    case RESET_AUTH_ACTION_TYPE:
      state = { ...state, auth: {} }
      break
    default:
      break
  }

  // noinspection JSCheckFunctionSignatures
  return combinedReducer(state, action)
}
