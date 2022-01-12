import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CFormInput, CModal, CModalBody } from '@coreui/react'
import { hideSwitcher, mapNav } from '../store/features/switcher'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
//import FuzzySearch from 'fuzzy-search'
import fuzzysort from 'fuzzysort'

const searchItems = mapNav()

export default function FastSwitcher() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const switcher = useSelector((store) => store.switcher)
  const searchRef = useRef(null)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    // delay focus
    setTimeout(() => searchRef.current?.focus(), 100)

    // clear search value when component dismounts
    return () => setSearchValue('')
  }, [switcher.visible])

  const handleChange = (event) => {
    setSearchValue(event.target?.value)
  }

  const handleClose = () => {
    dispatch(hideSwitcher())
  }

  if (!switcher.visible) {
    return null
  }

  const maxResults = 7

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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      // on enter key, navigate to top result
      dispatch(hideSwitcher())
      navigate(results[0]?.obj?.to)
    }
  }

  return (
    <CModal visible={switcher.visible} alignment="center" onClose={handleClose} transition={false}>
      <CModalBody>
        <div className="mb-3">
          <CFormInput
            ref={searchRef}
            type="text"
            placeholder="Search..."
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            value={searchValue}
          />
        </div>
        <Results items={results} searchValue={searchValue} />
      </CModalBody>
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
