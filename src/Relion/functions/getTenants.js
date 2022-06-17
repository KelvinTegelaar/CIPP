import axios from 'axios'

const getTenants = async () => {
  const axiosParam = {
    method: 'get',
    url: '/api/ListTenants',
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const response = await axios(axiosParam)

  return response.data
}

export default getTenants
