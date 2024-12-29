import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { CToast, CToastBody, CToaster, CToastHeader, CCollapse, CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { closeToast } from 'src/store/features/toasts'
import ReactTimeAgo from 'react-time-ago'

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
    <CToast
      autohide={false}
      delay={5000}
      visible={true}
      className="align-items-center"
      onClose={onClose}
    >
      <CToastHeader>
        <div className="fw-bold me-auto">{title}</div>
        <small className="me-3">Just Now</small>
        <div className="me-3">
          <FontAwesomeIcon size="2x" icon={faTimes} onClick={onClose} />
        </div>
      </CToastHeader>
      <CToastBody>
        <div className="d-flex justify-content-between align-items-center text-danger">
          <strong>{message}</strong>
        </div>
        <pre>
          {error?.status} - {error?.message}
        </pre>
      </CToastBody>
    </CToast>
  )
}

Toast.propTypes = {
  title: PropTypes.string,
  message: PropTypes.any,
  onClose: PropTypes.func.isRequired,
  error: PropTypes.any,
}

export default Toasts
