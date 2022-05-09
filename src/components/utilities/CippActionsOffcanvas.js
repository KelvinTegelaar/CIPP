import React from 'react'
import PropTypes from 'prop-types'
import { CCallout, CListGroup, CListGroupItem, COffcanvasTitle, CSpinner } from '@coreui/react'
import { CippOffcanvas, ModalService } from 'src/components/utilities'
import { CippOffcanvasPropTypes } from 'src/components/utilities/CippOffcanvas'
import { CippOffcanvasTable } from 'src/components/tables'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useNavigate } from 'react-router-dom'

export default function CippActionsOffcanvas(props) {
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleLink = useNavigate()
  const handleExternalLink = (link) => {
    window.open(link, '_blank')
  }
  const handleModal = (modalMessage, modalUrl, modalType = 'GET', modalBody) => {
    if (modalType === 'GET') {
      ModalService.confirm({
        body: (
          <div style={{ overflow: 'visible' }}>
            <div>{modalMessage}</div>
          </div>
        ),
        title: 'Confirm',
        onConfirm: () => genericGetRequest({ path: modalUrl }),
      })
    } else {
      ModalService.confirm({
        body: (
          <div style={{ overflow: 'visible' }}>
            <div>{modalMessage}</div>
          </div>
        ),
        title: 'Confirm',
        onConfirm: () => genericPostRequest({ path: modalUrl, values: modalBody }),
      })
    }
  }
  const handleOnClick = (link, modal, modalMessage, modalUrl, external, modalType, modalBody) => {
    if (link) {
      if (external) {
        handleExternalLink(link)
      } else {
        handleLink(link)
      }
    } else if (modal) {
      handleModal(modalMessage, modalUrl, modalType, modalBody)
    }
  }
  const extendedInfoContent = <CippOffcanvasTable rows={props.extendedInfo} guid={props.id} />
  const actionsContent = props.actions.map((action, index) => (
    <CListGroupItem
      className="cipp-action"
      component="button"
      color={action.color}
      onClick={() =>
        handleOnClick(
          action.link,
          action.modal,
          action.modalMessage,
          action.modalUrl,
          action.external,
          action.modalType,
          action.modalBody,
        )
      }
      key={index}
    >
      {action.icon}
      {action.label}
    </CListGroupItem>
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
      {postResults.isFetching && (
        <CCallout color="info">
          <CSpinner>Loading</CSpinner>
        </CCallout>
      )}
      {postResults.isSuccess && <CCallout color="info">{postResults.data?.Results}</CCallout>}
      {postResults.isError && (
        <CCallout color="danger">Could not connect to API: {postResults.error.message}</CCallout>
      )}
      {getResults.isSuccess && <CCallout color="info">{getResults.data?.Results}</CCallout>}
      {getResults.isError && (
        <CCallout color="danger">Could not connect to API: {getResults.error.message}</CCallout>
      )}
      <COffcanvasTitle>Extended Information</COffcanvasTitle>
      {extendedInfoContent}
      {<COffcanvasTitle>Actions</COffcanvasTitle>}
      <CListGroup layout="verical-md">{actionsContent}</CListGroup>
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
      modalBody: PropTypes.string,
      modalType: PropTypes.string,
      modalMessage: PropTypes.string,
      external: PropTypes.bool,
    }),
  ).isRequired,
  rowIndex: PropTypes.number,
  ...CippOffcanvasPropTypes,
}

CippActionsOffcanvas.propTypes = CippActionsOffcanvasPropTypes
