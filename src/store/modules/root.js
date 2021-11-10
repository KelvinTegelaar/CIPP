import { combineReducers } from 'redux'
import app from './app'
import modal from './modal'
import tenants from './tenants'
import standards from './standards'
import version from './version'
import users from './users'

export default combineReducers({
  app,
  modal,
  tenants,
  standards,
  version,
  users,
})
