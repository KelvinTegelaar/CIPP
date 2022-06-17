import axios from 'axios'
import getToken from './getToken'

const getLocationID = async (clientID) => {
  const axiosParam = {
    method: 'get',
    url: `https://api.bms.kaseya.com/v2/crm/accounts/${clientID}/locations/lookup`,
    headers: {
      Authorization: await getToken(),
      'Content-Type': 'application/json',
    },
  }
  const response = await axios(axiosParam)
  const locationID = response.data.result.filter((locations) => {
    return (locations.isMain = true)
  })[0].id

  return locationID
}

export default getLocationID
