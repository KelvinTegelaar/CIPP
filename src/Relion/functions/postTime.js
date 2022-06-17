import axios from 'axios'
import getToken from './getToken'

const postTime = async (ticketId, timeJSON) => {
  const axiosParam = {
    method: 'post',
    url: `https://api.bms.kaseya.com/v2/servicedesk/tickets/${ticketId}/timelogs`,
    headers: {
      Authorization: await getToken(),
      'Content-Type': 'application/json',
    },
    data: timeJSON,
  }

  const response = await axios(axiosParam)
  console.log(response)

  return
}

export default postTime
