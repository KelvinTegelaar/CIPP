import axios from 'axios'

const getUsers = async (defaultDomainName) => {
  const axiosParam = {
    method: 'get',
    url: `/api/ListUsers?TenantFilter=${defaultDomainName}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const response = await axios(axiosParam)
  return response.data
}

export default getUsers
