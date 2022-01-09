import React from 'react'
import PropTypes from 'prop-types'
import {
  CListGroup,
  CListGroupItem,
  COffcanvasTitle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react'
import CippOffcanvas, { CippOffcanvasPropTypes } from './CippOffcanvas'

export default function CippGroupedOffcanvas(props) {
  const extendedInfoContent = props.extendedInfo.map((info, index) => (
    <>
      <CTableRow key={index}>
        <CTableDataCell className="cipp-extendedinfo-label">{info.label}</CTableDataCell>
        <CTableDataCell>{info.value}</CTableDataCell>
      </CTableRow>
    </>
  ))
  const actionsContent = props.actions.map((action, index) => (
    <CListGroup layout="horizontal-md" key={index}>
      <CListGroupItem
        className="cipp-action"
        component="button"
        color={action.color}
        href={action.link}
      >
        {action.icon}
        {action.label}
      </CListGroupItem>
    </CListGroup>
  ))
  return (
    <CippOffcanvas
      placement={props.placement}
      title={props.title}
      visible={props.visible}
      id={props.id}
      hideFunction={props.hideFunction}
    >
      <COffcanvasTitle>Extended Information</COffcanvasTitle>
      <CTable small borderless responsive align="top">
        <CTableBody>{extendedInfoContent}</CTableBody>
      </CTable>
      {<COffcanvasTitle>Actions</COffcanvasTitle>}
      {actionsContent}
    </CippOffcanvas>
  )
}

const CippGroupedOffcanvasPropTypes = {
  extendedInfo: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
    }),
  ).isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      link: PropTypes.string,
      icon: PropTypes.element,
      color: PropTypes.string,
    }),
  ).isRequired,
  ...CippOffcanvasPropTypes,
}

CippGroupedOffcanvas.propTypes = CippGroupedOffcanvasPropTypes
