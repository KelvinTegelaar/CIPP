import React from 'react'
import PropTypes from 'prop-types'
import { 
  CListGroup,
  CListGroupItem,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasBody,
  COffcanvasTitle,
  CDivider,
} from '@coreui/react'

export default function CippOffcanvas({ extendedInfo, actions, position, title }) {
  const extendedInfoContent = extendedInfo.map((info, index) => (
    <CListGroup layout="horizontal-md" key={index}>
      <CListGroupItem className='cipp-extendedinfo-label'>{info.label}</CListGroupItem>
      <CListGroupItem className='cipp-extendedinfo-value'>{info.value}</CListGroupItem>
    </CListGroup>
  ))
  const actionsContent = actions.map((action, index) => (
    <CListGroup layout="horizontal-md" key={index}>
      <CListGroupItem className='cipp-action' component="button" href={action.link}>{action.icon}{action.label}</CListGroupItem>
    </CListGroup>
  ))
  return (
    <COffcanvas position={position}>
      <COffcanvasHeader>{title}</COffcanvasHeader>
      <COffcanvasBody>
        <COffcanvasTitle>Extended Information</COffcanvasTitle>
        {extendedInfoContent}
        <CDivider />
        <COffcanvasTitle>Actions</COffcanvasTitle>
        {actionsContent}
      </COffcanvasBody>
    </COffcanvas>
  )
}

export const CippOffcanvasPropTypes = {
  extendedInfo: PropTypes.arrayOf(
    PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.any,
    }),
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
        label: PropTypes.string,
        link: PropTypes.string,
        icon: PropTypes.component,
    }),
  ),
  position: PropTypes.string,
  title: PropTypes.string,
}

CippOffcanvas.propTypes = CippOffcanvasPropTypes
