import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setTimeEntry } from '../../store/features/ticketFormSlice'

// mui
import Slider from '@mui/material/Slider'

export default function TimeEntry() {
  const dispatch = useDispatch()
  const timeEntry = useSelector((state) => state.ticketForm.timeEntry)
  const timeEntryHandler = (event) => {
    dispatch(setTimeEntry(event.target.value))
  }

  // slider fomatting values
  const marks = [
    {
      value: 0,
      label: '',
    },
    {
      value: 15,
      label: '15 min',
    },
    {
      value: 60,
      label: '1 hr',
    },
    {
      value: 120,
      label: '2 hrs',
    },
    {
      value: 180,
      label: '3hrs',
    },
  ]

  const valueLabelFormat = (value) => {
    return value % 60
  }
  return (
    <Slider
      aria-label="Time Logged"
      label="Time Logged"
      defaultValue={15}
      step={15}
      min={0}
      max={180}
      valueLabelDisplay="auto"
      valueLabelFormat={valueLabelFormat}
      marks={marks}
      onChange={timeEntryHandler}
      value={timeEntry}
    />
  )
}
