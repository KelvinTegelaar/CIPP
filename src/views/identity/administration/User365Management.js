import React from 'react'
import { faUsers, faLaptop } from '@fortawesome/free-solid-svg-icons'
import { faMicrosoft } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import { ActionContentCard } from 'src/components/contentcards'

export default function User365Management({ tenantDomain, userId, className }) {
  const azureADLink = `https://portal.azure.com/${tenantDomain}/#blade/Microsoft_AAD_IAM/UserDetailsMenuBlade/Profile/userId/${userId}`
  const endpointManagerLink = `https://endpoint.microsoft.com/${tenantDomain}/#blade/Microsoft_AAD_IAM/UserDetailsMenuBlade/Profile/userId/${userId}`
  const actions = [
    {
      label: 'View in Azure AD',
      link: azureADLink,
      icon: faUsers,
      target: '_blank',
    },
    {
      label: 'View in Endpoint Manager',
      link: endpointManagerLink,
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
