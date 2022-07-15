import React from 'react'
import { useSelector } from 'react-redux'

export default function License() {
  const pax8 = useSelector((state) => state.ticketForm.pax8)
  return <div>Pax8 id: {pax8}</div>
}
