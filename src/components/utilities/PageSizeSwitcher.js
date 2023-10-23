import React from 'react'
import { CButton, CCol, CRow } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentPageSize } from 'src/store/features/app'

const PageSizeSwitcher = () => {
  const dispatch = useDispatch()
  const pageSizes = useSelector((state) => state.app.pageSizes)
  const currentTablePageSize = useSelector((state) => state.app.tablePageSize)

  const SwitchPageSize = (targetTablePageSize) => {
    dispatch(setCurrentPageSize({ pageSize: targetTablePageSize }))
  }

  return (
    <>
      <CRow>
        <CCol>
          <label className="mb-3">Default Page Size</label>
        </CCol>
      </CRow>
      <CRow>
        <CCol className="mb-3">
          {pageSizes.map((tablePageSize, index) => (
            <CButton
              onClick={() => SwitchPageSize(tablePageSize)}
              className={`circular-button default ${
                tablePageSize === currentTablePageSize ? 'round-focus' : ''
              }`}
              key={index}
            >
              {tablePageSize}
            </CButton>
          ))}
        </CCol>
      </CRow>
    </>
  )
}

export default PageSizeSwitcher
