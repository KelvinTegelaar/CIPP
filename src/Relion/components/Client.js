import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentTenant } from 'src/store/features/app'
import {
  setClient,
  setClientId,
  setContactList,
  setLocationId,
} from '../store/features/ticketSlice'

//mui
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

//functions
import getContactList from '../functions/getContactList'
import getLocationID from '../functions/getLocationID'
import getTenants from '../functions/getTenants'

export default function Client() {
  const dispatch = useDispatch()
  const client = useSelector((state) => state.ticket.client)
  const clientList = [
    { id: 101238, label: 'ACW', tenant: '188495f2-336a-4cc3-868b-a4765f71185c' },
    { id: 101239, label: 'AKP', tenant: '56d4ef54-2d64-4729-aca4-10a530f9e137' },
    { id: 101240, label: 'BASE', tenant: '' },
    { id: 105196, label: 'BASE Sherman Oaks', tenant: '' },
    { id: 101241, label: 'CI', tenant: '' },
    {
      id: 101230,
      label: 'City of Rolling Hills Estates',
      tenant: '88879da4-54a3-4a21-aef5-c17e8980d0a1',
    },
    { id: 101242, label: 'DLITE', tenant: '6a8e5d53-3e2b-418a-9dd8-5ecc8337962a' },
    { id: 101243, label: 'Dolorosa', tenant: '4a74ab7f-6c1d-487e-bedb-f2244caf8adf' },
    { id: 101244, label: 'DWC', tenant: '92c60ce1-2f5d-44ed-9464-6422ebdff615' },
    { id: 101245, label: 'Extant', tenant: '' },
    { id: 101247, label: 'F2', tenant: '9bca80f2-845d-4262-ba3a-66b2578c9098' },
    { id: 101248, label: 'FriendsLA', tenant: '2cc4db87-c199-41e0-9361-74b7d8bdf6b4' },
    { id: 105939, label: 'Garfield', tenant: 'be17f196-dd65-4a88-ba34-96155e758c0e' },
    { id: 101249, label: 'GCC', tenant: 'b77d26b2-b4b8-4527-b3f9-f2d97e3fb468' },
    { id: 101250, label: 'Ho Rehab', tenant: '' },
    { id: 101251, label: 'HOPT', tenant: '3fffdedc-a531-4d72-be1b-894941bc9817' },
    { id: 101252, label: 'ILA', tenant: '5256f2c6-e353-4350-a6af-df61ae110387' },
    { id: 101253, label: 'KGC', tenant: 'be6fd3e8-8ffb-46e2-bf59-63fe1569d7a8' },
    { id: 101254, label: 'Kimble', tenant: 'e71914b9-82ee-47a3-ba9d-8eac5151d7ab' },
    { id: 114089, label: 'LA Stagecall', tenant: 'c5e1f34a-934c-45fb-8a4f-2e88395c8a76' },
    { id: 101255, label: 'LACS', tenant: '13f017e1-e5e0-49cb-b7fa-18233f5dfb12' },
    { id: 101224, label: 'NZXT', tenant: '' },
    { id: 101225, label: 'PCSI', tenant: '98e954bc-6d5e-4cfc-bf1d-aca9d95d6917' },
    { id: 101226, label: 'Phoenix CA', tenant: '4114297e-889f-4a48-afd7-e5c688f70639' },
    { id: 101227, label: 'Phoenix FL', tenant: '4114297e-889f-4a48-afd7-e5c688f70639' },
    { id: 101228, label: 'Powertec', tenant: '04bcc83f-8f40-4656-a18b-4046d1fb30b3' },
    { id: 98695, label: 'Relion', tenant: '' },
    { id: 101229, label: 'RFCU', tenant: '82f49824-c485-4c63-8c1c-c5b8ef09b526' },
    { id: 101231, label: 'Rollouts', tenant: '0ca2d474-cf2a-4bdf-9b08-92b11a983e87' },
    { id: 102538, label: 'Shoes4Grades', tenant: '2a1f6a93-79a4-4a09-93d6-8bc88697986d' },
    { id: 113122, label: 'Shore Logistics', tenant: '312e6833-d248-490a-acef-be497d7f1b11' },
    { id: 112610, label: 'Superior Handforge', tenant: '77fa3d9b-21de-4a40-9bc5-74625f6c9382' },
    { id: 101232, label: 'Trademark', tenant: '' },
    { id: 101233, label: 'TSE', tenant: '' },
    { id: 101234, label: 'Walker', tenant: 'eab27e0a-90e2-414f-ad3a-ff0df0d2a2c9' },
    { id: 101235, label: 'Warden', tenant: '' },
    { id: 101236, label: 'West Coast Trends', tenant: 'c531b5a1-496e-4b73-b205-e2b0cae113b5' },
    { id: 101237, label: 'WI', tenant: 'f56b4ab8-3ab4-4537-ac2d-e2f1e3eabadc' },
  ]

  const clientHandler = async (event, newValue) => {
    const cid = newValue.id
    dispatch(setClientId(cid))

    const lid = await getLocationID(cid) // get location ID from BMS
    dispatch(setLocationId(lid))

    const cl = await getContactList(cid) // get contact list from BMS
    dispatch(setContactList(cl))

    dispatch(setClient(newValue)) // controls form

    const tenantList = await getTenants()
    console.log(tenantList)

    const tenantId = newValue.tenant
    console.log(`tenantId: ${tenantId}`)

    const currentTenant = tenantList.filter((t) => t.customerId === tenantId)
    console.log(currentTenant[0])

    dispatch(
      setCurrentTenant({
        tenant: {
          customerId: currentTenant[0].customerId,
          defaultDomainName: currentTenant[0].defaultDomainName,
          displayName: currentTenant[0].displayName,
          domains: currentTenant[0].domains,
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
      value={client}
      options={clientList}
      onChange={clientHandler}
      renderInput={(params) => <TextField {...params} label="Client" />}
    />
  )
}
