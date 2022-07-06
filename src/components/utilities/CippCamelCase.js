export function stringCamelCase(str) {
  var splitStr = str
    .replaceAll('/', ' ')
    .replaceAll('\\', ' ')
    .replaceAll(',', '')
    .replaceAll('(', '')
    .replaceAll(')', '')
  splitStr = splitStr.toLowerCase().split(' ')
  var init = false
  for (var i = 0; i < splitStr.length; i++) {
    if (!init) {
      splitStr[i] = splitStr[i].charAt(0).toLowerCase() + splitStr[i].substring(1)
      init = true
    } else {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
    }
  }
  return splitStr.join('')
}
