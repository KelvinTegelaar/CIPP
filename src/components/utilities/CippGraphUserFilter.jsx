function CippGraphUserFilter(query) {
  const properties = [
    'displayName',
    'givenName',
    'surname',
    'userPrincipalName',
    'mail',
    'mailNickname',
  ]
  const endsWithProperties = ['mail', 'otherMails', 'userPrincipalName', 'proxyAddresses']
  const multiValueProperties = ['proxyAddresses']

  var filterConditions = []
  properties.map((property) => {
    filterConditions.push(`startsWith(${property},'${query}')`)
    if (endsWithProperties.includes(property)) {
      filterConditions.push(`endsWith(${property},'${query}')`)
    }
  })
  multiValueProperties.map((property) => {
    filterConditions.push(`${property}/any(a:startsWith(a,'${query}'))`)
    if (endsWithProperties.includes(property)) {
      filterConditions.push(`${property}/any(a:endsWith(a,'${query}'))`)
    }
  })

  return filterConditions.join(' or ')
}

export default CippGraphUserFilter
