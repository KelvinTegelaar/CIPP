import axios from 'axios'

export const axiosQuery = async ({ path, method = 'get', params, data }) => {
  try {
    const result = await axios({
      method,
      baseURL: window.location.origin,
      url: path,
      data,
      params,
    })
    return { data: result.data }
  } catch (axiosError) {
    let err = axiosError
    return {
      error: { status: err.response.status, data: err.response.data },
    }
  }
}

export const baseQuery = ({ baseUrl } = { baseUrl: '' }) => axiosQuery
