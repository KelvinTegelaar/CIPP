import { isRejectedWithValue } from '@reduxjs/toolkit'
import { resetAuthAction } from '../actions'
import { authApi } from '../api/auth'

export const unauthenticatedMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (isRejectedWithValue(action) && action.payload.status === 401) {
      dispatch(resetAuthAction())
      dispatch(authApi.utils.resetApiState())
    }

    return next(action)
  }
