import { combineReducers } from '@reduxjs/toolkit'
import { toastsSlice } from './toasts'

export const rootReducer = combineReducers({
  [toastsSlice.name]: toastsSlice.reducer,
})
