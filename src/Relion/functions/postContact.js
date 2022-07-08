import axios from 'axios'
import getToken from './getToken'

const PostTicket = async (contactJSON) => {
  const fn = contactJSON.firstName
  const ln = contactJSON.lastName
  const em = contactJSON.emails[0].emailAddress

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
  console.log('New ContactId:')
  console.log(response.data.result.id)

  // return contactValue to control form
  const cv = { label: `${fn} ${ln}`, id: response.data.result.id, email: em }
  return cv
}

export default PostTicket
