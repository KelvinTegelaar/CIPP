import axios from 'axios'

export const axiosQuery = async ({ path, method = 'get', params, data, hideToast }) => {
  try {
    const result = await axios({
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

export const baseQuery = ({ baseUrl } = { baseUrl: '' }) => axiosQuery
