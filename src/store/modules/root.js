import { combineReducers } from 'redux'
import app from './app'
import tenants from './tenants'
import standards from './standards'
import version from './version'

export default combineReducers({
  app,
  tenants,
  standards,
  version,
})
