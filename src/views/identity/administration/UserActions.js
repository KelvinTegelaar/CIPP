import React from 'react'
import PropTypes from 'prop-types'
import {
  faCog,
  faSync,
  faShareAlt,
  faBan,
  faLockOpen,
  faUserTimes,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons'
import { ActionContentCard } from 'src/components/contentcards'

export default function UserActions({ tenantDomain, userId, className = null }) {
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

  const editLink = `/identity/administration/users/edit?tenantDomain=${tenantDomain}&userId=${userId}`

  const actions = [
    {
      label: 'Edit User',
      link: editLink,
      icon: faCog,
    },
    {
      label: 'Send MFA Push',
      link: '#',
      icon: faSync,
      onClick: handlePush,
    },
    {
      label: 'Convert to Shared Mailbox',
      link: '#',
      icon: faShareAlt,
      onClick: handleConvert,
    },
    {
      label: 'Block Sign In',
      link: '#',
      icon: faBan,
      onClick: handleDisable,
    },
    {
      label: 'Reset Password',
      link: '#',
      icon: faLockOpen,
      onClick: handleResetPassword,
    },
    {
      label: 'Delete User',
      link: '#',
      icon: faUserTimes,
      onClick: handleDelete,
      color: 'danger',
    },
  ]

  return (
    <ActionContentCard title="Actions" icon={faEllipsisH} content={actions} className={className} />
  )
}

UserActions.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  className: PropTypes.string,
}
