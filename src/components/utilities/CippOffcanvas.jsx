import React from 'react'
import PropTypes from 'prop-types'
import { CButton, COffcanvas, COffcanvasHeader, COffcanvasBody } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

export default function CippOffcanvas(props) {
  return (
    <COffcanvas
      scroll
      className={`cipp-offcanvas ${props.addedClass ? props.addedClass : ''}`}
      visible={props.visible}
      placement={props.placement}
      id={props.id}
      aria-labelledby={props.title}
      onHide={props.hideFunction}
    >
      <COffcanvasHeader>
        <h2>{props.title}</h2>
        <span>
          {props.refreshFunction && (
            <CButton
              color="link"
              size="lg"
              onClick={() => {
                //console.log('refresh')
                props.refreshFunction()
              }}
            >
              <FontAwesomeIcon icon="sync" />
            </CButton>
          )}
          <CButton className="cipp-offcanvas-close" color="link" onClick={props.hideFunction}>
            <FontAwesomeIcon size="lg" icon={faTimes} color="link" />
          </CButton>
        </span>
      </COffcanvasHeader>
      <COffcanvasBody>{props.children}</COffcanvasBody>
    </COffcanvas>
  )
}

export const CippOffcanvasPropTypes = {
  children: PropTypes.node,
  placement: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  visible: PropTypes.bool,
  id: PropTypes.string,
  hideFunction: PropTypes.func.isRequired,
  refreshFunction: PropTypes.func,
  addedClass: PropTypes.string,
}

CippOffcanvas.propTypes = CippOffcanvasPropTypes
