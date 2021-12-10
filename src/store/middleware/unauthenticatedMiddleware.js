import { isRejectedWithValue } from '@reduxjs/toolkit'
import { resetAuthAction } from '../actions'

export const unauthenticatedMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (isRejectedWithValue(action) && action.payload.status === 401) {
      dispatch(resetAuthAction())
    }

    return next(action)
  }
