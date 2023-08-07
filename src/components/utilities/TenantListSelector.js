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
    <CCard>
      <CCardHeader>Select default Tenant List</CCardHeader>
      <CButtonGroup role="group" aria-label="Page Size Switcher">
        <CButton
          onClick={() => SwitchPageSize(true)}
          active={TenantListSelector ? true : false}
          color="secondary"
        >
          Compressed
        </CButton>
        <CButton
          onClick={() => SwitchPageSize(false)}
          active={TenantListSelector ? false : true}
          color="secondary"
        >
          Full list
        </CButton>
      </CButtonGroup>
    </CCard>
  )
}

export default TenantListSelector
