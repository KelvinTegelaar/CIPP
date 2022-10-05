import { isRejectedWithValue } from '@reduxjs/toolkit'
//import { resetAuthAction } from 'src/store/actions'
//import { authApi } from 'src/store/api/auth'

export const unauthenticatedMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (isRejectedWithValue(action) && action.payload.status === 401) {
      //dispatch(resetAuthAction())
      //dispatch(authApi.utils.resetApiState())

      // Catch API call on timed out SWA session and send to login page
      window.location.href = '/.auth/login/aad?post_login_redirect_uri=' + window.location.href
    }

    return next(action)
  }
