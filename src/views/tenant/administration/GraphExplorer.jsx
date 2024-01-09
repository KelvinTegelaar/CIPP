import React, { useEffect, useState, useRef } from 'react'
import {
  CAlert,
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CCollapse,
  CForm,
  CRow,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { Field, Form, FormSpy } from 'react-final-form'
import { RFFCFormInput, RFFCFormSwitch, RFFSelectSearch } from 'src/components/forms'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons'
import { CippTable } from 'src/components/tables'
import { useSelector } from 'react-redux'
import { CippPage } from 'src/components/layout/CippPage'
import {
  useGenericGetRequestQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app'
import { OnChange } from 'react-final-form-listeners'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import PropTypes from 'prop-types'
import { ModalService } from 'src/components/utilities'

const GraphExplorer = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const [params, setParams] = useState()
  const [alertVisible, setAlertVisible] = useState()
  const [random, setRandom] = useState('')
  const [random2, setRandom2] = useState('')
  const [searchNow, setSearchNow] = useState(false)
  const [visibleA, setVisibleA] = useState(true)
  const handleSubmit = async (values) => {
    setParams(values)
    setRandom((Math.random() + 1).toString(36).substring(7))
    setSearchNow(true)
  }
  const [execGraphRequest, graphrequest] = useLazyGenericGetRequestQuery()
  const [execPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const {
    data: customPresets = [],
    isFetching: presetsIsFetching,
    error: presetsError,
  } = useGenericGetRequestQuery({ path: '/api/ListGraphExplorerPresets', params: { random2 } })
  const QueryColumns = { set: false, data: [] }

  if (graphrequest.isSuccess) {
    if (graphrequest.data.Results.length === 0) {
      graphrequest.data = [{ data: 'No Data Found' }]
    }

    //set columns
    Object.keys(graphrequest.data.Results[0]).map((value) =>
      QueryColumns.data.push({
        name: value,
        selector: (row) => row[`${value.toString()}`],
        sortable: true,
        exportSelector: value,
        cell: cellGenericFormatter(),
      }),
    )
    QueryColumns.set = true
  }

  const handleManagePreset = ({ values, action, message }) => {
    var params = {
      action: action,
      values: values,
    }
    ModalService.confirm({
      title: 'Confirm',
      body: <div>{message}</div>,
      onConfirm: () => {
        execPostRequest({ path: '/api/ExecGraphExplorerPreset', values: params }).then(() => {
          setRandom2((Math.random() + 1).toString(36).substring(7))
          setAlertVisible(true)
        })
      },
      confirmLabel: action,
      cancelLabel: 'Cancel',
    })
  }

  const presets = [
    {
      name: 'All users with email addresses',
      id: '6164e239-0c9a-4a27-9049-6250bf65a3e3',
      params: { endpoint: '/users', $select: 'userprincipalname,mail,proxyAddresses', $filter: '' },
      isBuiltin: true,
    },
    {
      name: 'All Devices listing ID, Displayname, and registration status',
      id: 'e7fdc49a-72a9-4a70-9dbf-a74152495d80',
      params: {
        endpoint: '/devices',
        $select: 'deviceId,DisplayName,profileType,registrationDateTime,trustType',
        $filter: '',
      },
      isBuiltin: true,
    },
    {
      name: 'All contacts and their mail addresses',
      id: 'f1844e3d-cb3e-4611-9bab-f5f42169bcd0',
      params: {
        endpoint: '/contacts',
        $select: 'CompanyName,DisplayName,Mail,ProxyAddresses',
        $filter: '',
      },
      isBuiltin: true,
    },
    {
      name: 'Outlook Agents used in last 90 days',
      id: 'eea3cacb-ca95-4998-bcd9-ff1815a7a493',
      params: {
        endpoint: `reports/getEmailAppUsageUserDetail(period='D90')`,
        $format: 'application/json',
        $filter: '',
        $select: '',
        isBuiltin: true,
      },
    },
    {
      name: 'Activated M365 Subscription installations',
      id: 'ccbe5b0d-ff0d-4262-a789-ccbd8f8d52e1',
      params: {
        endpoint: '/reports/getOffice365ActivationsUserDetail',
        $format: 'application/json',
        $filter: '',
        $select: '',
      },
      isBuiltin: true,
    },
    {
      name: 'Applications signed in in last 30 days',
      id: 'a9ec9f2d-c102-4b4f-9b9d-c2bc57155990',
      params: {
        endpoint: `reports/getAzureADApplicationSignInSummary(period='D30')`,
        $filter: '',
        $select: '',
      },
      isBuiltin: true,
    },
    {
      name: 'User Registration Report',
      id: 'a00d251d-2743-484a-b8bb-8601199ceb68',
      params: {
        endpoint: '/reports/authenticationMethods/userRegistrationDetails',
        $filter: '',
        $select: '',
      },
      isBuiltin: true,
    },
    {
      name: 'All Global Admins',
      id: 'c73df2bb-08fe-4fb2-b112-97006bdcf0a8',
      params: {
        endpoint: 'directoryRoles/roleTemplateId=62e90394-69f5-4237-9190-012177145e10/members',
        $filter: '',
        $select: '',
      },
      isBuiltin: true,
    },
    {
      name: 'Multifactor Authentication Report for Admins',
      id: 'ae7b3dc4-822b-46b9-aa0a-0305b4c33632',
      params: {
        endpoint: '/reports/authenticationMethods/userRegistrationDetails',
        $filter: 'IsAdmin eq true',
        $select: '',
      },
      isBuiltin: true,
    },
    {
      name: 'Secure Score with Current Score and Max Score',
      id: 'bd6665e8-02c1-4cbf-bd3c-d2a52f17c2cf',
      params: {
        endpoint: 'security/secureScores',
        $top: 90,
        $select: 'currentscore,maxscore,activeusercount,enabledservices',
        $filter: '',
        NoPagination: true,
      },
      isBuiltin: true,
    },
  ]

  if (customPresets?.Results?.length > 0) {
    presets.push({
      name: '───────────────',
      id: '',
      props: {
        isDisabled: true,
      },
    })
    customPresets.Results.map((preset) => {
      presets.push(preset)
    })
  }

  useEffect(() => {
    if (params?.endpoint) {
      execGraphRequest({
        path: 'api/ListGraphRequest',
        params: {
          ...params,
          random: random,
        },
      })
    }
  }, [params, execGraphRequest, tenant.defaultDomainName, random])

  const WhenFieldChanges = ({ field, set }) => (
    <Field name={set} subscription={{}}>
      {(
        // No subscription. We only use Field to get to the change function
        { input: { onChange } },
      ) => (
        <FormSpy subscription={{}}>
          {({ form }) => (
            <OnChange name={field}>
              {(value) => {
                if (value?.value) {
                  let preset = presets.filter(function (obj) {
                    return obj.id === value.value
                  })
                  if (preset[0]?.id !== '') {
                    if (preset[0]?.params[set]) {
                      onChange(preset[0]?.params[set])
                    } else {
                      onChange(preset[0][set])
                    }
                  }
                }
              }}
            </OnChange>
          )}
        </FormSpy>
      )}
    </Field>
  )
  WhenFieldChanges.propTypes = {
    field: PropTypes.node,
    set: PropTypes.string,
  }

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Report Settings
                <CButton
                  size="sm"
                  variant="ghost"
                  className="stretched-link"
                  onClick={() => setVisibleA(!visibleA)}
                >
                  <FontAwesomeIcon icon={visibleA ? faChevronDown : faChevronRight} />
                </CButton>
              </CCardTitle>
            </CCardHeader>
          </CCard>
          <CCollapse visible={visibleA}>
            <CCard className="options-card">
              <CCardHeader></CCardHeader>
              <CCardBody>
                <Form
                  keepDirtyOnReinitialize
                  initialValues={{
                    tenantFilter: tenant.defaultDomainName,
                  }}
                  onSubmit={handleSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow>
                          <CCol xs={12} md={4}>
                            <div className="mb-3">
                              <RFFSelectSearch
                                name="reportTemplate"
                                label="Select a report preset"
                                placeholder="Select a report"
                                multi={false}
                                values={presets.map((preset) => {
                                  return {
                                    name: preset?.name,
                                    value: preset?.id,
                                    props: preset?.props,
                                  }
                                })}
                                refreshFunction={() =>
                                  setRandom2((Math.random() + 1).toString(36).substring(7))
                                }
                                isLoading={presetsIsFetching}
                              />
                            </div>
                            <RFFCFormInput type="text" name="name" label="Preset Name" />
                            <WhenFieldChanges field="reportTemplate" set="name" />
                            <RFFCFormSwitch name="IsShared" label="Share Preset" />
                            <WhenFieldChanges field="reportTemplate" set="IsShared" />
                            <FormSpy>
                              {(props) => {
                                let preset = presets.filter(function (obj) {
                                  return obj.id === props?.values?.reportTemplate?.value
                                })
                                return (
                                  <>
                                    <div className="my-2">
                                      {!preset[0]?.isBuiltin &&
                                        preset[0]?.id &&
                                        preset[0]?.IsMyPreset && (
                                          <CTooltip content="Save" placement="right">
                                            <CButton
                                              onClick={() =>
                                                handleManagePreset({
                                                  action: 'Save',
                                                  message: 'Do you want to save this preset?',
                                                  values: props.values,
                                                })
                                              }
                                              className="me-2"
                                            >
                                              <FontAwesomeIcon icon="save" />
                                            </CButton>
                                          </CTooltip>
                                        )}
                                      {preset[0]?.id !== '' && (
                                        <CTooltip content="Copy" placement="right">
                                          <CButton
                                            onClick={() =>
                                              handleManagePreset({
                                                action: 'Copy',
                                                message: 'Do you want to copy this preset?',
                                                values: props.values,
                                              })
                                            }
                                            className="me-2"
                                          >
                                            <FontAwesomeIcon icon="copy" />
                                          </CButton>
                                        </CTooltip>
                                      )}
                                      {!preset[0]?.isBuiltin &&
                                        preset[0]?.id &&
                                        preset[0]?.IsMyPreset && (
                                          <CTooltip content="Delete" placement="right">
                                            <CButton
                                              color="danger"
                                              onClick={() =>
                                                handleManagePreset({
                                                  action: 'Delete',
                                                  message: 'Do you want to delete this preset?',
                                                  values: props.values,
                                                })
                                              }
                                            >
                                              <FontAwesomeIcon icon="trash" />
                                            </CButton>
                                          </CTooltip>
                                        )}
                                    </div>
                                    {postResults.isFetching && (
                                      <CCallout color="info">
                                        <CSpinner>Loading</CSpinner>
                                      </CCallout>
                                    )}
                                    {postResults.isSuccess && (
                                      <CAlert
                                        color={postResults.data?.Success ? 'success' : 'danger'}
                                        dismissible
                                        visible={alertVisible}
                                        onClose={() => setAlertVisible(false)}
                                      >
                                        {postResults.data?.Results}
                                      </CAlert>
                                    )}
                                  </>
                                )
                              }}
                            </FormSpy>
                            <RFFCFormSwitch name="$count" label="Use $count" />
                            <WhenFieldChanges field="reportTemplate" set="$count" />
                            <RFFCFormSwitch name="NoPagination" label="Disable Pagination" />
                            <WhenFieldChanges field="reportTemplate" set="NoPagination" />
                            <RFFCFormInput
                              type="text"
                              name="$top"
                              label="Top"
                              placeholder="Select the number of rows to return"
                            />
                            <WhenFieldChanges field="reportTemplate" set="$top" />
                          </CCol>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="endpoint"
                              label="Endpoint"
                              placeholder="Enter the Graph Endpoint you'd like to run the custom report for."
                            />
                            <WhenFieldChanges field="reportTemplate" set="endpoint" />
                            <RFFCFormInput
                              type="text"
                              name="$filter"
                              label="Filter"
                              placeholder="Enter the filter string for the Graph query"
                            />
                            <WhenFieldChanges field="reportTemplate" set="$filter" />
                            <RFFCFormInput
                              type="text"
                              name="$select"
                              label="Select"
                              placeholder="Select the columns to use for this query"
                            />
                            <WhenFieldChanges field="reportTemplate" set="$select" />
                            <RFFCFormInput
                              type="text"
                              name="$expand"
                              label="Expand"
                              placeholder="Select a column to expand"
                            />
                            <WhenFieldChanges field="reportTemplate" set="$expand" />
                            <RFFCFormInput
                              type="text"
                              name="$search"
                              label="Search"
                              placeholder="Enter OData search query"
                            />
                            <WhenFieldChanges field="reportTemplate" set="$search" />
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CCol>
                            <CButton type="submit" disabled={submitting}>
                              <FontAwesomeIcon className="me-2" icon={faSearch} />
                              Query
                            </CButton>
                          </CCol>
                        </CRow>
                      </CForm>
                    )
                  }}
                />
              </CCardBody>
            </CCard>
          </CCollapse>
        </CCol>
      </CRow>
      <hr />
      <CippPage title="Report Results" tenantSelector={false}>
        {!searchNow && <span>Execute a search to get started.</span>}
        {graphrequest.isSuccess && QueryColumns.set && searchNow && (
          <CCard className="content-card">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <CCardTitle>Results</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CippTable
                reportName="GraphExplorer"
                dynamicColumns={false}
                columns={QueryColumns.data}
                data={graphrequest.data.Results}
                isFetching={graphrequest.isFetching}
              />
            </CCardBody>
          </CCard>
        )}
      </CippPage>
    </>
  )
}

export default GraphExplorer
