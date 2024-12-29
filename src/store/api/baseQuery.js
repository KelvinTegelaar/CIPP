import axios from 'axios'

let newController = new AbortController() // Controller for managing abortion of requests

const retryDelays = [100, 200, 300] // Delays in milliseconds for retries

export const axiosQuery = async ({ path, method = 'get', params, data, hideToast }) => {
  let attempt = 0

  while (attempt <= retryDelays.length) {
    try {
      const result = await axios({
        signal: newController.signal,
        method,
        baseURL: window.location.origin,
        url: path,
        data,
        params,
      })
      return { data: result.data } // Successful response
    } catch (error) {
      if (attempt === retryDelays.length || !shouldRetry(error, path)) {
        return {
          // Max retries reached or error should not trigger a retry
          error: {
            status: error.response?.status,
            data: error.response?.data,
            hideToast,
            message: error.message,
          },
        }
      }
      await delay(retryDelays[attempt]) // Wait before retrying
      attempt++
    }
  }
}

const shouldRetry = (error, path) => {
  // Check if the path starts with 'List', error qualifies for a retry, and payload message is 'Backend call failure'
  return (
    path.toLowerCase().startsWith('/api/list') &&
    error.response &&
    error.response.status >= 500 &&
    error.response.data === 'Backend call failure'
  )
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function abortRequestSafe() {
  newController.abort() // Abort any ongoing request
  newController = new AbortController() // Reset the controller for new requests
}

export const baseQuery = ({ baseUrl } = { baseUrl: '' }) => axiosQuery
