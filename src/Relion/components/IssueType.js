import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setIssueType, setIssueTypeId } from '../store/features/ticketSlice'

//mui
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export default function IssueType() {
  const dispatch = useDispatch()
  const issueType = useSelector((state) => state.ticket.issueType)

  const issueTypeHandler = (event, newValue) => {
    dispatch(setIssueType(newValue.label))
    dispatch(setIssueTypeId(newValue.id))
  }
  const issueTypeList = [
    { id: 10490, label: 'Help Desk' },
    { id: 10487, label: 'User Administration' },
    { id: 10491, label: 'System Change' },
    { id: 10486, label: 'Reboot / False Alarm' },
    { id: 10542, label: '3CX' },
    { id: 10480, label: 'Application' },
    { id: 12411, label: 'Data Recovery' },
    { id: 12410, label: 'Email' },
    { id: 12282, label: 'Internet' },
    { id: 12304, label: 'iPhone/Andriod' },
    { id: 12307, label: 'M365' },
    { id: 10489, label: 'Maintenance' },
    { id: 10483, label: 'Network' },
    { id: 10481, label: 'Printing' },
    { id: 10484, label: 'Remote Access' },
    { id: 11401, label: 'Security' },
    { id: 10479, label: 'Server' },
    { id: 10482, label: 'Workstation' },
  ]
  return (
    <Autocomplete
      openOnFocus
      autoHighlight
      autoSelect
      id="issue-type"
      value={issueType}
      options={issueTypeList}
      onChange={issueTypeHandler}
      renderInput={(params) => <TextField {...params} label="Issue Type" />}
    />
  )
}
