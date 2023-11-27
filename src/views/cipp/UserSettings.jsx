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
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CForm,
  CFormLabel,
  CListGroup,
  CListGroupItem,
  CProgress,
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
import { setOffboardingDefaults } from 'src/store/features/app'

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
  const dispatch = useDispatch()
  const currentSettings = useSelector((state) => state.app)

  const onSubmit = (values) => {
    dispatch(setOffboardingDefaults({ offboardingDefaults: values }))
    const shippedvalues = {
      user: values.user,
      currentSettings: currentSettings,
    }

    genericPostRequest({ path: '/api/ExecUserSettings', values: shippedvalues }).then((res) => {})
  }

  return (
    <>
      <CRow className="mb-3">
        <CCol md={6}>
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle>
                User Settings - {profile.clientPrincipal.userDetails} -{' '}
                {profile.clientPrincipal.userRoles
                  .filter((role) => role !== 'anonymous' && role !== 'authenticated')
                  .join(', ')}
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              <Form
                initialValues={{ ...currentSettings.offboardingDefaults }}
                onSubmit={onSubmit}
                render={({ handleSubmit, form, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <h3 className="underline mb-5">General</h3>
                      <CRow className="mb-3">
                        <CCol className="mb-3" md={6}>
                          <TenantListSelector className="mb-3" />
                          <UsageLocation />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <h3 className="underline mb-5">Appearance</h3>
                        <CCol className="mb-3">
                          <ThemeSwitcher />
                          <PageSizeSwitcher />
                        </CCol>
                        <CCol className="mb-3">
                          <ReportImage />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <h3 className="underline mb-5">Offboarding Defaults</h3>
                        <CCol>
                          <RFFCFormSwitch name="RevokeSessions" label="Revoke all sessions" />
                          <RFFCFormSwitch name="RemoveMobile" label="Remove all Mobile Devices" />
                          <RFFCFormSwitch name="RemoveRules" label="Remove all Rules" />
                          <RFFCFormSwitch name="RemoveLicenses" label="Remove Licenses" />
                          <RFFCFormSwitch
                            name="HideFromGAL"
                            label="Hide from Global Address List"
                          />
                        </CCol>
                        <CCol>
                          <RFFCFormSwitch
                            name="ConvertToShared"
                            label="Convert to Shared Mailbox"
                          />
                          <RFFCFormSwitch name="DisableSignIn" label="Disable Sign in" />
                          <RFFCFormSwitch name="ResetPass" label="Reset Password" />
                          <RFFCFormSwitch name="RemoveGroups" label="Remove from all groups" />

                          <RFFCFormSwitch
                            name="keepCopy"
                            label="Keep copy of forwarded mail in source mailbox"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol className="mb-3" md={6}>
                          <CButton
                            onClick={() => {
                              form.change('user', profile.clientPrincipal.userDetails)
                            }}
                            className="me-3 mb-3"
                            name="singleuser"
                            type="submit"
                          >
                            Save Settings {submitting && <CSpinner size="sm" color="primary" />}
                          </CButton>
                          {
                            //if the role contains admin, show the all user button. //
                            profile.clientPrincipal.userRoles.includes('admin') && (
                              <CButton
                                onClick={() => {
                                  form.change('user', 'allUsers')
                                }}
                                className="mb-3"
                                name="allUsers"
                                type="submit"
                              >
                                Save for all users
                                {submitting && <CSpinner size="sm" color="primary" />}
                              </CButton>
                            )
                          }
                        </CCol>
                      </CRow>
                    </CForm>
                  )
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default UserSettings
