import React, { useEffect } from 'react'
import axios from 'axios'

export default function Test() {
  useEffect(() => {
    const filter = {
      filter: {
        queueNames: 'Help Desk',
        excludeCompleted: 1,
      },
    }
    const axiosParam = {
      method: 'get',
      url: '/api/GetBMSTicketlist',
      headers: {
        'Content-Type': 'application/json',
      },
      body: filter,
    }
    const fetch = async () => {
      const response = await axios(axiosParam)
      console.log('BMSTest:')
      console.log(response)
    }
    fetch()
  }, [])

  return <>See Console Log</>
}
