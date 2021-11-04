import axios from 'axios'

const methods = ['get', 'post', 'put', 'patch', 'del']

export default class ApiClient {
  constructor() {
    methods.forEach((method) => {
      this[method] = (path, { params, data } = {}) =>
        axios({
          method,
          baseURL: window.location.origin,
          url: path,
          data,
          params,
        })
          .then((result) => result)
          .catch((err) => err)
    })
  }
}
