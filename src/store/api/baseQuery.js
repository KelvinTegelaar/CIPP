import axios from 'axios'
let newController = new AbortController()
export const axiosQuery = async ({ path, method = 'get', params, data, hideToast }) => {
  try {
    const result = await axios({
      signal: path === '/api/ListTenants' ? undefined : newController.signal,
      method,
      baseURL: window.location.origin,
      url: path,
      data,
      params,
    })
    return { data: result?.data }
  } catch (error) {
    return {
      error: {
        status: error.response?.status,
        data: error.response?.data,
        hideToast,
        message: error?.message,
      },
    }
  }
}
export function abortRequestSafe() {
  console.log(newController)
  newController.abort()
  newController = new AbortController()
}

export const baseQuery = ({ baseUrl } = { baseUrl: '' }) => axiosQuery
