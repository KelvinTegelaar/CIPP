import React, { useEffect, useCallback } from 'react'
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
  const clientId = useSelector((state) => state.ticketForm.clientId)
  const defaultDomainName = useSelector((state) => state.ticketForm.defaultDomainName)
  const label = useSelector((state) => state.ticketForm.label)

  const getLocation = useCallback(async () => {
    // get location ID from BMS
    const lid = await getLocationID(clientId)
    dispatch(setLocationId(lid))

    // set tenant switcher
    dispatch(
      setCurrentTenant({
        tenant: {
          customerId: clientId,
          defaultDomainName: defaultDomainName,
          displayName: label,
        },
      }),
    )
  }, [clientId, defaultDomainName, label, dispatch])

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
        dispatch(setDomain(match[0].domain))
        dispatch(setDefaultDomainName(match[0].defaultDomainName))
        dispatch(setLabel(match[0].label))
        dispatch(setPax8(match[0].pax8))
        dispatch(setClientValue(match[0])) // control form
        getLocation()
      }
    }
  }, [client, clientValue, dispatch, searchParams, getLocation])

  const clientHandler = async (event, input) => {
    console.log('Selected Client:')
    console.log(input)
    dispatch(setClientId(input.id))
    dispatch(setDomain(input.domain))
    dispatch(setDefaultDomainName(input.defaultDomainName))
    dispatch(setLabel(input.label))
    dispatch(setPax8(input.pax8))
    dispatch(setClientValue(input)) // control form
    getLocation()
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
