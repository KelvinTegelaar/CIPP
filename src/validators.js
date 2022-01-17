export const required = (value) => (value ? undefined : 'Required')

export const validJson = (value) => {
  try {
    JSON.parse(value)
    return undefined
  } catch (e) {
    return 'Invalid JSON'
  }
}
