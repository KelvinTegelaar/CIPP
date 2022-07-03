import axios from 'axios'
import getToken from './getToken'

const getTicketList = async () => {
  const filter = {
    filter: {
      queueNames: 'Help Desk',
      excludeCompleted: 1,
    },
  }

  const axiosParam = {
    method: 'post',
    url: 'https://api.bms.kaseya.com/v2/servicedesk/tickets/search',
    headers: {
      Authorization: await getToken(),
      'Content-Type': 'application/json',
    },
    data: filter,
  }
  const response = await axios(axiosParam)
  const array = response.data.result
  return array
}

export default getTicketList
