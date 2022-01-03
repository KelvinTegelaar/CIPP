import React from 'react'
import { CAvatar, CDropdown, CDropdownHeader, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { faUser, faBook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { authApi } from '../../store/api/auth'

const AppHeaderDropdown = () => {
  const { data: profile } = authApi.endpoints.loadClientPrincipal.useQueryState()
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <CAvatar color="primary" textColor="white" size="md">
          {profile.clientPrincipal.userDetails[0].toUpperCase()}
        </CAvatar>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="fw-semibold py-2">Settings</CDropdownHeader>
        <Link className="dropdown-item" to="/profile/view">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          Profile
        </Link>
        <Link className="dropdown-item" to="/cipp/logs">
          <FontAwesomeIcon icon={faBook} className="me-2" />
          Logbook
        </Link>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
