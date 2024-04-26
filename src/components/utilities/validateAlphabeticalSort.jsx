export default function validateAlphabeticalSort(data, sortKeys) {
  if (!sortKeys || sortKeys.length === 0) return data
  try {
    if (!data) return data
    const newList = data.filter((element) => {
      return sortKeys.every((key) => {
        return (element) => element[key] != null && element[key] != undefined
      })
    })
    return newList.sort((a, b) => {
      try {
        return sortKeys.reduce((acc, key) => {
          if (acc !== 0) return acc
          return (a[key] ?? '').toString().localeCompare(b[key] ?? '')
        }, 0)
      } catch (error) {
        return 0
      }
    })
  } catch (error) {
    return data
  }
}
