import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentTenant } from 'src/store/features/app'
// import { useSearchParams } from 'react-router-dom'
import { setClientValue, setClientId, setLocationId } from '../../store/features/ticketFormSlice'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import getLocationID from '../../functions/getLocationID'
import { clientList } from '../../data/clientList'

export default function Client() {
  const dispatch = useDispatch()

  // const setLocation = async (clientId) => {
  //   const lid = await getLocationID(clientId) // get location ID from BMS
  //   dispatch(setLocationId(lid))
  //   console.log('LocationID: ')
  //   console.log(lid)
  // }

  // const [searchParams] = useSearchParams()
  // const clientQ = searchParams.get('client')
  // if (clientQ) {
  //   const clientMatch = clientList.filter((item) => item.label === clientQ)
  //   console.log('Client Match:')
  //   console.log(clientMatch[0])
  //   dispatch(setClient(clientMatch[0].label))
  //   setLocation(clientMatch[0].id)
  // }

  // control form
  const clientValue = useSelector((state) => state.ticketForm.clientValue)
  const editMode = useSelector((state) => state.ticketForm.editMode)

  const clientHandler = async (event, input) => {
    dispatch(setClientId(input.id))
    console.log('Selected Client:')
    console.log(input)

    const lid = await getLocationID(input.id) // get location ID from BMS
    dispatch(setLocationId(lid))

    // set tenant switcher
    dispatch(
      setCurrentTenant({
        tenant: {
          customerId: input.id,
          defaultDomainName: input.defaultDomainName,
          displayName: input.label,
        },
      }),
    )

    dispatch(setClientValue(input)) // control form
  }

  return (
    <Autocomplete
      autoFocus
      openOnFocus
      autoHighlight
      autoSelect
      id="client"
      disabled={editMode}
      value={clientValue}
      options={clientList}
      onChange={clientHandler}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      renderInput={(params) => <TextField {...params} label="Client" />}
    />
  )
}
