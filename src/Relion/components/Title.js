import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setTitle } from '../store/features/ticketSlice'

//mui
import TextField from '@mui/material/TextField'

export default function Title() {
  const dispatch = useDispatch()
  const title = useSelector((state) => state.ticket.title)

  const titleHandler = (event) => {
    dispatch(setTitle(event.target.value))
  }

  return <TextField id="title" label="Title" value={title} onChange={titleHandler} />
}
