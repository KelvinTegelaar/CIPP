import React from 'react'
import { CAvatar, CDropdown, CDropdownHeader, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cilSettings, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { Link } from 'react-router-dom'
import avatar0 from './../../assets/images/avatars/0.jpg'

const AppHeaderDropdown = () => {
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <CAvatar src={avatar0} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">Settings</CDropdownHeader>
        <Link className="dropdown-item" to="/profile/view">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </Link>
        <Link className="dropdown-item" to="/profile/settings">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </Link>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
