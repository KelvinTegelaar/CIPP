import React from 'react'
import PropTypes from 'prop-types'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import { CippOffcanvas } from '.'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { CippOffcanvasTable } from '../tables'

export default function CippListOffcanvas(props) {
  return (
    <CippOffcanvas
      placement={props.placement}
      title={props.title}
      visible={props.visible}
      id={props.id}
      hideFunction={props.hideFunction}
    >
      {props.groups.map((group, key) => (
        <OffcanvasListSection items={group.items} key={key} />
      ))}
    </CippOffcanvas>
  )
}

CippListOffcanvas.propTypes = {
  groups: PropTypes.array,
  placement: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  visible: PropTypes.bool,
  id: PropTypes.string.isRequired,
  hideFunction: PropTypes.func.isRequired,
}

export function OffcanvasListSection({ title, items }) {
  console.log(items)
  const mappedItems = items.map((item, key) => ({ value: item.content, label: item.heading }))
  return (
    <>
      <h4 className="mt-4">{title}</h4>
      {items.length > 0 && (
        <CCard className="content-card">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <CCardTitle>
              <FontAwesomeIcon icon={faGlobe} className="mx-2" /> Extended Information
            </CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CippOffcanvasTable rows={mappedItems} />
          </CCardBody>
        </CCard>
      )}
    </>
  )
}
OffcanvasListSection.propTypes = {
  title: PropTypes.string,
  items: PropTypes.array,
}
