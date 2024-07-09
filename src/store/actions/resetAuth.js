import { createAction } from '@reduxjs/toolkit'

export const RESET_AUTH_ACTION_TYPE = 'resetAuth'
export const resetAuthAction = createAction(RESET_AUTH_ACTION_TYPE, () => {
  return { payload: null }
})
