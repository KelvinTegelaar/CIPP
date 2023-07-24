// this will catch all errors, or any actions with prop `error` set
// set action.hideToastError to `true` to ignore this middleware
import { showToast } from 'src/store/features/toasts'
import { isRejectedWithValue } from '@reduxjs/toolkit'

export const errorMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (
      isRejectedWithValue(action) &&
      !action.error?.hideToastError &&
      action.payload.message !== 'canceled'
    ) {
      console.error(action)
      if (action.payload.data === 'Backend call failure') {
        action.payload.data =
          'The Azure Function has taken too long to respond. Try selecting a different report or a single tenant instead'
      }
      const message = action.payload?.data || 'A generic error has occurred.'
      if (message.length > 240) {
        message = message.substring(0, 240) + '...'
      }
      const toastError = action.payload

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
