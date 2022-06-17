import axios from 'axios'
import getToken from './getToken'

const postTicket = async (ticketJSON) => {
  const axiosParam = {
    method: 'post',
    url: 'https://api.bms.kaseya.com/v2/servicedesk/tickets',
    headers: {
      Authorization: await getToken(),
      'Content-Type': 'application/json',
    },
    data: ticketJSON,
  }

  const response = await axios(axiosParam)
  const ticketId = response.data.result.id
  console.log(ticketId)

  return ticketId
}

export default postTicket

//comment
