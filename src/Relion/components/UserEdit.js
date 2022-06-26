import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import getUsers from '../functions/getUsers'
import execDisableUser from '../functions/execDisableUser'
import { Link, Typography } from '@mui/material'

const UserEdit = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const defaultDomainName = tenant.defaultDomainName
  const contactEmail = useSelector((state) => state.ticket.contactEmail)
  const [userPrincipalName, setUserPrincipalName] = useState()
  const [contactAZId, setContactAZId] = useState()
  const [disableUserResult, setDisableUserResult] = useState()
  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsers(defaultDomainName)
      const contactAZ = data.find((item) => item.userPrincipalName === contactEmail)
      setContactAZId(contactAZ.id)
      setUserPrincipalName(contactAZ.userPrincipalName)
      console.log(contactAZ)
    }
    fetchData().catch(console.error)
  }, [defaultDomainName, contactEmail])

  const disableHandler = async () => {
    const result = await execDisableUser(defaultDomainName, contactAZId)
    const resultJSON = JSON.stringify(result)
    setDisableUserResult(resultJSON)
  }

  return (
    <>
      <div>{userPrincipalName}</div>
      <Link onClick={disableHandler}>Disable User</Link>
      <Typography>{disableUserResult}</Typography>
    </>
  )
}

export default UserEdit
