import axios from 'axios'
import getToken from './getToken'

const postTicket = async (ticketJSON, ticketId = '') => {
  // Update (put) if ticketId is supplied
  // Else (post) new ticket
  const method = ticketId ? 'put' : 'post'

  const axiosParam = {
    method: method,
    // if no ticketId is supplied, it will post to /servicedesk/tickets/
    url: `https://api.bms.kaseya.com/v2/servicedesk/tickets/${ticketId}`,
    headers: {
      Authorization: await getToken(),
      'Content-Type': 'application/json',
    },
    data: ticketJSON,
  }

  const response = await axios(axiosParam)

  // return ticketId
  return response.data.result.id
}

export default postTicket
