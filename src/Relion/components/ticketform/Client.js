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
  const caller = searchParams.get('caller')
  const clientValue = useSelector((state) => state.ticketForm.clientValue)
  const editMode = useSelector((state) => state.ticketForm.editMode)

  const clientHandler = useCallback(
    async (event, input) => {
      console.log('Selected Client:')
      console.log(input)
      dispatch(setClientId(input.id))
      dispatch(setDomain(input.domain))
      dispatch(setDefaultDomainName(input.defaultDomainName))
      dispatch(setLabel(input.label))
      dispatch(setPax8(input.pax8))
      dispatch(setClientValue(input)) // control form

      // get locationId from BMS
      const result = await getLocationID(input.id)
      dispatch(setLocationId(result))
      console.log('locationID:')
      console.log(result)

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
    },
    [dispatch],
  )

  // match client with parameter if supplied
  // skip if client is already selected
  useEffect(() => {
    if (caller) {
      const fn = caller.substring(0, caller.indexOf(' '))
      console.log('Caller First Name:')
      console.log(fn)

      const match = clientList.filter((item) => item.label === fn)
      console.log('Client Match:')
      console.log(match[0])
      if (match[0]) {
        clientHandler(null, match[0])
      }
    }
  }, [caller, clientHandler])

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
