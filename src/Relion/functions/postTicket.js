import axios from 'axios'
import getToken from './getToken'

const postTicket = async (ticketJSON, ticketId = '') => {
  const method = ticketId ? 'put' : 'post'

  const axiosParam = {
    method: method,
    url: `https://api.bms.kaseya.com/v2/servicedesk/tickets/${ticketId}`,
    headers: {
      Authorization: await getToken(),
      'Content-Type': 'application/json',
    },
    data: ticketJSON,
  }

  const response = await axios(axiosParam)
  console.log(response)
  const tid = response.data.result.id

  return tid
}

export default postTicket
