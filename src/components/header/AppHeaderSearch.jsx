import React, { useCallback } from 'react'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { toggleSwitcher } from 'src/store/features/switcher'
import { CButton } from '@coreui/react'
import { useDispatch } from 'react-redux'

const AppHeaderSearch = () => {
  const dispatch = useDispatch()
  const handleFastSwitcher = useCallback(() => {
    dispatch(toggleSwitcher())
  }, [dispatch])
  return (
    <>
      <CButton variant="ghost" onClick={handleFastSwitcher}>
        <FontAwesomeIcon icon={faSearch} size="lg" />
      </CButton>
    </>
  )
}

export default AppHeaderSearch
