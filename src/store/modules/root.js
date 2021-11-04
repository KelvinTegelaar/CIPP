import { combineReducers } from 'redux'
import app from './app'
import tenants from './tenants'

export default combineReducers({
  app,
  tenants,
})
