import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import getUsers from '../functions/getUsers'

const UserEdit = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const contactEmail = useSelector((state) => state.ticket.contactEmail)
  const [contactADId, setContactADId] = useState()
  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsers(tenant.defaultDomainName)
      const contactAD = data.find((item) => item.userPrincipalName === contactEmail)
      console.log(contactAD.id)
      setContactADId(contactAD.id)
    }
    fetchData().catch(console.error)
  }, [tenant.defaultDomainName, contactEmail])

  return <div>ContactADId: {contactADId}</div>
}

export default UserEdit
