import axios from 'axios'

const getTokenPax8 = async () => {
  var data = JSON.stringify({
    client_id: 'tnsSDN7h0XZ53XC2vO95UwfyvAQFYOAl',
    client_secret: 'rSvfDXRONvA4uncXAH6oNdkPqbF0UQ5oltWSTVTHQEH0Gcn33ezwQX7CjKcg6ACc',
    audience: 'api://p8p.client',
    grant_type: 'client_credentials',
  })

  const axiosParam = {
    method: 'post',
    url: 'https://login.pax8.com/oauth/token',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: data,
  }
  const response = await axios(axiosParam)
  const token = 'Bearer ' + response.data.access_token
  return token
}

export default getTokenPax8
