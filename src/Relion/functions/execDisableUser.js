import axios from 'axios'
import getToken from './getToken'

const execDisableUser = async (defaultDomainName, contactAZId) => {
  const axiosParam = {
    method: 'get',
    url: `/api/ExecDisableUser?TenantFilter=${defaultDomainName}&ID=${contactAZId}`,
    headers: {
      Authorization: await getToken(),
      'Content-Type': 'application/json',
    },
  }
  const response = await axios(axiosParam)
  console.log(response)

  return response.data
}

export default execDisableUser
