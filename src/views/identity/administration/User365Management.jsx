import React from 'react'
import { faUsers, faLaptop } from '@fortawesome/free-solid-svg-icons'
import { faMicrosoft } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import { ActionContentCard } from 'src/components/contentcards'

export default function User365Management({ tenantDomain, userId, className }) {
  const entraLink = `https://entra.microsoft.com/${tenantDomain}/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/${userId}`
  const intuneLink = `https://intune.microsoft.com/${tenantDomain}/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/${userId}`
  const actions = [
    {
      label: 'View in Entra',
      link: entraLink,
      icon: faUsers,
      target: '_blank',
    },
    {
      label: 'View in Intune',
      link: intuneLink,
      icon: faLaptop,
      target: '_blank',
    },
  ]
  return (
    <ActionContentCard
      title="M365 Management"
      icon={faMicrosoft}
      content={actions}
      className={className}
    />
  )
}

User365Management.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  className: PropTypes.string,
}
