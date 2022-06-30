import axios from 'axios'

const execDisableUser = async (defaultDomainName, contactAZId) => {
  const axiosParam = {
    method: 'get',
    url: `/api/ExecDisableUser?TenantFilter=${defaultDomainName}&ID=${contactAZId}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const response = await axios(axiosParam)
  console.log(response)

  return response.data
}

export default execDisableUser
