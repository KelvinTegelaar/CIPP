import axios from 'axios'

const getToken = async () => {
  //BMS takes login credentials as a form submission
  const credentials = new FormData()
  credentials.append('grantType', 'password')
  credentials.append('userName', 'apiadmin')
  credentials.append('password', 'UnK97rfJ3yscUuzD3u')
  credentials.append('tenant', 'relion')

  const axiosParam = {
    method: 'post',
    url: 'https://api.bms.kaseya.com/v2/security/authenticate',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: credentials,
  }
  const response = await axios(axiosParam)
  const token = 'Bearer ' + response.data.result.accessToken
  return token
}

export default getToken
