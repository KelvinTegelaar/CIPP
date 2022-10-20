import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { CFormInput, CSpinner } from '@coreui/react'
import { hideSwitcher, mapNav } from 'src/store/features/switcher'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import fuzzysort from 'fuzzysort'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

export const UniversalSearch = React.forwardRef(
  ({ onConfirm = () => {}, onChange = () => {}, maxResults = 7, value = '' }, ref) => {
    const [searchValue, setSearchValue] = useState(value)
    const [getSearchItems, searchItems] = useLazyGenericGetRequestQuery()

    const results = fuzzysort.go(searchValue, searchItems, {
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
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        // on enter key, start the search
        getSearchItems({ path: `/api/ExecUniversalSearch?SearchObj=${searchValue}` })
      }
    }

    return (
      <div>
        <div>
          <CFormInput
            ref={ref}
            type="text"
            placeholder="Search users across all tenants"
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            value={searchValue}
          />
        </div>
        {searchItems.isSuccess && <Results items={searchItems.data} searchValue={searchValue} />}
        {searchItems.isFetching && (
          <>
            <div className="d-flex flex-column m-3">
              <div className="d-flex">
                <div className="flex-grow-1 d-flex flex-column">
                  <div className="mx-1">
                    <CSpinner />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  },
)
UniversalSearch.displayName = 'UniversalSearch'
UniversalSearch.propTypes = {
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

const Results = ({ items = [] }) => {
  return items.map((item, key) => {
    return <ResultsRow key={key} match={item} />
  })
}

const ResultsRow = ({ match }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(hideSwitcher())
    navigate(`/identity/administration/users?customerId=${match.customerId}`)
  }

  return (
    <div style={{ cursor: 'pointer' }} className="m-3" onClick={handleClick}>
      <div className="d-flex flex-column">
        <div className="d-flex">
          <div className="flex-grow-1 d-flex flex-column">
            <div className="mx-1">{match.displayName}</div>
            <div className="mx-1">{match.userPrincipalName}</div>
            <small>Found in tenant {match.defaultDomainName}</small>
          </div>
        </div>
      </div>
    </div>
  )
}

ResultsRow.propTypes = {
  match: PropTypes.array,
}
