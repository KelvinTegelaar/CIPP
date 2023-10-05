import React from 'react'
import { CButtonGroup, CButton, CCard, CCardHeader } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setTenantList } from 'src/store/features/app'

const TenantListSelector = () => {
  const dispatch = useDispatch()
  const TenantListSelector = useSelector((state) => state.app.TenantListSelector)

  const SwitchPageSize = (value) => {
    dispatch(setTenantList({ TenantListSelector: value }))
  }

  return (
    <>
      <p>
        <b>Tenant overview page</b>
      </p>
      <CButtonGroup role="group" aria-label="Page Size Switcher">
        <CButton
          onClick={() => SwitchPageSize(true)}
          color={TenantListSelector ? 'primary' : 'secondary'}
        >
          Compressed
        </CButton>
        <CButton
          onClick={() => SwitchPageSize(false)}
          color={TenantListSelector ? 'secondary' : 'primary'}
        >
          Full list
        </CButton>
      </CButtonGroup>
    </>
  )
}

export default TenantListSelector
