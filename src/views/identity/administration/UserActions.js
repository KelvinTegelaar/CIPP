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
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { ModalService } from 'src/components/utilities'
import { CCallout, CSpinner } from '@coreui/react'

export default function UserActions({ tenantDomain, userId, userEmail, className = null }) {
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const handleModal = (modalMessage, modalUrl) => {
    ModalService.confirm({
      body: (
        <div style={{ overflow: 'visible' }}>
          <div>{modalMessage}</div>
        </div>
      ),
      title: 'Confirm',
      onConfirm: () => genericGetRequest({ path: modalUrl }),
    })
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
      onClick: () =>
        handleModal(
          'Are you sure you want to send an MFA push?',
          `/api/ExecSendPush?TenantFilter=${tenantDomain}&UserEmail=${userEmail}`,
        ),
    },
    {
      label: 'Convert to Shared Mailbox',
      link: '#',
      icon: faShareAlt,
      onClick: () =>
        handleModal(
          'Are you sure you want to convert this user to a shared mailbox',
          `/api/ExecConvertToSharedMailbox?TenantFilter=${tenantDomain}&ID=${userId}`,
        ),
    },
    {
      label: 'Block Sign In',
      link: '#',
      icon: faBan,
      onClick: () =>
        handleModal(
          'Are you sure you want to block this user from signing in?',
          `/api/ExecDisableUser?TenantFilter=${tenantDomain}&ID=${userId}`,
        ),
    },
    {
      label: 'Reset Password',
      link: '#',
      icon: faLockOpen,
      onClick: () =>
        handleModal(
          'Are you sure you want to reset the users password?',
          `/api/ExecResetPass?MustChange=false&TenantFilter=${tenantDomain}&ID=${userId}`,
        ),
    },
    {
      label: 'Delete User',
      link: '#',
      icon: faUserTimes,
      onClick: () =>
        handleModal(
          'Are you sure you want to delete the user?',
          `/api/RemoveUser?TenantFilter=${tenantDomain}&ID=${userId}`,
        ),
      color: 'danger',
    },
  ]

  return (
    <>
      {getResults.isFetching && (
        <CCallout color="success" dismissible>
          <CSpinner />
        </CCallout>
      )}
      {getResults.isError && (
        <CCallout color="danger" dismissible>
          Could not load API data. Error: {getResults.error?.message}
        </CCallout>
      )}
      {getResults.isSuccess && (
        <CCallout color="success" dismissible>
          {getResults.data?.Results}
        </CCallout>
      )}
      <ActionContentCard
        title="Actions"
        icon={faEllipsisH}
        content={actions}
        className={className}
      />
    </>
  )
}

UserActions.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  userEmail: PropTypes.string,
  className: PropTypes.string,
}
