import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useMediaPredicate } from 'react-media-hook'
import JsonView from '@uiw/react-json-view'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CFormSwitch,
  CRow,
} from '@coreui/react'
import translator from 'src/data/translator.json' // Ensure the path to your translator.json is correct

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
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`, 'i')
      return regex.test(key)
    }
    return pattern.toLowerCase() === key.toLowerCase()
  })
}

const removeNullOrEmpty = (obj) => {
  if (Array.isArray(obj)) {
    const filteredArray = obj.filter((item) => item != null).map(removeNullOrEmpty)
    return filteredArray.length > 0 ? filteredArray : null
  } else if (typeof obj === 'object' && obj !== null) {
    const result = Object.entries(obj).reduce((acc, [key, value]) => {
      const processedValue = removeNullOrEmpty(value)
      if (processedValue != null) {
        acc[key] = processedValue
      }
      return acc
    }, {})
    return Object.keys(result).length > 0 ? result : null
  }
  return obj
}

const translateAndRemoveKeys = (obj, removePatterns = []) => {
  obj = removeNullOrEmpty(obj)
  if (Array.isArray(obj)) {
    return obj.map((item) => translateAndRemoveKeys(item, removePatterns))
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (!matchPattern(key, removePatterns)) {
        const translatedKey =
          translator[key.toLowerCase()] ||
          key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
        acc[translatedKey] = translateAndRemoveKeys(value, removePatterns)
      }
      return acc
    }, {})
  }
  return obj
}
function renderObjectAsColumns(object, level = 0, maxLevel = 4) {
  const content = []
  let nextLevelObject = null

  for (const [key, value] of Object.entries(object)) {
    if (level < maxLevel && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      nextLevelObject = value // Prepare the next level's object for rendering
      continue // Skip to avoid rendering this as a separate card
    }

    // Render current level key-value pairs
    content.push(
      <CCol key={`${key}-${level}`}>
        <CCard>
          <CCardHeader>{key}</CCardHeader>
          <CCardBody>{JSON.stringify(value, null, 2)}</CCardBody>
        </CCard>
      </CCol>,
    )
  }

  return (
    <>
      {content}
      {nextLevelObject && renderObjectAsColumns(nextLevelObject, level + 1, maxLevel)}
    </>
  )
}

function CippJsonView({
  jsonData = { 'No Data Selected': 'No Data Selected' },
  removeKeys = ['*@odata*', 'id', 'guid', 'createdDateTime', '*modified*', 'deletedDateTime'],
}) {
  const [showRawJson, setShowRawJson] = useState(false)
  const theme =
    useSelector((state) => state.app.currentTheme) === 'dark' ? githubDarkTheme : githubLightTheme
  const cleanedJsonData = translateAndRemoveKeys(jsonData, removeKeys)

  return (
    <div className="mb-3">
      <CAccordion alwaysOpen>
        <CAccordionItem itemKey="general-1">
          <CAccordionHeader>Settings</CAccordionHeader>
          <CAccordionBody>
            <CFormSwitch label="View as code" onChange={() => setShowRawJson(!showRawJson)} />
            {showRawJson ? (
              <JsonView
                value={jsonData}
                collapsed={1}
                displayDataTypes={false}
                displayObjectSize={false}
                style={{ ...theme }}
              />
            ) : (
              <CRow>{renderObjectAsColumns(cleanedJsonData)}</CRow>
            )}
          </CAccordionBody>
        </CAccordionItem>
      </CAccordion>
    </div>
  )
}

export default CippJsonView
