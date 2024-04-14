import axios from 'axios'

const retryDelays = [1000, 2000, 3000] // Delays in milliseconds for retries

export const axiosQuery = async ({ path, method = 'get', params, data, hideToast }) => {
  let attempt = 0

  while (attempt <= retryDelays.length) {
    try {
      const result = await axios({
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
    path.toLower().startsWith('/list') &&
    (!error.response || error.response.status >= 500) &&
    error.response?.data === 'Backend call failure'
  )
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
