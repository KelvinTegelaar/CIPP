import axios from 'axios'

// functions
import getToken from './getToken'

const PostTicket = async (contactJSON) => {
  const firstName = contactJSON.firstName
  const lastName = contactJSON.lastName

  const axiosParam = {
    method: 'post',
    url: 'https://api.bms.kaseya.com/v2/crm/contacts/summary',
    headers: {
      Authorization: await getToken(),
      'Content-Type': 'application/json',
    },
    data: contactJSON,
  }

  const response = await axios(axiosParam)
  console.log(response)

  const selectedContact = { label: `${firstName} ${lastName}`, id: response.data.result.id }
  return selectedContact
}

export default PostTicket
