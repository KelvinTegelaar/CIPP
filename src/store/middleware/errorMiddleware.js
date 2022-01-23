// this will catch all errors, or any actions with prop `error` set
// set action.hideToastError to `true` to ignore this middleware
import { showToast } from 'src/store/features/toasts'
import { isRejectedWithValue } from '@reduxjs/toolkit'

export const errorMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (isRejectedWithValue(action) && !action.error?.hideToastError) {
      console.error(action)
      const message = action.payload?.message || 'A generic error has occurred.'

      const toastError = process.env.NODE_ENV === 'production' ? action.payload || {} : action

      dispatch(
        showToast({
          title: 'An Error Has Occurred',
          message: message,
          toastError,
        }),
      )
    }

    return next(action)
  }
