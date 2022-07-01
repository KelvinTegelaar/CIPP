//import React, { useEffect, useState } from 'react'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import getTicketActivities from '../functions/getTicketActivities'

export default function TicketActivities() {
  //const [ticketActivities, setTicketActivities] = useState()
  const techId = useSelector((state) => state.ticket.techId)
  useEffect(() => {
    const fetchData = async () => {
      const response = await getTicketActivities(techId)
      console.log('Ticket Activities:')
      console.log(response)
      //setTicketActivities(response)
    }
    fetchData()
  }, [techId])

  return (
    <>
      {/*ticketActivities.map((message, idx) => {
        return <li key={idx}>{message}</li>
      })*/}
      Hello
    </>
  )
}
