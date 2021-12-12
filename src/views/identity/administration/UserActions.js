import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import {
  faCog,
  faSync,
  faShareAlt,
  faBan,
  faLockOpen,
  faUserTimes,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'
import { useListUserQuery } from '../../../store/api/users'

export default function UserActions({ tenantDomain, userId }) {
  const { data: user, isFetching, error } = useListUserQuery({ tenantDomain, userId })

  // @TODO make these work
  const handlePush = () => {
    alert('pushy')
    // api/ExecSendPush?TenantFilter= + TenantID + &UserEmail= + EmailAddress
  }

  const handleConvert = () => {
    alert('converty')
    // api/ExecConvertToSharedMailbox?TenantFilter= + TenantID + &ID= + UserID
  }

  const handleDisable = () => {
    alert('disabley')
    // api/ExecDisableUser?TenantFilter= + TenantID + &ID= + UserID
  }

  const handleResetPassword = () => {
    alert('resetty')
    // api/ExecResetPass?TenantFilter= + TenantID + &ID= + UserID
  }

  const handleDelete = () => {
    alert('deletey')
    // api/RemoveUser?TenantFilter= + TenantID + &ID= + UserID
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>Actions</CCardTitle>
        <FontAwesomeIcon icon={faCog} />
      </CCardHeader>
      <CCardBody>
        <Link
          className="dropdown-item"
          to={`/identity/administration/users/edit?tenantDomain=${tenantDomain}&userId=${userId}`}
        >
          <FontAwesomeIcon icon={faCog} className="me-2" />
          Edit User
        </Link>
        <Link className="dropdown-item" onClick={handlePush}>
          <FontAwesomeIcon icon={faSync} className="me-2" />
          Send MFA Push to User
        </Link>
        <Link className="dropdown-item" onClick={handleConvert}>
          <FontAwesomeIcon icon={faShareAlt} className="me-2" />
          Convert to Shared Mailbox
        </Link>
        <Link className="dropdown-item" onClick={handleDisable}>
          <FontAwesomeIcon icon={faBan} className="me-2" />
          Block Sign In
        </Link>
        <Link className="dropdown-item" onClick={handleResetPassword}>
          <FontAwesomeIcon icon={faLockOpen} className="me-2" />
          Reset Password
        </Link>
        <Link className="dropdown-item" onClick={handleDelete}>
          <FontAwesomeIcon icon={faUserTimes} className="me-2" />
          Delete User
        </Link>
      </CCardBody>
    </CCard>
  )
}

UserActions.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
}
