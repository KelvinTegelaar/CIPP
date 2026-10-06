const SURNAME_PARTICLES = [
  'van', 'van de', 'van der', 'van den', 'de', 'den', 'der', 'ter', 'ten', 'op de', 'op den',
  'in de', 'in het', "in 't", 'aan de', 'aan den', 'onder de', 'uit de', 'uit den', 'bij de',
  "van 't", 'van het', "'t", 'von', 'von der', 'zu', 'zur', 'zum', 'du', 'de la', 'de le', 'le',
  'la', 'les', 'del', 'della', 'delle', 'dei', 'degli', 'di', 'da', 'dos', 'das', 'do', "d'",
  "l'", 'al', 'el', 'bin', 'ibn', 'af', 'av',
]

// Apostrophes and quotes are ignored so "van 't" and "van t" compare equal.
const normalize = (text) => text.toLowerCase().replace(/['’‘`"]/g, '')

const PARTICLES = SURNAME_PARTICLES.map((p) => p.split(' ').map(normalize))
const MAX_PARTICLE_WORDS = Math.max(...PARTICLES.map((p) => p.length))

// Longest match first; a surname made only of particles stays whole as the core.
export const splitSurname = (lastName) => {
  const words = String(lastName || '')
    .split(/\s+/)
    .filter(Boolean)
  const normalized = words.map(normalize)
  let i = 0
  while (i < words.length) {
    let matched = 0
    for (let len = Math.min(MAX_PARTICLE_WORDS, words.length - i); len > 0; len--) {
      const candidate = normalized.slice(i, i + len)
      if (PARTICLES.some((p) => p.length === len && p.every((w, k) => w === candidate[k]))) {
        matched = len
        break
      }
    }
    if (!matched) break
    i += matched
  }
  if (i >= words.length) return { prefix: [], core: words }
  return { prefix: words.slice(0, i), core: words.slice(i) }
}

// Initials come from the apostrophe-stripped word, so "'t" contributes "t".
const initials = (words, n) =>
  words.map((word) => word.replace(/['’‘`"]/g, '').substring(0, n)).join('')

export const generateUsername = (
  format,
  firstName,
  lastName,
  spaceHandling = 'keep',
  spaceReplacement = ''
) => {
  if (!format || !firstName || !lastName) return ''

  // Ensure format is a string
  const formatString = typeof format === 'string' ? format : String(format)

  let username = formatString

  // Prefix/core tokens run first so the %LastName...% patterns below cannot touch them
  const { prefix, core } = splitSurname(lastName)
  username = username.replace(/%LastNamePrefix\[(\d+)\]%/gi, (match, num) =>
    initials(prefix, parseInt(num))
  )
  username = username.replace(/%LastNameCore\[(\d+)\]%/gi, (match, num) =>
    initials(core, parseInt(num))
  )
  username = username.replace(/%LastNamePrefix%/gi, prefix.join(' '))
  username = username.replace(/%LastNameCore%/gi, core.join(' '))

  // Replace %FirstName[n]% patterns (extract first n characters per word)
  username = username.replace(/%FirstName\[(\d+)\]%/gi, (match, num) => {
    const n = parseInt(num)
    return firstName
      .split(/\s+/)
      .map((word) => word.substring(0, n))
      .join('')
  })

  // Replace %LastName[n]% patterns (extract first n characters per word)
  username = username.replace(/%LastName\[(\d+)\]%/gi, (match, num) => {
    const n = parseInt(num)
    return lastName
      .split(/\s+/)
      .map((word) => word.substring(0, n))
      .join('')
  })

  // Replace %FirstName% and %LastName%
  username = username.replace(/%FirstName%/gi, firstName)
  username = username.replace(/%LastName%/gi, lastName)

  // Apply optional space handling
  if (spaceHandling === 'remove') {
    username = username.replace(/\s+/g, '')
  } else if (spaceHandling === 'replace') {
    username = username.replace(/\s+/g, spaceReplacement || '')
  }

  // Convert to lowercase
  return username.toLowerCase()
}
