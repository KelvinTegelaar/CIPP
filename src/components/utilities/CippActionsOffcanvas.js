import React from 'react'
import PropTypes from 'prop-types'
import { CCallout, CListGroup, CListGroupItem, COffcanvasTitle, CSpinner } from '@coreui/react'
import { CippOffcanvas, ModalService } from 'src/components/utilities'
import { CippOffcanvasPropTypes } from 'src/components/utilities/CippOffcanvas'
import { CippOffcanvasTable } from 'src/components/tables'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { useNavigate } from 'react-router-dom'

export default function CippActionsOffcanvas(props) {
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const handleLink = useNavigate()
  const handleModal = (modalMessage, modalUrl) => {
    ModalService.confirm({
      body: (
        <div style={{ overflow: 'visible' }}>
          <div>{modalMessage}</div>
        </div>
      ),
      title: 'Confirm',
      onConfirm: () => genericGetRequest({ path: modalUrl }),
    })
  }
  const handleOnClick = (link, modal, modalMessage, modalUrl) => {
    if (link) {
      handleLink(link)
    } else if (modal) {
      handleModal(modalMessage, modalUrl)
    }
  }
  const extendedInfoContent = <CippOffcanvasTable rows={props.extendedInfo} guid={props.id} />
  const actionsContent = props.actions.map((action, index) => (
    <CListGroup layout="horizontal-md" key={index}>
      <CListGroupItem
        className="cipp-action"
        component="button"
        color={action.color}
        onClick={() =>
          handleOnClick(action.link, action.modal, action.modalMessage, action.modalUrl)
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
      {getResults.isFetching && (
        <CCallout color="info">
          <CSpinner>Loading</CSpinner>
        </CCallout>
      )}
      {getResults.isSuccess && <CCallout color="info">{getResults.data?.Results}</CCallout>}
      {getResults.isError && (
        <CCallout color="danger">Could not connect to API: {getResults.error.message}</CCallout>
      )}
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
    }),
  ).isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      link: PropTypes.string,
      icon: PropTypes.element,
      color: PropTypes.string,
      onClick: PropTypes.func,
      modal: PropTypes.bool,
      modalUrl: PropTypes.string,
      modalMessage: PropTypes.string,
    }),
  ).isRequired,
  rowIndex: PropTypes.number,
  ...CippOffcanvasPropTypes,
}

CippActionsOffcanvas.propTypes = CippActionsOffcanvasPropTypes
