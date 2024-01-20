import React from 'react'
import PropTypes from 'prop-types'
import { CListGroup, CListGroupItem } from '@coreui/react'
import { CippOffcanvas } from '.'

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
        <OffcanvasListSection title={group.title} items={group.items} key={key} />
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
  return (
    <>
      <h4 className="mt-4">{title}</h4>
      {items.length > 0 && (
        <CListGroup className="my-3">
          {items.map((item, key) => (
            <CListGroupItem className="d-flex justify-content-between align-items-center" key={key}>
              {item.heading && <h6 className="w-50 mb-0">{item.heading}</h6>}
              {item.content}
            </CListGroupItem>
          ))}
        </CListGroup>
      )}
    </>
  )
}
OffcanvasListSection.propTypes = {
  title: PropTypes.string,
  items: PropTypes.array,
}
