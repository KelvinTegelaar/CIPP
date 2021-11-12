import { showToast } from './modules/toast'

export default function clientMiddleware(client) {
  return ({ dispatch, getState }) =>
    (next) =>
    (action) => {
      // handle function action creator
      if (typeof action === 'function') {
        return action(dispatch, getState, client)
      }

      const { promise, types, ...rest } = action

      // if action.promise is not defined, dispatch action as normal
      if (!promise) {
        return next(action)
      }

      // order of transient request states
      // started, success, fail
      const [REQUEST, SUCCESS, FAILURE] = types

      // execute request
      next({ ...rest, type: REQUEST })

      // pass api client to action creator
      const actionPromise = promise(client)

      // dispatch success/failures to reducer
      actionPromise
        .then((result) => next({ ...rest, result, type: SUCCESS }))
        .catch((error) => next({ ...rest, error, type: FAILURE }))

      return actionPromise
    }
}

// this will catch all errors, or any actions with prop `error` set
export function errorMiddleware() {
  return ({ dispatch, getState }) =>
    (next) =>
    (action) => {
      if (action.error) {
        console.error(action)
        const message =
          (action && action.error && action.error.message) || 'A generic error has occurred.'

        dispatch(
          showToast({
            title: 'An Uncaught Error Has Occurred',
            message: message,
            toastError: action.error,
          }),
        )
      }

      return next(action)
    }
}
