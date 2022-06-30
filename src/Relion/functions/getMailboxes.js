import axios from 'axios'

const getMailboxes = async (defaultDomainName) => {
  const axiosParam = {
    method: 'get',
    url: `/api/ListMailboxes?TenantFilter=${defaultDomainName}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const response = await axios(axiosParam)
  return response.data
}

export default getMailboxes
