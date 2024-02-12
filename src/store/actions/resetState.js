import { createAction } from '@reduxjs/toolkit'

export const RESET_STATE_ACTION_TYPE = 'resetState'
export const resetStateAction = createAction(RESET_STATE_ACTION_TYPE, () => {
  return { payload: null }
})
