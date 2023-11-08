import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import {
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardText,
  CCardTitle,
  CFormInput,
  CFormSelect,
  CListGroup,
  CListGroupItem,
  COffcanvasTitle,
  CSpinner,
} from '@coreui/react'
import { CippOffcanvas, ModalService } from 'src/components/utilities'
import { CippOffcanvasPropTypes } from 'src/components/utilities/CippOffcanvas'
import { CippOffcanvasTable } from 'src/components/tables'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { Link, useNavigate } from 'react-router-dom'
import { stringCamelCase } from 'src/components/utilities/CippCamelCase'
import ReactTimeAgo from 'react-time-ago'
import { useEffect } from 'react'
import { useState } from 'react'

export default function CippActionsOffcanvas(props) {
  const inputRef = useRef('')
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [getDrowndownInfo, dropDownInfo] = useLazyGenericGetRequestQuery()
  const [modalContent, setModalContent] = useState(null)

  useEffect(() => {
    if (dropDownInfo.isFetching) {
      handleModal(
        <CSpinner />,
        modalContent.modalUrl,
        modalContent.modalType,
        modalContent.modalBody,
        modalContent.modalInput,
        modalContent.modalDropdown,
      )
    }
    if (dropDownInfo.isSuccess) {
      handleModal(
        modalContent.modalMessage,
        modalContent.modalUrl,
        modalContent.modalType,
        modalContent.modalBody,
        modalContent.modalInput,
        modalContent.modalDropdown,
      )
    } else if (dropDownInfo.isError) {
      handleModal(
        'Error connecting to the API.',
        modalContent.modalUrl,
        modalContent.modalType,
        modalContent.modalBody,
        modalContent.modalInput,
        modalContent.modalDropdown,
      )
    }
  }, [dropDownInfo])

  const handleLink = useNavigate()
  const handleExternalLink = (link) => {
    window.open(link, '_blank')
  }
  const handleModal = (
    modalMessage,
    modalUrl,
    modalType = 'GET',
    modalBody,
    modalInput,
    modalDropdown,
  ) => {
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
        key: modalContent,
        body: (
          <div style={{ overflow: 'visible' }}>
            {modalInput && (
              <div>
                <CFormInput ref={inputRef} type="text" />
              </div>
            )}
            {modalDropdown && (
              <div>
                {dropDownInfo.isSuccess && (
                  <CFormSelect
                    ref={inputRef}
                    options={dropDownInfo.data.map((data) => ({
                      value: data[modalDropdown.valueField],
                      label: data[modalDropdown.labelField],
                    }))}
                  />
                )}
              </div>
            )}
            <div>{modalMessage}</div>
          </div>
        ),
        title: 'Confirm',
        onConfirm: () => [
          genericPostRequest({
            path: modalUrl,
            values: { ...modalBody, ...{ input: inputRef.current.value } },
          }),
        ],
      })
    }
  }
  const handleOnClick = (
    link,
    modal,
    modalMessage,
    modalUrl,
    external,
    modalType,
    modalBody,
    modalInput,
    modalDropdown,
  ) => {
    if (link) {
      if (external) {
        handleExternalLink(link)
      } else {
        handleLink(link)
      }
    } else if (modal) {
      if (modalDropdown) {
        getDrowndownInfo({ path: modalDropdown.url })
      }
      setModalContent({ modalMessage, modalUrl, modalType, modalBody, modalInput, modalDropdown })

      handleModal(modalMessage, modalUrl, modalType, modalBody, modalInput, modalDropdown)
    }
  }

  const handleOnSelect = (id, url) => {
    var select = document.getElementById(id)
    var selected = select.options[select.selectedIndex]
    var value1 = selected.value
    try {
      var value2 = stringCamelCase(selected.parentNode.label)
    } catch {
      // This is when we select Not Set as it doesn't have a parent group so will throw null
      value2 = 'unknown'
    }
    var actualUrl = url.replaceAll('{value1}', value1).replaceAll('{value2}', value2)
    genericGetRequest({ path: actualUrl })
  }
  let cardContent
  try {
    cardContent = props.cards.map((action, index) => (
      <>
        <CCard key={index} className="border-top-dark border-top-3 mb-3">
          <CCardBody>
            <CCardTitle>Report Name: {action.label}</CCardTitle>
            <CCardText>
              {action.value && <Link to={action.link}>Status: {action.value}</Link>}
            </CCardText>
            <small>{action.timestamp && <ReactTimeAgo date={action.timestamp} />}</small>
          </CCardBody>
        </CCard>
      </>
    ))
  } catch (error) {}

  const extendedInfoContent = <CippOffcanvasTable rows={props.extendedInfo} guid={props.id} />
  let actionsContent
  try {
    actionsContent = props.actions.map((action, index) => (
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
            action.modalInput,
            action.modalDropdown,
          )
        }
        key={index}
      >
        {action.icon}
        {action.label}
      </CListGroupItem>
    ))
  } catch (error) {
    console.error('An error occurred building OCanvas actions' + error.toString())
  }
  let actionsSelectorsContent
  try {
    actionsSelectorsContent = props.actionsSelect.map((action, index) => (
      <CListGroupItem className="" component="label" color={action.color} key={index}>
        {action.label}
        <CListGroupItem
          className="select-width"
          component="select"
          id={action.id + action.index}
          color={action.color}
          onChange={() => handleOnSelect(action.id + action.index, action.url)}
          key={index}
        >
          <CListGroupItem component="option" value="unknown" key={index + 999999999999999}>
            Not Set
          </CListGroupItem>
          {action.selectWords}
        </CListGroupItem>
      </CListGroupItem>
    ))
  } catch (error) {
    // When we create an Off Canvas control without selectors we will get this
    if (!error.toString().includes("Cannot read properties of undefined (reading '")) {
      console.error('An error occurred building OCanvas selectors' + error.toString())
    }
  }
  return (
    <CippOffcanvas
      placement={props.placement}
      title={props.title}
      visible={props.visible}
      id={props.id}
      hideFunction={props.hideFunction}
      refreshFunction={props.refreshFunction}
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
      {getResults.isSuccess && (
        <CCallout color={getResults.data?.colour ? getResults.data?.colour : 'info'}>
          {getResults.data?.Results}
        </CCallout>
      )}
      {getResults.isError && (
        <CCallout color="danger">Could not connect to API: {getResults.error.message}</CCallout>
      )}

      <COffcanvasTitle>Extended Information</COffcanvasTitle>
      {cardContent && cardContent}
      {extendedInfoContent}
      {<COffcanvasTitle>Actions</COffcanvasTitle>}
      <CListGroup>
        {actionsContent}
        {actionsSelectorsContent}
      </CListGroup>
    </CippOffcanvas>
  )
}

const CippActionsOffcanvasPropTypes = {
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
      icon: PropTypes.element,
      color: PropTypes.string,
      onClick: PropTypes.func,
      modal: PropTypes.bool,
      modalUrl: PropTypes.string,
      modalBody: PropTypes.object,
      modalDropdown: PropTypes.object,
      modalType: PropTypes.string,
      modalInput: PropTypes.bool,
      modalMessage: PropTypes.string,
      external: PropTypes.bool,
    }),
  ),
  actionsSelect: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      link: PropTypes.string,
      icon: PropTypes.element,
      options: PropTypes.string,
      color: PropTypes.string,
      onClick: PropTypes.func,
      modal: PropTypes.bool,
      modalUrl: PropTypes.string,
      modalBody: PropTypes.object,
      modalType: PropTypes.string,
      modalInput: PropTypes.bool,
      modalMessage: PropTypes.string,
      modalDropdown: PropTypes.object,
      external: PropTypes.bool,
    }),
  ),
  rowIndex: PropTypes.number,
  ...CippOffcanvasPropTypes,
}

CippActionsOffcanvas.propTypes = CippActionsOffcanvasPropTypes
