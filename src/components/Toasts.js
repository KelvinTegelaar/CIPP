import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CToast,
  CToastBody,
  CToaster,
  CToastClose,
  CToastHeader,
  CCollapse,
  CCard,
  CCardBody,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { closeToast } from '../store/modules/toast'
import PropTypes from 'prop-types'

const Toasts = () => {
  const dispatch = useDispatch()
  const toasts = useSelector((state) => state.toasts.toasts)

  return (
    <CToaster placement={'top-end'}>
      {[
        toasts.map((toast) => (
          <Toast
            key={toast.index}
            message={toast.message}
            title={toast.title}
            error={toast.toastError}
            onClose={() => dispatch(closeToast({ index: toast.index }))}
          />
        )),
      ]}
    </CToaster>
  )
}

const Toast = ({ message, title, onClose, error }) => {
  const [visible, setVisible] = useState(false)

  return (
    <CToast autohide={false} visible={true} className="align-items-center" onClose={onClose}>
      <CToastHeader>{title}</CToastHeader>
      <div className="d-flex">
        <CToastBody className="me-2 mt-2">{message}</CToastBody>
        <div className="me-2 m-auto">
          <FontAwesomeIcon
            icon={visible ? faCaretUp : faCaretDown}
            onClick={() => setVisible(!visible)}
          />
          <CToastClose onClick={onClose} />
        </div>
      </div>
      <CCollapse visible={visible}>
        <CCard className="mt-3">
          <CCardBody>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </CCardBody>
        </CCard>
      </CCollapse>
    </CToast>
  )
}

Toast.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  error: PropTypes.any,
}

export default Toasts
