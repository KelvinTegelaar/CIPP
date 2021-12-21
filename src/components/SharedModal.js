import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import { resetModal } from '../store/features/modal'
import DataTable from 'react-data-table-component'
import PropTypes from 'prop-types'

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
      return <DataTable data={data || []} {...componentProps} />
    case 'list':
      return <div>{Array.isArray(data) && data.map((el, idx) => <div key={idx}>{el}</div>)}</div>
    case 'text':
      return String(data)
    default:
      return String(data)
  }
}

const sharedProps = {
  componentType: PropTypes.oneOf(['table', 'list', 'text', 'confirm']),
  componentProps: PropTypes.object,
  body: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
  data: PropTypes.any,
  title: PropTypes.string,
  visible: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'lg', 'xl']),
  onClose: PropTypes.func,
}

export default function SharedModal() {
  const dispatch = useDispatch()
  const modal = useSelector((store) => store.modal)
  const {
    componentType = 'text',
    componentProps = {},
    body = false,
    data,
    title,
    visible,
    size,
    onClose = () => {},
  } = modal

  const handleClose = () => {
    dispatch(resetModal())
    onClose()
  }

  if (componentType === 'confirm') {
    return <ConfirmModal {...modal} />
  }

  return (
    <CModal size={size} scrollable visible={visible} onClose={handleClose}>
      <CModalHeader closeButton>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {!body && mapBodyComponent({ componentType, data, componentProps })}
        {body}
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

SharedModal.propTypes = {
  ...sharedProps,
}

export const ConfirmModal = ({
  componentType = 'text',
  componentProps = {},
  body = false,
  data,
  title,
  visible,
  size,
  onClose = () => {},
  onConfirm = () => {},
  confirmLabel = 'Yes',
  cancelLabel = 'Cancel',
}) => {
  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(resetModal())
    onClose()
  }

  const handleConfirm = () => {
    dispatch(resetModal())
    onConfirm()
  }

  return (
    <CModal size={size} visible={visible} onClose={handleClose}>
      <CModalHeader onClose={handleClose} closeButton>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {!body && mapBodyComponent({ componentType, data, componentProps })}
        {body}
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleConfirm}>
          {confirmLabel}
        </CButton>
        <CButton color="secondary" onClick={handleClose}>
          {cancelLabel}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

ConfirmModal.propTypes = {
  ...sharedProps,
  onConfirm: PropTypes.func,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
}
