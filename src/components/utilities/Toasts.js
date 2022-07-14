import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { CToast, CToastBody, CToaster, CToastHeader, CCollapse, CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpandAlt, faCompressAlt, faTimes } from '@fortawesome/free-solid-svg-icons'
import { closeToast } from 'src/store/features/toasts'

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
      <CToastHeader className="d-flex justify-content-between">
        <div>{title}</div>
        <FontAwesomeIcon size="2x" icon={faTimes} onClick={onClose} />
      </CToastHeader>
      <CToastBody>
        <div className="d-flex justify-content-between align-items-center text-danger">
          <strong>{message}</strong>
          <CButton size="sm" variant="outline" color="primary" onClick={() => setVisible(!visible)}>
            Details
            <FontAwesomeIcon
              className="ms-1"
              size="1x"
              icon={visible ? faCompressAlt : faExpandAlt}
            />
          </CButton>
        </div>
        <CCollapse visible={visible}>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </CCollapse>
      </CToastBody>
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
