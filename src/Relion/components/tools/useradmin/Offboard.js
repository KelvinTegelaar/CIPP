import React, { useState } from 'react'
import { Button, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import execOffboardUser from '../../../functions/execOffboardUser'
import { setContact } from '../../../store/features/userAdminSlice'

export default function Offboard() {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const contact = useSelector((state) => state.userAdmin.contact)
  const [result, setResult] = useState([])
  const offboardHandler = async (event, input) => {
    const r = await execOffboardUser(tenant.defaultDomainName, contact.userPrincipalName)
    console.log(r)
    setResult(r)
    dispatch(setContact({ id: 0, displayName: '', userPrincipalName: '' }))
  }

  return (
    <>
      <Button onClick={offboardHandler} variant="contained" color="error">
        Offboard
      </Button>
      <Typography>
        {result.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </Typography>
    </>
  )
}
