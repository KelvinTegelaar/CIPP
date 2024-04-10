export default function validateAlphabeticalSort(data, sortKey = 'id') {
  try {
    if (!data) return undefined

    const newList = data.filter(
      (element) => element[sortKey] != null && element[sortKey] != undefined,
    )
    return newList.sort((a, b) => {
      try {
        return (a[sortKey] ?? '').toString().localeCompare(b[sortKey] ?? '')
      } catch (error) {
        return 0
      }
    })
  } catch (error) {
    return undefined
  }
}
