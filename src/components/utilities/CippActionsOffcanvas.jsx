import React, { useRef, useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCardText,
  CCardTitle,
  CCol,
  CFormInput,
  CFormSelect,
  CListGroup,
  CListGroupItem,
  COffcanvasTitle,
  CProgress,
  CProgressBar,
  CProgressStacked,
  CRow,
  CSpinner,
} from '@coreui/react'
import {
  CippCodeBlock,
  CippOffcanvas,
  CippTableOffcanvas,
  ModalService,
} from 'src/components/utilities'
import { CippOffcanvasPropTypes } from 'src/components/utilities/CippOffcanvas'
import { CippOffcanvasTable } from 'src/components/tables'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { Link, useNavigate } from 'react-router-dom'
import { stringCamelCase } from 'src/components/utilities/CippCamelCase'
import ReactTimeAgo from 'react-time-ago'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { cellGenericFormatter } from '../tables/CellGenericFormat'
import ReactSelect from 'react-select'

const CippOffcanvasCard = ({ action }) => {
  const [offcanvasVisible, setOffcanvasVisible] = useState(false)
  return (
    <>
      <CCard className="border-top-dark border-top-3 mb-3">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <CCardTitle>Report Name: {action.label}</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CCardText>
            {action.value && (
              <>
                {action?.link ? (
                  <Link to={action.link}>Status: {action.value}</Link>
                ) : (
                  <span>Status: {action.value}</span>
                )}
              </>
            )}
          </CCardText>
          {Array.isArray(action?.detailsObject) && (
            <CButton size="sm" onClick={() => setOffcanvasVisible(true)}>
              Details
            </CButton>
          )}
          {Array.isArray(action?.detailsObject) && (
            <CippTableOffcanvas
              data={action.detailsObject}
              title={`${action.label} - Details`}
              state={offcanvasVisible}
              hideFunction={() => setOffcanvasVisible(false)}
              modal={true}
            />
          )}
        </CCardBody>
        <CCardFooter className="text-end">
          <CRow>
            {action?.percent > 0 && (
              <CCol xs="8">
                <div className="mt-1">
                  <CProgress>
                    <CProgressBar value={action.percent}>{action?.progressText}</CProgressBar>
                  </CProgress>
                </div>
              </CCol>
            )}
            <CCol xs={action?.percent ? '4' : '12'}>
              <small>{action.timestamp && <ReactTimeAgo date={action.timestamp} />}</small>
            </CCol>
          </CRow>
        </CCardFooter>
      </CCard>
    </>
  )
}
CippOffcanvasCard.propTypes = {
  action: PropTypes.object,
}

export default function CippActionsOffcanvas(props) {
  const inputRef = useRef('')
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [getDrowndownInfo, dropDownInfo] = useLazyGenericGetRequestQuery()
  const [modalContent, setModalContent] = useState({})

  const handleLink = useNavigate()
  const handleExternalLink = (link) => {
    window.open(link, '_blank')
  }
  const handleModal = useCallback(
    (modalMessage, modalUrl, modalType = 'GET', modalBody, modalInput, modalDropdown) => {
      const handlePostConfirm = () => {
        console.log(inputRef)
        const selectedValue = inputRef.current.props?.id
          ? inputRef.current.props.value.value
          : inputRef.current.value
        //console.log(inputRef)
        let additionalFields = {}

        if (inputRef.current.props?.id) {
          const selectedItem = dropDownInfo.data.find(
            (item) => item[modalDropdown.valueField] === selectedValue,
          )
          if (selectedItem && modalDropdown.addedField) {
            Object.keys(modalDropdown.addedField).forEach((key) => {
              additionalFields[key] = selectedItem[modalDropdown.addedField[key]]
            })
          }
        }
        const postRequestBody = {
          ...modalBody,
          ...additionalFields,
          input: selectedValue,
        }
        // Send the POST request
        genericPostRequest({
          path: modalUrl,
          values: postRequestBody,
        })
      }

      // Modal setup for GET, codeblock, and other types
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
      } else if (modalType === 'codeblock') {
        ModalService.open({
          data: modalBody,
          componentType: 'codeblock',
          title: 'Info',
          size: 'lg',
        })
      } else if (modalType === 'table') {
        const QueryColumns = []
        const columns = Object.keys(modalBody[0]).map((key) => {
          QueryColumns.push({
            name: key,
            selector: (row) => row[key],
            sortable: true,
            exportSelector: key,
            cell: cellGenericFormatter(),
          })
        })

        ModalService.open({
          data: modalBody,
          componentType: 'table',
          componentProps: {
            columns: QueryColumns,
            keyField: 'SKU',
          },
          title: 'Info',
          size: 'lg',
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
                    <ReactSelect
                      id="react-select-offcanvas"
                      classNamePrefix="react-select"
                      className="react-select-container"
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
          onConfirm: handlePostConfirm,
        })
      }
    },
    [
      dropDownInfo?.data,
      dropDownInfo?.isSuccess,
      genericGetRequest,
      genericPostRequest,
      modalContent,
    ],
  )
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
  }, [
    dropDownInfo,
    handleModal,
    modalContent.modalBody,
    modalContent.modalDropdown,
    modalContent.modalInput,
    modalContent.modalMessage,
    modalContent.modalType,
    modalContent.modalUrl,
  ])

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
      setModalContent({
        modalMessage,
        modalUrl,
        modalType,
        modalBody,
        modalInput,
        modalDropdown,
      })

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
      <CippOffcanvasCard action={action} key={index} />
    ))
  } catch (error) {
    // swallow error
  }

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
    actionsSelectorsContent = props?.actionsSelect?.map((action, index) => (
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
      isRefreshing={props.isRefreshing}
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
      {postResults.isSuccess && (
        <CippCodeBlock
          code={postResults.data?.Results}
          callout={true}
          dismissable={true}
          calloutCopyValue={getResults.data?.Results}
        />
      )}
      {postResults.isError && (
        <CCallout color="danger">Could not connect to API: {postResults.error.message}</CCallout>
      )}
      {getResults.isSuccess && (
        <CippCodeBlock
          code={getResults.data?.Results}
          callout={true}
          calloutDismissible={true}
          calloutColour={getResults.data?.colour ? getResults.data?.colour : 'info'}
          calloutCopyValue={getResults.data?.Results}
        />
      )}
      {getResults.isError && (
        <CCallout color="danger">Could not connect to API: {getResults.error.message}</CCallout>
      )}
      {!cardContent && props?.extendedInfo && props?.extendedInfo?.length > 0 && (
        <CCard className="content-card">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <CCardTitle>
              <FontAwesomeIcon icon={faGlobe} className="mx-2" /> Extended Information
            </CCardTitle>
          </CCardHeader>
          <CCardBody>{extendedInfoContent}</CCardBody>
        </CCard>
      )}
      {cardContent && cardContent}
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
