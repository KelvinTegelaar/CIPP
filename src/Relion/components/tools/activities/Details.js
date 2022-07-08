import React from 'react'
import { useSelector } from 'react-redux'

export default function Details() {
  const details = useSelector((state) => state.ticketForm.details)

  return <div dangerouslySetInnerHTML={{ __html: details }} />
}
