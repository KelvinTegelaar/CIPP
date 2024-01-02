import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CCollapse,
  CForm,
  CRow,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { Field, Form, FormSpy } from 'react-final-form'
import { RFFCFormInput, RFFCFormSelect, RFFCFormSwitch } from 'src/components/forms'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons'
import { CippTable } from 'src/components/tables'
import { useSelector } from 'react-redux'
import { CippPage } from 'src/components/layout/CippPage'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { OnChange } from 'react-final-form-listeners'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import PropTypes from 'prop-types'

const GraphExplorer = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const [params, setParams] = useState()
  const [random, setRandom] = useState('')
  const [searchNow, setSearchNow] = useState(false)
  const [visibleA, setVisibleA] = useState(true)
  const handleSubmit = async (values) => {
    setParams(values)
    setRandom((Math.random() + 1).toString(36).substring(7))
    setSearchNow(true)
  }
  const [execGraphRequest, graphrequest] = useLazyGenericGetRequestQuery()
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

  const presets = [
    {
      label: 'All users with email addresses',
      value: '6164e239-0c9a-4a27-9049-6250bf65a3e3',
      params: { endpoint: '/users', $select: 'userprincipalname,mail,proxyAddresses', $filter: '' },
    },
    {
      label: 'All Devices listing ID, Displayname, and registration status',
      value: 'e7fdc49a-72a9-4a70-9dbf-a74152495d80',
      params: {
        endpoint: '/devices',
        $select: 'deviceId,DisplayName,profileType,registrationDateTime,trustType',
        $filter: '',
      },
    },
    {
      label: 'All contacts and their mail addresses',
      value: 'f1844e3d-cb3e-4611-9bab-f5f42169bcd0',
      params: {
        endpoint: '/contacts',
        $select: 'CompanyName,DisplayName,Mail,ProxyAddresses',
        $filter: '',
      },
    },
    {
      label: 'Outlook Agents used in last 90 days',
      value: 'eea3cacb-ca95-4998-bcd9-ff1815a7a493',
      params: {
        endpoint: `reports/getEmailAppUsageUserDetail(period='D90')`,
        $format: 'application/json',
        $filter: '',
        $select: '',
      },
    },
    {
      label: 'Activated M365 Subscription installations',
      value: 'ccbe5b0d-ff0d-4262-a789-ccbd8f8d52e1',
      params: {
        endpoint: '/reports/getOffice365ActivationsUserDetail',
        $format: 'application/json',
        $filter: '',
        $select: '',
      },
    },
    {
      label: 'Applications signed in in last 30 days',
      value: 'a9ec9f2d-c102-4b4f-9b9d-c2bc57155990',
      params: {
        endpoint: `reports/getAzureADApplicationSignInSummary(period='D30')`,
        $filter: '',
        $select: '',
      },
    },
    {
      label: 'User Registration Report',
      value: 'a00d251d-2743-484a-b8bb-8601199ceb68',
      params: {
        endpoint: '/reports/authenticationMethods/userRegistrationDetails',
        $filter: '',
        $select: '',
      },
    },
    {
      label: 'All Global Admins',
      value: 'c73df2bb-08fe-4fb2-b112-97006bdcf0a8',
      params: {
        endpoint: 'directoryRoles/roleTemplateId=62e90394-69f5-4237-9190-012177145e10/members',
        $filter: '',
        $select: '',
      },
    },
    {
      label: 'Multifactor Authentication Report for Admins',
      value: 'ae7b3dc4-822b-46b9-aa0a-0305b4c33632',
      params: {
        endpoint: '/reports/authenticationMethods/userRegistrationDetails',
        $filter: 'IsAdmin eq true',
        $select: '',
      },
    },
    {
      label: 'Secure Score with Current Score and Max Score',
      value: 'bd6665e8-02c1-4cbf-bd3c-d2a52f17c2cf',
      params: {
        endpoint: 'security/secureScores',
        $top: 90,
        $select: 'currentscore,maxscore,activeusercount,enabledservices',
        $filter: '',
        NoPagination: true,
      },
    },
  ]

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
                let preset = presets.filter(function (obj) {
                  return obj.value === value
                })
                onChange(preset[0]?.params[set])
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
                            <RFFCFormSelect
                              name="reportTemplate"
                              label="Select a report preset"
                              placeholder="Select a report"
                              values={presets}
                            />
                            <RFFCFormSwitch name="NoPagination" label="Disable Pagination" />
                            <WhenFieldChanges field="reportTemplate" set="NoPagination" />
                            <RFFCFormSwitch name="$count" label="Use $count" />
                            <WhenFieldChanges field="reportTemplate" set="$count" />
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
