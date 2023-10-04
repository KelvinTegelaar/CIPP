import React, { useEffect, useState } from 'react'
import {
  CBadge,
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CFormLabel,
  CListGroup,
  CListGroupItem,
  CRow,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { useDispatch, useSelector } from 'react-redux'
import { Field, Form, FormSpy } from 'react-final-form'
import {
  Condition,
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormRadio,
  RFFCFormSwitch,
  RFFCFormTextarea,
  RFFSelectSearch,
} from 'src/components/forms'
import countryList from 'src/data/countryList'

import {
  useGenericGetRequestQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEdit, faEye } from '@fortawesome/free-solid-svg-icons'
import { CippContentCard, CippPage, CippPageList } from 'src/components/layout'
import { password } from 'src/validators'
import {
  CellDate,
  CellDelegatedPrivilege,
  cellBadgeFormatter,
  cellBooleanFormatter,
  cellDateFormatter,
} from 'src/components/tables'
import { CellTip, cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import TenantListSelector from 'src/components/utilities/TenantListSelector'
import {
  ModalService,
  PageSizeSwitcher,
  TenantSelector,
  ThemeSwitcher,
  UsageLocation,
} from 'src/components/utilities'
import CippCodeOffCanvas from 'src/components/utilities/CippCodeOffcanvas'
import ReportImage from 'src/components/utilities/ReportImage'
import { useLoadClientPrincipalQuery } from 'src/store/api/auth'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const [ocVisible, setOCVisible] = useState(false)

  const handleDeleteSchedule = (apiurl, message) => {
    ModalService.confirm({
      title: 'Confirm',
      body: <div>{message}</div>,
      onConfirm: () => ExecuteGetRequest({ path: apiurl }),
      confirmLabel: 'Continue',
      cancelLabel: 'Cancel',
    })
  }
  let jsonResults
  try {
    jsonResults = JSON.parse(row.Results)
  } catch (error) {
    jsonResults = row.Results
  }

  return (
    <>
      <CTooltip content="View Results">
        <CButton size="sm" color="success" variant="ghost" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={'eye'} href="" />
        </CButton>
      </CTooltip>
      <CTooltip content="Delete task">
        <CButton
          onClick={() =>
            handleDeleteSchedule(
              `/api/RemoveScheduledItem?&ID=${row.RowKey}`,
              'Do you want to delete this job?',
            )
          }
          size="sm"
          variant="ghost"
          color="danger"
        >
          <FontAwesomeIcon icon={'trash'} href="" />
        </CButton>
      </CTooltip>
      <CippCodeOffCanvas
        hideButton
        title="Results"
        row={jsonResults}
        state={ocVisible}
        type="TemplateResults"
        hideFunction={() => setOCVisible(false)}
      />
    </>
  )
}

const UserSettings = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const { data: profile, isFetching, isLoading } = useLoadClientPrincipalQuery()

  const onSubmit = (values) => {
    genericPostRequest({ path: '/api/AddScheduledItem', values: shippedValues }).then((res) => {})
  }

  return (
    <>
      <CRow className="mb-3">
        <CCol md={8}>
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle>User Settings</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <div>Username</div>
                  <CBadge className="me-3" color="primary">
                    {profile.clientPrincipal.userDetails}
                  </CBadge>
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <div>Roles</div>
                  {profile.clientPrincipal.userRoles
                    .filter((role) => role !== 'anonymous' && role !== 'authenticated')
                    .map((r, index) => (
                      <CBadge key={index} className="me-3" color="primary">
                        {r}
                      </CBadge>
                    ))}
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <ReportImage />
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <ThemeSwitcher />
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <PageSizeSwitcher />
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <TenantListSelector />
                </CListGroupItem>

                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <UsageLocation />
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default UserSettings
