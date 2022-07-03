import axios from 'axios'
import getToken from './getToken'

const getTicketActivities = async (ticketId) => {
  const axiosParam = {
    method: 'get',
    url: `https://api.bms.kaseya.com/v2/servicedesk/tickets/${ticketId}/activities`,
    headers: {
      Authorization: await getToken(),
      'Content-Type': 'application/json',
    },
  }
  console.log('Ticket Id: ')
  console.log(ticketId)
  const response = await axios(axiosParam)
  const array = response.data.result.reverse()
  return array
}

export default getTicketActivities
