import React from 'react'
import { CFormSwitch, CRow, CCol } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setTenantList } from 'src/store/features/app'

const TenantListSelector = () => {
  const dispatch = useDispatch()
  const TenantListSelector = useSelector((state) => state.app.TenantListSelector)

  const SwitchPageSize = (value) => {
    dispatch(setTenantList({ TenantListSelector: value }))
  }

  return (
    <CRow>
      <CCol className="mb-3">
        <CFormSwitch
          onChange={(e) => SwitchPageSize(e.target.checked)}
          initialValue={TenantListSelector}
          name="TenantListSelector"
          label="Show compressed tenant list"
        />
      </CCol>
    </CRow>
  )
}

export default TenantListSelector
