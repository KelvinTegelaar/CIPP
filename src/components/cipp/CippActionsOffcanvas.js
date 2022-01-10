import React from 'react'
import PropTypes from 'prop-types'
import { CListGroup, CListGroupItem, COffcanvasTitle } from '@coreui/react'
import CippOffcanvas, { CippOffcanvasPropTypes } from './CippOffcanvas'
import CippOffcanvasTable from './CippOffcanvasTable'
import { ModalService } from '../ModalRoot'

export default function CippActionsOffcanvas(props) {
  const executeModalRequest = (modalUrl) => {
    ModalService.confirm({
      body: (
        <div style={{ overflow: 'visible' }}>
          <div>Executed Request: {modalUrl}</div>
        </div>
      ),
      title: 'Confirm',
      //onConfirm: () => executeModalRequest(modalUrl),
    })
  }

  const handleModal = (modalMessage, modalUrl) => {
    ModalService.confirm({
      body: (
        <div style={{ overflow: 'visible' }}>
          <div>{modalMessage}</div>
        </div>
      ),
      title: 'Confirm',
      onConfirm: () => executeModalRequest(modalUrl),
    })
  }
  const extendedInfoContent = <CippOffcanvasTable rows={props.extendedInfo} guid={props.id} />
  const actionsContent = props.actions.map((action, index) => (
    <CListGroup layout="horizontal-md" key={index}>
      <CListGroupItem
        className="cipp-action"
        component="button"
        color={action.color}
        href={action.link}
        onClick={
          action.modal ? () => handleModal(action.modalMessage, action.modalUrl) : action.OnClick
        }
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
      {extendedInfoContent}
      {<COffcanvasTitle>Actions</COffcanvasTitle>}
      {actionsContent}
    </CippOffcanvas>
  )
}

const CippActionsOffcanvasPropTypes = {
  extendedInfo: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
      onClick: PropTypes.func,
      modal: PropTypes.bool,
      modalUrl: PropTypes.string,
      modalMessage: PropTypes.string,
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
  rowIndex: PropTypes.number,
  ...CippOffcanvasPropTypes,
}

CippActionsOffcanvas.propTypes = CippActionsOffcanvasPropTypes
