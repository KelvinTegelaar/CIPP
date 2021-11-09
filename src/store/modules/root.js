import { combineReducers } from 'redux'
import app from './app'
import tenants from './tenants'
import standards from './standards'
import version from './version'
import users from './users'

export default combineReducers({
  app,
  tenants,
  standards,
  version,
  users,
})
