import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CFormInput, CModal, CModalBody, CModalFooter, CModalTitle } from '@coreui/react'
import { hideSwitcher, mapNav } from 'src/store/features/switcher'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import fuzzysort from 'fuzzysort'

const searchItems = mapNav()

export const FastSwitcher = React.forwardRef(
  ({ onConfirm = () => {}, onChange = () => {}, maxResults = 7, value = '' }, ref) => {
    const [searchValue, setSearchValue] = useState(value)
    const navigate = useNavigate()

    const results = fuzzysort.go(searchValue, searchItems, {
      keys: ['name', 'section', 'to'],
      limit: maxResults,
      scoreFn: (a) =>
        // rank scores name>section>url (to)
        Math.max(
          a[0] ? a[0].score : -1000,
          a[1] ? a[1].score - 100 : -1000,
          a[2] ? a[2].score - 200 : -1000,
        ),
    })

    const handleChange = (event) => {
      setSearchValue(event.target?.value)
      onChange(event.target?.value)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        // on enter key, navigate to top result
        onConfirm()
        navigate(results[0]?.obj?.to)
      }
    }

    return (
      <div>
        <div>
          <CFormInput
            ref={ref}
            type="text"
            placeholder="What do you want to do?"
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            value={searchValue}
          />
        </div>
        <Results items={results} searchValue={searchValue} />
      </div>
    )
  },
)
FastSwitcher.displayName = 'FastSwitcher'
FastSwitcher.propTypes = {
  ref: PropTypes.oneOfType([
    // Either a function
    PropTypes.func,
    // Or the instance of a DOM native element (see the note about SSR)
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  onConfirm: PropTypes.func,
  onChange: PropTypes.func,
  maxResults: PropTypes.number,
  value: PropTypes.any,
}

export function FastSwitcherModal() {
  const dispatch = useDispatch()
  const switcher = useSelector((store) => store.switcher)
  const searchRef = useRef(null)

  useEffect(() => {
    // delay focus
    setTimeout(() => searchRef.current?.focus(), 100)
  }, [switcher.visible])

  if (!switcher.visible) {
    return null
  }

  const handleClose = () => {
    dispatch(hideSwitcher())
  }

  const handleConfirm = () => {
    dispatch(hideSwitcher())
  }

  return (
    <CModal visible={switcher.visible} alignment="center" onClose={handleClose} transition={false}>
      <CModalBody>
        <CModalTitle className="text-center mb-2">Search for pages or tasks...</CModalTitle>
        <FastSwitcher ref={searchRef} onConfirm={handleConfirm} />
      </CModalBody>
      <CModalFooter>
        <span className="text-success">Tip:</span> Press <kbd>↵</kbd> to open the top result.
      </CModalFooter>
    </CModal>
  )
}

const Results = ({ items = [] }) => {
  return items.map((item, key) => {
    return <ResultsRow key={key} match={item} />
  })
}

const ResultsRow = ({ match = [] }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // eslint-disable-next-line no-unsafe-optional-chaining
  const { name, section, icon, to } = match?.obj
  const [nameMatch, sectionMatch, toMatch] = match

  const handleHighlight = (match, fallback) => {
    if (!match) {
      return fallback
    }
    const [start, highlight, end] = fuzzysort.highlight(match, '$$', '$$').split('$$')
    return (
      <>
        {start}
        <mark>{highlight}</mark>
        {end}
      </>
    )
  }

  const handleClick = () => {
    dispatch(hideSwitcher())
    navigate(to)
  }

  return (
    <div style={{ cursor: 'pointer' }} className="m-3" onClick={handleClick}>
      <div className="d-flex flex-column">
        <div className="d-flex">
          <div className="mx-1">{icon && icon}</div>
          <div className="flex-grow-1 d-flex flex-column">
            <div className="mx-1">{handleHighlight(nameMatch, name)}</div>
            <div className="mx-1">{handleHighlight(sectionMatch, section)}</div>
            <small>{handleHighlight(toMatch, to)}</small>
          </div>
        </div>
      </div>
    </div>
  )
}

ResultsRow.propTypes = {
  match: PropTypes.array,
}
