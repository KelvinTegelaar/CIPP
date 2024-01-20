import axios from 'axios'

const methods = ['get', 'post', 'put', 'patch', 'del']

export default class ApiClient {
  constructor() {
    methods.forEach((method) => {
      this[method] = (path, { params, data } = {}) => {
        return new Promise((resolve, reject) => {
          axios({
            method,
            baseURL: window.location.origin,
            url: path,
            data,
            params,
          })
            .then((result) => resolve(result))
            .catch((error) => reject(error))
        })
      }
    })
  }
}
