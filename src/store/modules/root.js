import { combineReducers } from 'redux'
import app from './app'
import profile from './profile'
import identity from './identity'
import modal from './modal'
import reports from './reports'
import tenants from './tenants'
import standards from './standards'
import version from './version'

export default combineReducers({
  app,
  profile,
  identity,
  modal,
  reports,
  tenants,
  standards,
  version,
})
