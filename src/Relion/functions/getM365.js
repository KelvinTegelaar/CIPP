import axios from 'axios'
import getTokenPax8 from './getTokenPax8'

const getM365 = async (companyId) => {
  const axiosParam = {
    method: 'get',
    url: `https://api.pax8.com/v1/subscriptions?page=0&size=10&sort=startDate&status=Active&companyId=${companyId}`,
    headers: {
      Authorization: await getTokenPax8(),
      'Content-Type': 'application/json',
    },
  }
  const response = await axios(axiosParam)
  const array = response.data.content

  return array
}

export default getM365
