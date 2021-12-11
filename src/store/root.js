import { combineReducers } from '@reduxjs/toolkit'

// features
import appReducer, { appSlice } from './features/app'
import authReducer, { authSlice } from './features/auth'
import { modalSlice } from './features/modal'
import { toastsSlice } from './features/toasts'

// apis
import { appApi } from './api/app'
import { authApi } from './api/auth'
import { datatableApi } from './api/datatable'
import { devicesApi } from './api/devices'
import { groupsApi } from './api/groups'
import { mailboxApi } from './api/mailbox'
import { oneDriveApi } from './api/oneDrive'
import { reportsApi } from './api/reports'
import { tenantsApi } from './api/tenants'
import { usersApi } from './api/users'

// actions
import { RESET_STATE_ACTION_TYPE } from './actions/resetState'
import { RESET_AUTH_ACTION_TYPE } from './actions/resetAuth'

export const root = {
  // slices
  [appSlice.name]: appReducer,
  [authSlice.name]: authReducer,
  [modalSlice.name]: modalSlice.reducer,
  [toastsSlice.name]: toastsSlice.reducer,

  // apis
  [appApi.reducerPath]: appApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [datatableApi.reducerPath]: datatableApi.reducer,
  [devicesApi.reducerPath]: devicesApi.reducer,
  [groupsApi.reducerPath]: groupsApi.reducer,
  [mailboxApi.reducerPath]: mailboxApi.reducer,
  [oneDriveApi.reducerPath]: oneDriveApi.reducer,
  [reportsApi.reducerPath]: reportsApi.reducer,
  [tenantsApi.reducerPath]: tenantsApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
}

export const apiMiddleware = [
  appApi.middleware,
  authApi.middleware,
  datatableApi.middleware,
  devicesApi.middleware,
  groupsApi.middleware,
  mailboxApi.middleware,
  oneDriveApi.middleware,
  reportsApi.middleware,
  tenantsApi.middleware,
  usersApi.middleware,
]

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
