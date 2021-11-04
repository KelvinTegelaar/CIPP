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
      if (!promise) return next(action)

      // order of transient request states
      // started, success, fail
      const [REQUEST, SUCCESS, FAILURE] = types

      // execute request
      next({ ...rest, type: REQUEST })

      // pass api client to action creator
      const actionPromise = promise(client)

      // dispatch success/failures to reducer
      actionPromise
        .then((result) => {
          return next({ ...rest, result, type: SUCCESS })
        })
        .catch((error) => {
          next({ ...rest, error, type: FAILURE })
        })
      return actionPromise
    }
}
