import React, { useEffect, useState } from 'react'
import JsonView from '@uiw/react-json-view'
import { useSelector } from 'react-redux'
import { useMediaPredicate } from 'react-media-hook'
import translator from 'src/data/translator.json'
import {
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CFormSwitch,
  CListGroup,
  CListGroupItem,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const githubLightTheme = {
  '--w-rjv-font-family': 'monospace',
  '--w-rjv-color': '#6f42c1',
  '--w-rjv-key-string': '#6f42c1',
  '--w-rjv-background-color': '#ffffff',
  '--w-rjv-line-color': '#ddd',
  '--w-rjv-arrow-color': '#6e7781',
  '--w-rjv-edit-color': 'var(--w-rjv-color)',
  '--w-rjv-info-color': '#0000004d',
  '--w-rjv-update-color': '#ebcb8b',
  '--w-rjv-copied-color': '#002b36',
  '--w-rjv-copied-success-color': '#28a745',

  '--w-rjv-curlybraces-color': '#6a737d',
  '--w-rjv-colon-color': '#24292e',
  '--w-rjv-brackets-color': '#6a737d',
  '--w-rjv-quotes-color': 'var(--w-rjv-key-string)',
  '--w-rjv-quotes-string-color': 'var(--w-rjv-type-string-color)',

  '--w-rjv-type-string-color': '#032f62',
  '--w-rjv-type-int-color': '#005cc5',
  '--w-rjv-type-float-color': '#005cc5',
  '--w-rjv-type-bigint-color': '#005cc5',
  '--w-rjv-type-boolean-color': '#d73a49',
  '--w-rjv-type-date-color': '#005cc5',
  '--w-rjv-type-url-color': '#0969da',
  '--w-rjv-type-null-color': '#d73a49',
  '--w-rjv-type-nan-color': '#859900',
  '--w-rjv-type-undefined-color': '#005cc5',
}

export const githubDarkTheme = {
  '--w-rjv-font-family': 'monospace',
  '--w-rjv-color': '#79c0ff',
  '--w-rjv-key-string': '#79c0ff',
  '--w-rjv-background-color': '#0d1117',
  '--w-rjv-line-color': '#94949480',
  '--w-rjv-arrow-color': '#ccc',
  '--w-rjv-edit-color': 'var(--w-rjv-color)',
  '--w-rjv-info-color': '#7b7b7b',
  '--w-rjv-update-color': '#ebcb8b',
  '--w-rjv-copied-color': '#79c0ff',
  '--w-rjv-copied-success-color': '#28a745',

  '--w-rjv-curlybraces-color': '#8b949e',
  '--w-rjv-colon-color': '#c9d1d9',
  '--w-rjv-brackets-color': '#8b949e',
  '--w-rjv-quotes-color': 'var(--w-rjv-key-string)',
  '--w-rjv-quotes-string-color': 'var(--w-rjv-type-string-color)',

  '--w-rjv-type-string-color': '#a5d6ff',
  '--w-rjv-type-int-color': '#79c0ff',
  '--w-rjv-type-float-color': '#79c0ff',
  '--w-rjv-type-bigint-color': '#79c0ff',
  '--w-rjv-type-boolean-color': '#ffab70',
  '--w-rjv-type-date-color': '#79c0ff',
  '--w-rjv-type-url-color': '#4facff',
  '--w-rjv-type-null-color': '#ff7b72',
  '--w-rjv-type-nan-color': '#859900',
  '--w-rjv-type-undefined-color': '#79c0ff',
}
const matchPattern = (key, patterns) => {
  return patterns.some((pattern) => {
    if (pattern.includes('*')) {
      // Replace * with regex that matches any character sequence and create a RegExp object
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`, 'i')
      return regex.test(key)
    }
    return pattern.toLowerCase() === key.toLowerCase()
  })
}

const removeNullOrEmpty = (obj) => {
  if (Array.isArray(obj)) {
    // Filter out null or undefined items and apply recursively
    const filteredArray = obj.filter((item) => item != null).map(removeNullOrEmpty)
    // Additionally, remove empty arrays
    return filteredArray.length > 0 ? filteredArray : null
  } else if (typeof obj === 'object' && obj !== null) {
    const result = Object.entries(obj).reduce((acc, [key, value]) => {
      const processedValue = removeNullOrEmpty(value)
      if (processedValue != null) {
        // Checks for both null and undefined
        acc[key] = processedValue
      }
      return acc
    }, {})
    // Additionally, remove empty objects
    return Object.keys(result).length > 0 ? result : null
  }
  return obj
}

const translateAndRemoveKeys = (obj, removePatterns = []) => {
  obj = removeNullOrEmpty(obj) // Clean the object first
  if (Array.isArray(obj)) {
    return obj.map((item) => translateAndRemoveKeys(item, removePatterns))
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      // Check if the key matches any removal pattern
      if (!matchPattern(key, removePatterns)) {
        const translatedKey =
          translator[key.toLowerCase()] ||
          key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
        acc[translatedKey] = translateAndRemoveKeys(value, removePatterns) // Recursively process
      }
      return acc
    }, {})
  }
  return obj
}
function CippJsonView({
  object = { 'No Data Selected': 'No Data Selected' },
  removeKeys = ['*@odata*', 'created*', '*modified*', 'id', 'guid'],
}) {
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'
  const theme =
    currentTheme === 'impact' || (currentTheme === preferredTheme) === 'impact'
      ? githubDarkTheme
      : githubLightTheme
  const [translatedObject, setTranslatedObject] = useState(() =>
    translateAndRemoveKeys(object, removeKeys),
  )
  const [switchRef, setSwitchRef] = useState(false)
  // Adjusting the expanded state to track selections for up to 4 levels
  const [expansionPath, setExpansionPath] = useState([{ object: translatedObject }])

  useEffect(() => {
    const sortObject = (obj) => {
      const order = ['displayName', 'name', 'state'] // Define the desired order
      const sortedKeys = Object.keys(obj).sort((a, b) => {
        const indexA = order.indexOf(a)
        const indexB = order.indexOf(b)
        if (indexA === -1 && indexB === -1) {
          return 0 // If both keys are not in the order array, maintain the original order
        } else if (indexA === -1) {
          return 1 // If only key A is not in the order array, move key B to a higher position
        } else if (indexB === -1) {
          return -1 // If only key B is not in the order array, move key A to a higher position
        } else {
          return indexA - indexB // Sort based on the index in the order array
        }
      })
      const sortedObject = {}
      sortedKeys.forEach((key) => {
        sortedObject[key] = obj[key]
      })
      return sortedObject
    }

    const newTranslatedObject = sortObject(translateAndRemoveKeys(sortObject(object), removeKeys))
    setTranslatedObject(newTranslatedObject)
    setExpansionPath([{ object: newTranslatedObject }]) // Reset the expansion path with the new object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(object), JSON.stringify(removeKeys)])

  // Updated to handle deeper level expansions
  const handleExpand = (level, content) => {
    const newPath = expansionPath.slice(0, level)
    newPath.push({ object: content })
    setExpansionPath(newPath)
  }
  const renderContent = (content, level = 0) => {
    if (Array.isArray(content)) {
      return (
        <ul>
          {content.map((item, index) => (
            <li key={index}>{JSON.stringify(item, null, 2)}</li>
          ))}
        </ul>
      )
    } else if (typeof content === 'object') {
      return Object.entries(content).map(([key, value]) => (
        <div key={key}>
          {key}:
          {typeof value === 'object' ? (
            <CButton onClick={() => handleExpand(level + 1, value)} variant="ghost">
              <FontAwesomeIcon className="me-1" icon={'expand'} />
              Show More
            </CButton>
          ) : (
            ` ${value}`
          )}
        </div>
      ))
    } else if (typeof content === 'string') {
      return content.replace(/(^"|"$)/g, '') // Remove quotes
    }
    return String(content)
  }

  return (
    <div className="mb-3">
      <CAccordion alwaysOpen>
        <CAccordionItem itemKey="general-1">
          <CAccordionHeader>
            {object.displayName ? `${object.displayName} Settings` : 'Settings'}
          </CAccordionHeader>
          <CAccordionBody>
            <CFormSwitch label="View as code" onClick={() => setSwitchRef(!switchRef)} />
            {switchRef ? (
              <JsonView
                value={object}
                collapsed={1}
                displayDataTypes={false}
                displayObjectSize={false}
                style={{ ...theme }}
              />
            ) : (
              <CRow>
                {expansionPath.map((expansion, index) => (
                  <CCol key={index} xs={3}>
                    {Object.entries(expansion.object).map(([key, value]) => (
                      <CCard key={key} className="content-card mb-3">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                          <CCardTitle>{key}</CCardTitle>
                          <FontAwesomeIcon icon="cog" />
                        </CCardHeader>
                        <CCardBody>{renderContent(value, index)}</CCardBody>
                      </CCard>
                    ))}
                  </CCol>
                ))}
              </CRow>
            )}
          </CAccordionBody>
        </CAccordionItem>
      </CAccordion>
    </div>
  )
}

export default CippJsonView
