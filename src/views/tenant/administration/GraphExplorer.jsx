import React, { useEffect, useState, useRef, useMemo } from 'react'
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
import { CippCodeOffCanvas, ModalService } from 'src/components/utilities'
import { debounce } from 'lodash-es'
import CippScheduleOffcanvas from 'src/components/utilities/CippScheduleOffcanvas'

const GraphExplorer = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const [params, setParams] = useState()
  const [alertVisible, setAlertVisible] = useState()
  const [random, setRandom] = useState('')
  const [random2, setRandom2] = useState('')
  const [ocVisible, setOCVisible] = useState(false)
  const [searchNow, setSearchNow] = useState(false)
  const [visibleA, setVisibleA] = useState(true)
  const handleSubmit = async (values) => {
    setParams(values)
    setRandom((Math.random() + 1).toString(36).substring(7))
    setSearchNow(true)
  }
  const [execGraphRequest, graphrequest] = useLazyGenericGetRequestQuery()
  const [execPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [execPropRequest, availableProperties] = useLazyGenericGetRequestQuery()
  const {
    data: customPresets = [],
    isFetching: presetsIsFetching,
    error: presetsError,
  } = useGenericGetRequestQuery({ path: '/api/ListGraphExplorerPresets', params: { random2 } })
  const QueryColumns = { set: false, data: [] }
  const [scheduleVisible, setScheduleVisible] = useState(false)
  const [scheduleValues, setScheduleValues] = useState({})

  const debounceEndpointChange = useMemo(() => {
    function endpointChange(value) {
      execPropRequest({
        path: '/api/ListGraphRequest',
        params: {
          Endpoint: value,
          ListProperties: true,
          TenantFilter: tenant.defaultDomainName,
          IgnoreErrors: true,
          random: (Math.random() + 1).toString(36).substring(7),
        },
      })
    }
    return debounce(endpointChange, 1000)
  }, [])

  if (graphrequest.isSuccess) {
    if (
      graphrequest.data?.Metadata?.Parameters?.$select !== undefined &&
      graphrequest.data?.Metadata?.Parameters?.$select !== '' &&
      graphrequest.data?.Metadata?.Parameters?.$select !== null
    ) {
      //set columns
      if (graphrequest.data?.Metadata?.TenantFilter === 'AllTenants') {
        QueryColumns.data.push({
          name: 'Tenant',
          selector: (row) => row['Tenant'],
          sortable: true,
          exportSelector: 'Tenant',
          cell: cellGenericFormatter(),
        })
        QueryColumns.data.push({
          name: 'CippStatus',
          selector: (row) => row['CippStatus'],
          sortable: true,
          exportSelector: 'CippStatus',
          cell: cellGenericFormatter(),
        })
      }
      graphrequest.data?.Metadata?.Parameters?.$select.split(',')?.map((value) =>
        QueryColumns.data.push({
          name: value,
          selector: (row) => row[`${value.toString()}`],
          sortable: true,
          exportSelector: value,
          cell: cellGenericFormatter(),
        }),
      )
    } else if (graphrequest.data?.Results?.length > 0) {
      //set columns
      Object.keys(graphrequest.data?.Results[0]).map((value) =>
        QueryColumns.data.push({
          name: value,
          selector: (row) => row[`${value.toString()}`],
          sortable: true,
          exportSelector: value,
          cell: cellGenericFormatter(),
        }),
      )
    } else {
      QueryColumns.data.push({
        name: 'data',
        selector: (row) => row['data'],
        sortable: true,
        exportSelector: 'data',
        cell: cellGenericFormatter(),
      })
    }
    QueryColumns.set = true
  }

  const handleManagePreset = ({ values, action, message }) => {
    var params = {
      action: action,
      preset: values,
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

  function handleSchedule(values) {
    var graphParameters = []
    const paramNames = ['$filter', '$format', '$search', '$select', '$top']
    paramNames.map((param) => {
      if (values[param]) {
        if (Array.isArray(values[param])) {
          graphParameters.push({ Key: param, Value: values[param].map((p) => p.value).join(',') })
        } else {
          graphParameters.push({ Key: param, Value: values[param] })
        }
      }
    })

    const reportName = values.name ?? 'Graph Explorer'
    const shippedValues = {
      taskName: reportName + ' - ' + tenant.displayName,
      command: { label: 'Get-GraphRequestList', value: 'Get-GraphRequestList' },
      parameters: {
        Parameters: graphParameters,
        NoPagination: values.NoPagination,
        ReverseTenantLookup: values.ReverseTenantLookup,
        ReverseTenantLookupProperty: values.ReverseTenantLookupProperty,
        Endpoint: values.endpoint,
        SkipCache: true,
      },
    }
    setScheduleValues(shippedValues)
    setScheduleVisible(true)
  }

  const presets = [
    {
      name: 'All users with email addresses',
      id: '6164e239-0c9a-4a27-9049-6250bf65a3e3',
      params: { endpoint: '/users', $select: 'userPrincipalName,mail,proxyAddresses', $filter: '' },
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
    {
      name: 'Organization Branding',
      id: '2ed236e2-268e-461b-9d37-98b123010667',
      params: {
        endpoint: 'organization/%tenantid%/branding',
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
      var select = ''
      if (params?.$select) {
        select = params.$select.map((p) => p.value).join(',')
      }
      if (params?.name) {
        params.QueueNameOverride = 'Graph Explorer - ' + params.name
      }
      execGraphRequest({
        path: 'api/ListGraphRequest',
        params: {
          ...params,
          $select: select,
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
                if (field == 'endpoint') {
                  debounceEndpointChange(value)
                }
                if (value?.value) {
                  let preset = presets.filter(function (obj) {
                    return obj.id === value.value
                  })
                  if (preset[0]?.id !== '') {
                    if (set == 'endpoint') {
                      debounceEndpointChange(preset[0]?.params[set])
                    }
                    if (set == '$select') {
                      if (preset[0]?.params[set]) {
                        var properties = preset[0].params[set].split(',')
                        var selectedProps = properties.map((prop) => {
                          return {
                            label: prop,
                            value: prop,
                          }
                        })
                        onChange(selectedProps)
                      } else {
                        onChange('')
                      }
                    } else {
                      if (preset[0]?.params[set]) {
                        onChange(preset[0]?.params[set])
                      } else {
                        onChange(preset[0][set])
                      }
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

  function getPresetProps(values) {
    var newvals = Object.assign({}, values)
    if (newvals?.$select !== undefined && Array.isArray(newvals?.$select)) {
      newvals.$select = newvals?.$select.map((p) => p.value).join(',')
    }
    delete newvals['reportTemplate']
    delete newvals['tenantFilter']
    delete newvals['IsShared']
    return newvals
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
                                retainInput={false}
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
                            <CTooltip content="Share this preset with other users?">
                              <span>
                                <RFFCFormSwitch name="IsShared" label="Share Preset" />
                              </span>
                            </CTooltip>
                            <WhenFieldChanges field="reportTemplate" set="IsShared" />
                            <FormSpy>
                              {(props) => {
                                let preset = presets.filter(function (obj) {
                                  return obj.id === props?.values?.reportTemplate?.value
                                })
                                return (
                                  <>
                                    <div className="my-2">
                                      <CTooltip content="Import / Export" placement="right">
                                        <CButton
                                          onClick={() => setOCVisible(true)}
                                          className="me-2"
                                        >
                                          <FontAwesomeIcon icon="exchange-alt" />
                                        </CButton>
                                      </CTooltip>
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
                                              className="me-2"
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
                                    <CippCodeOffCanvas
                                      title="Preset Import / Export"
                                      row={{
                                        preset: getPresetProps(props.values),
                                      }}
                                      state={ocVisible}
                                      path="api/ExecGraphExplorerPreset"
                                      hideFunction={() => {
                                        setOCVisible(false)
                                        setRandom2((Math.random() + 1).toString(36).substring(7))
                                      }}
                                    />
                                  </>
                                )
                              }}
                            </FormSpy>
                            <hr />
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
                            <RFFCFormSwitch
                              name="ReverseTenantLookup"
                              label="Reverse Tenant Lookup"
                            />
                            <WhenFieldChanges field="reportTemplate" set="ReverseTenantLookup" />
                            <RFFCFormInput
                              type="text"
                              name="$format"
                              label="Format"
                              placeholder="Optional format to return (e.g. application/json)"
                            />
                            <WhenFieldChanges field="reportTemplate" set="$format" />
                          </CCol>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="endpoint"
                              label="Endpoint"
                              placeholder="Enter the Graph Endpoint you'd like to run the custom report for."
                            />
                            <WhenFieldChanges field="reportTemplate" set="endpoint" />
                            <WhenFieldChanges field="endpoint" set="endpoint" />
                            <div className="mb-3">
                              <RFFSelectSearch
                                name="$select"
                                label="Select"
                                placeholder="Select the columns to use for this query"
                                retainInput={true}
                                multi={true}
                                values={
                                  availableProperties?.data?.Results
                                    ? availableProperties?.data?.Results.map((prop) => {
                                        return {
                                          name: prop,
                                          value: prop,
                                        }
                                      })
                                    : []
                                }
                                allowCreate={true}
                                isLoading={availableProperties.isFetching}
                              />
                            </div>
                            <RFFCFormInput
                              type="text"
                              name="$filter"
                              label="Filter"
                              placeholder="Enter the filter string for the Graph query"
                            />
                            <WhenFieldChanges field="reportTemplate" set="$filter" />
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
                            <RFFCFormInput
                              type="text"
                              name="ReverseTenantLookupProperty"
                              label="Reverse Tenant Lookup Property"
                              placeholder="Default tenantId"
                            />
                            <WhenFieldChanges
                              field="reportTemplate"
                              set="ReverseTenantLookupProperty"
                            />
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CCol>
                            <CButton type="submit" disabled={submitting}>
                              <FontAwesomeIcon className="me-2" icon={faSearch} />
                              Query
                            </CButton>
                            <FormSpy>
                              {(props) => {
                                return (
                                  <CButton
                                    onClick={() => handleSchedule(props.values)}
                                    className="ms-2"
                                  >
                                    <FontAwesomeIcon className="me-2" icon="calendar-alt" />
                                    Schedule Report
                                  </CButton>
                                )
                              }}
                            </FormSpy>
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
      <CippScheduleOffcanvas
        title="Schedule Report"
        state={scheduleVisible}
        placement="end"
        hideFunction={() => setScheduleVisible(false)}
        initialValues={scheduleValues}
      />
      <hr />
      <CippPage title="Report Results" tenantSelector={false}>
        {!searchNow && <span>Execute a search to get started.</span>}
        {graphrequest.isFetching && !QueryColumns.set && (
          <div className="my-2">
            <CSpinner className="me-2" /> Loading Data
          </div>
        )}
        {graphrequest.isSuccess && QueryColumns.set && searchNow && (
          <CCard className="content-card">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <CCardTitle>Results</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <>
                {graphrequest?.data?.Metadata?.Queued && (
                  <CCallout color="info">{graphrequest?.data?.Metadata?.QueueMessage}</CCallout>
                )}
                <CippTable
                  reportName="GraphExplorer"
                  dynamicColumns={false}
                  columns={QueryColumns.data}
                  data={graphrequest?.data?.Results}
                  isFetching={graphrequest.isFetching}
                  refreshFunction={() => setRandom((Math.random() + 1).toString(36).substring(7))}
                />
              </>
            </CCardBody>
          </CCard>
        )}
      </CippPage>
    </>
  )
}

export default GraphExplorer
