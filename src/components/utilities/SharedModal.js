import React from 'react'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import PropTypes from 'prop-types'
import { CippTable } from 'src/components/tables'

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
      return <CippTable data={data || []} isModal={true} {...componentProps} />
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

export default function SharedModal(props) {
  const {
    componentType = 'text',
    componentProps = {},
    body = false,
    data,
    title,
    visible = true,
    size,
    onClose = () => {},
    close,
    ...rest
  } = props

  const handleClose = () => {
    onClose()
    close()
  }
  //console.log('show modal', { props }, { rest })

  if (componentType === 'confirm') {
    return <ConfirmModal {...props} {...rest} />
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
  close,
  onClose = () => {},
  onConfirm = () => {},
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
}) => {
  const handleClose = () => {
    onClose()
    close()
  }

  const handleConfirm = () => {
    onConfirm()
    close()
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
