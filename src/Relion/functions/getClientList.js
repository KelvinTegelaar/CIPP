import axios from 'axios'
import getToken from './getToken'

const getClientList = async () => {
  const axiosParam = {
    method: 'get',
    url: 'https://api.bms.kaseya.com/v2/crm/accounts/lookup',
    headers: {
      Authorization: await getToken(),
      'Content-Type': 'application/json',
    },
  }
  const response = await axios(axiosParam)
  const array = response.data.result
  const newArray = array.map((item) => {
    return { label: item.name, id: item.id }
  })
  return newArray
}

export default getClientList
