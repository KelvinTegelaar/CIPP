import axios from 'axios'
import getToken from './getToken'

const getTicketActivities = async ({ ticketId }) => {
  const axiosParam = {
    method: 'post',
    url: `https://api.bms.kaseya.com/v2/servicedesk/tickets/${ticketId}/activities`,
    headers: {
      Authorization: await getToken(),
      'Content-Type': 'application/json',
    },
  }
  const response = await axios(axiosParam)
  const array = response.data.result
  return array
}

export default getTicketActivities
