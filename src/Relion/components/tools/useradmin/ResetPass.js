import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Typography } from '@mui/material'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { setNotes } from '../../../store/features/ticketFormSlice'
import Password from './Password'

export default function ResetPass() {
  const dispatch = useDispatch()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const tenant = useSelector((state) => state.app.currentTenant)
  const contact = useSelector((state) => state.userAdmin.contact)
  const password = useSelector((state) => state.userAdmin.password)

  useEffect(() => {
    dispatch(
      setNotes(`${contact.displayName}'s new login:\n\n${contact.userPrincipalName} / ${password}`),
    )
  }, [contact, password, dispatch])

  const resetHandler = () => {
    const shippedValues = {
      DisplayName: contact.displayName,
      Password: password,
      UserID: contact.id,
      tenantID: tenant.defaultDomainName,
      mustchangepass: false,
    }
    console.log(shippedValues)
    genericPostRequest({ path: '/api/NewPassphrase', values: shippedValues })
  }

  // dynamically generate result jsx
  const fetchResult = () => {
    if (postResults.isFetching) {
      return <Typography color="success">Loading...</Typography>
    } else if (postResults.isSuccess) {
      return (
        <Typography color="success">
          {postResults.data.Results.map((message, idx) => {
            return <li key={idx}>{message}</li>
          })}
        </Typography>
      )
    } else {
      return null
    }
  }

  return (
    <>
      <Password />
      <Button sx={{ mt: 2, mb: 2 }} onClick={resetHandler} color="warning" variant="contained">
        Reset Password
      </Button>
      {fetchResult()}
    </>
  )
}
