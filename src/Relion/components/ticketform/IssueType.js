import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { issueTypeList } from '../../data/issueTypeList'
import { setIssueType, setIssueTypeId } from '../../store/features/ticketFormSlice'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export default function IssueType() {
  const dispatch = useDispatch()
  const issueType = useSelector((state) => state.ticketForm.issueType)

  const issueTypeHandler = (event, newValue) => {
    dispatch(setIssueType(newValue.label))
    dispatch(setIssueTypeId(newValue.id))
  }

  return (
    <Autocomplete
      openOnFocus
      autoHighlight
      autoSelect
      id="issue-type"
      value={issueType}
      options={issueTypeList}
      onChange={issueTypeHandler}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      renderInput={(params) => <TextField {...params} label="Issue Type" />}
    />
  )
}
