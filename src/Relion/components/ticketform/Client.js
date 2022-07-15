import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentTenant } from 'src/store/features/app'
import { useSearchParams } from 'react-router-dom'
import {
  setClientValue,
  setClientId,
  setDefaultDomainName,
  setDomain,
  setLabel,
  setLocationId,
  setPax8,
} from '../../store/features/ticketFormSlice'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import getLocationID from '../../functions/getLocationID'
import { clientList } from '../../data/clientList'

export default function Client() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const client = searchParams.get('client')
  const clientValue = useSelector((state) => state.ticketForm.clientValue)
  const editMode = useSelector((state) => state.ticketForm.editMode)

  // match client with parameter if supplied
  // skip if client is already selected
  useEffect(() => {
    if (client && !clientValue) {
      const fn = client.substring(0, client.indexOf(' '))
      console.log('First Name:')
      console.log(fn)
      const ln = client
        .substring(0, client.indexOf(':'))
        .substring(client.indexOf(' ') + 1, client.length)
      console.log('Last Name')
      console.log(ln)

      const match = clientList.filter((item) => item.label === fn)
      console.log('Client Match:')
      console.log(match[0])
      if (match[0]) {
        dispatch(setClientId(match[0].id))
        dispatch(setDefaultDomainName(match[0].defaultDomainName))
        dispatch(setDomain(match[0].domain))
        dispatch(setLabel(match[0].label))
        dispatch(setPax8(match[0].pax8))
        dispatch(setClientValue(match[0])) // control form

        // get location ID from BMS
        getLocationID(match[0].id).then((result) => {
          dispatch(setLocationId(result))
          console.log('locationID:')
          console.log(result)
        })

        // set tenant switcher
        dispatch(
          setCurrentTenant({
            tenant: {
              customerId: match[0].id,
              defaultDomainName: match[0].defaultDomainName,
              displayName: match[0].label,
            },
          }),
        )
      }
    }
  }, [client, clientValue, dispatch, searchParams])

  const clientHandler = (event, input) => {
    console.log('Selected Client:')
    console.log(input)
    dispatch(setClientId(input.id))
    dispatch(setDomain(input.domain))
    dispatch(setDefaultDomainName(input.defaultDomainName))
    dispatch(setLabel(input.label))
    dispatch(setPax8(input.pax8))
    dispatch(setClientValue(input)) // control form

    // get location ID from BMS
    getLocationID(input.id).then((result) => {
      dispatch(setLocationId(result))
      console.log('locationID:')
      console.log(result)
    })

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
