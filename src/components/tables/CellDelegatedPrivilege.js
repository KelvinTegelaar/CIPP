import PropTypes from 'prop-types'
import { CellBadge } from './CellBadge'

export function CellDelegatedPrivilege({ cell }) {
  if (!cell) {
    return <CellBadge color="info" label="DAP" />
  }
  if (cell.toLowerCase() == 'none') {
    return <CellBadge color="info" label="No Access" />
  }
  if (cell === 'delegatedAdminPrivileges') {
    return <CellBadge color="info" label="DAP Only" />
  }
  if (cell === 'delegatedAndGranularDelegetedAdminPrivileges') {
    return <CellBadge color="info" label="GDAP & DAP" />
  }
  if (cell === 'granularDelegatedAdminPrivileges') {
    return <CellBadge color="info" label="GDAP" />
  }
  return <CellBadge color="info" label="Unknown" />
}

CellDelegatedPrivilege.propTypes = {
  cell: PropTypes.string,
}
