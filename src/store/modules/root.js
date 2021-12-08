import { combineReducers } from 'redux'
import app from './app'
import devices from './devices'
import domains from './domains'
import groups from './groups'
import licenses from './licenses'
import mailbox from './mailbox'
import modal from './modal'
import oneDrive from './oneDrive'
import profile from './profile'
import reports from './reports'
import sharepoint from './sharepoint'
import standards from './standards'
import tenants from './tenants'
import toast from './toast'
import users from './users'
import version from './version'
import roles from './roles'

export default combineReducers({
  app,
  devices,
  domains,
  groups,
  licenses,
  mailbox,
  modal,
  oneDrive,
  profile,
  reports,
  sharepoint,
  standards,
  tenants,
  toast,
  users,
  version,
  roles,
})
