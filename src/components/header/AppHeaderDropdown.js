import React, { useState } from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownHeader,
  CDropdownMenu,
  CDropdownToggle,
  CLink,
} from '@coreui/react'
import { faUser, faBook, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { authApi } from '../../store/api/auth'
import CippProfile from '../CippProfile'
import CippOffcanvas from '../cipp/CippOffcanvas'

const AppHeaderDropdown = () => {
  const [profileVisible, setProfileVisible] = useState(false)
  const { data: profile } = authApi.endpoints.loadClientPrincipal.useQueryState()
  const cippProfile = <CippProfile />
  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
          <CAvatar color="primary" textColor="white" size="md">
            {profile.clientPrincipal.userDetails[0].toUpperCase()}
          </CAvatar>
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownHeader className="fw-semibold py-2">Settings</CDropdownHeader>
          <CLink className="dropdown-item" href="#" onClick={() => setProfileVisible(true)}>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Profile
          </CLink>
          <Link className="dropdown-item" to="/cipp/logs">
            <FontAwesomeIcon icon={faBook} className="me-2" />
            Logbook
          </Link>
        </CDropdownMenu>
      </CDropdown>
      <CippOffcanvas
        id="cipp-profile"
        visible={profileVisible}
        hideFunction={() => setProfileVisible(false)}
        title="Profile"
        placement="end"
        children={cippProfile}
      />
    </>
  )
}

export default AppHeaderDropdown
