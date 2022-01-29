import React from 'react'
import { CButtonGroup, CButton, CCard, CCardHeader } from '@coreui/react'
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
    <CCard>
      <CCardHeader>Select Default Page Size</CCardHeader>
      <CButtonGroup role="group" aria-label="Page Size Switcher">
        {pageSizes.map((tablePageSize, index) => (
          <CButton
            onClick={() => SwitchPageSize(tablePageSize)}
            active={tablePageSize === currentTablePageSize ? true : false}
            color="secondary"
            key={index}
          >
            {tablePageSize}
          </CButton>
        ))}
      </CButtonGroup>
    </CCard>
  )
}

export default PageSizeSwitcher
