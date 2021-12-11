import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import { resetModal } from '../store/features/modal'
import DataTable from 'react-data-table-component'

/**
 *
 * @param componentType
 * @param {string|array<string|object>} data
 * @param componentProps
 * @returns {JSX.Element|string}
 */
function mapBodyComponent({ componentType, data, componentProps }) {
  switch (componentType) {
    case 'table':
      return <DataTable data={data} {...componentProps} />
    case 'list':
      return (
        <div>
          {data.map((el, idx) => (
            <div key={idx}>{el}</div>
          ))}
        </div>
      )
    case 'text':
      return String(data)
    default:
      return String(data)
  }
}

export default function SharedModal() {
  const {
    componentType = 'text',
    componentProps = {},
    body = false,
    data,
    title,
    visible,
    size,
  } = useSelector((store) => store.modal)
  const dispatch = useDispatch()

  const hideAction = () => dispatch(resetModal())

  return (
    <CModal size={size} scrollable visible={visible} onClose={hideAction}>
      <CModalHeader onClose={hideAction}>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {!body && mapBodyComponent({ componentType, data, componentProps })}
        {body}
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={hideAction}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
