import axios from 'axios'
import getToken from './getToken'

const postTime = async (timeJSON, ticketId) => {
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
  const timeEntryId = response.data.result.id
  return timeEntryId
}

export default postTime
