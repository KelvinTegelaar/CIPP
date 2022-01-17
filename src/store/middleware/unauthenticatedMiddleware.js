import { isRejectedWithValue } from '@reduxjs/toolkit'
import { resetAuthAction } from 'src/store/actions'
import { authApi } from 'src/store/api/auth'

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
