import { combineReducers } from 'redux'
import app from './app'
import modal from './modal'
import tenants from './tenants'
import standards from './standards'
import version from './version'
import identity from './identity'

export default combineReducers({
  app,
  modal,
  tenants,
  standards,
  version,
  identity,
})
