export const required = (value) => (value ? undefined : 'Required')

export const validJson = (value) => {
  try {
    JSON.parse(value)
    return undefined
  } catch (e) {
    return 'Invalid JSON'
  }
}

export const password = (value) => {
  let strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,})')

  try {
    if (strongPassword.test(value)) {
      return undefined
    } else {
      throw new Error()
    }
  } catch (e) {
    return 'Invalid password. Must be a minimum of 8 characters and contain special characters'
  }
}
