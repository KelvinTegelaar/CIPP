export function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  )
}

/**
 * Convert search params object into a string:
 * ```js
 *  queryString({key: 'value', key2: 'value2'})
 *  // ==> ?key=value&key2=value2
 * ```
 * @param {object} searchParams
 * @returns {string}
 */
export function queryString(searchParams) {
  const params = new URLSearchParams()
  Object.keys(searchParams).forEach((key) => params.append(key, searchParams[key]))
  return '?' + params.toString()
}
