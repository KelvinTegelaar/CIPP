import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import getM365 from '../../../functions/getM365'

export default function License() {
  const pax8 = useSelector((state) => state.ticketForm.pax8)

  useEffect(() => {
    const fetch = async () => {
      const result = await getM365(pax8)
      console.log(result)
    }
    fetch()
  }, [pax8])
  getM365()
  return <div>Pax8 id: {pax8}</div>
}
