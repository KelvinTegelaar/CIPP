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
import { RFFCFormInput, RFFCFormSelect } from 'src/components/forms'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons'
import { CippTable } from 'src/components/tables'
import { TenantSelector } from 'src/components/utilities'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CippPage } from 'src/components/layout/CippPage'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { OnChange } from 'react-final-form-listeners'

const GraphExplorer = () => {
  let navigate = useNavigate()
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const endpoint = query.get('endpoint')
  const SearchNow = query.get('SearchNow')
  const [visibleA, setVisibleA] = useState(true)
  const handleSubmit = async (values) => {
    setVisibleA(false)
    Object.keys(values).filter(function (x) {
      if (values[x] === null) {
        delete values[x]
      }
      return null
    })
    const shippedValues = {
      tenantFilter: tenant.defaultDomainName,
      SearchNow: true,
      ...values,
    }
    var queryString = Object.keys(shippedValues)
      .map((key) => key + '=' + shippedValues[key])
      .join('&')

    navigate(`?${queryString}`)
  }
  const [execGraphRequest, graphrequest] = useLazyGenericGetRequestQuery()
  const QueryColumns = { set: false, data: [] }

  if (graphrequest.isSuccess) {
    if (graphrequest.data.length === 0) {
      graphrequest.data = [{ data: 'No Data Found' }]
    }

    //set columns

    const flatObj = Object.keys(graphrequest.data[0]).flat(100)
    flatObj.map((value) =>
      QueryColumns.data.push({
        name: value,
        selector: (row) => row[`${value.toString()}`],
        sortable: true,
        exportSelector: value,
      }),
    )
    QueryColumns.set = true
  }

  useEffect(() => {
    execGraphRequest({
      path: 'api/execGraphRequest',
      params: { tenantFilter: tenant.defaultDomainName, endpoint: endpoint },
    })
  }, [endpoint, execGraphRequest, tenant.defaultDomainName])

  /* eslint-disable react/prop-types */
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
                let template = value
                onChange(template)
              }}
            </OnChange>
          )}
        </FormSpy>
      )}
    </Field>
  )

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Report Settings
                <CButton size="sm" variant="ghost" onClick={() => setVisibleA(!visibleA)}>
                  <FontAwesomeIcon icon={visibleA ? faChevronDown : faChevronRight} />
                </CButton>
              </CCardTitle>
            </CCardHeader>
            <CCollapse visible={visibleA}>
              <CCardBody>
                <Form
                  initialValues={{
                    tenantFilter: tenant.defaultDomainName,
                    endpoint: endpoint,
                  }}
                  onSubmit={handleSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow>
                          <CCol>
                            <TenantSelector showAllTenantSelector />
                          </CCol>
                        </CRow>
                        <hr className="my-4" />
                        <CRow>
                          <CCol>
                            <RFFCFormSelect
                              name="reportTemplate"
                              label="Select a report"
                              placeholder="Select a report"
                              values={[
                                {
                                  label: 'All users with email addresses',
                                  value: '/users?$select=userprincipalname,mail',
                                },
                                {
                                  label:
                                    'All Devices listing ID, Displayname, and registration status',
                                  value:
                                    '/devices?$select=deviceId,DisplayName,profileType,registrationDateTime,trustType',
                                },
                                {
                                  label: 'All contacts and their mail addresses',
                                  value:
                                    '/contacts?$select=CompanyName,DisplayName,Mail,ProxyAddresses',
                                },
                                {
                                  label: 'Outlook Agents used in last 90 days',
                                  value: `reports/getEmailAppUsageUserDetail(period='D90')?$format=application/json`,
                                },
                                {
                                  label: 'Activated M365 Subscription installations',
                                  value:
                                    '/reports/getOffice365ActivationsUserDetail?$format=application/json',
                                },
                                {
                                  label: 'Applications signed in in last 30 days',
                                  value: `reports/getAzureADApplicationSignInSummary(period='D30')`,
                                },
                                {
                                  label: 'User Registration Report',
                                  value: '/reports/authenticationMethods/userRegistrationDetails',
                                },
                                {
                                  label: 'All Global Admins',
                                  value:
                                    'directoryRoles/roleTemplateId=62e90394-69f5-4237-9190-012177145e10/members',
                                },
                                {
                                  label: 'Secure Score with Current Score and Max Score',
                                  value:
                                    'security/secureScores?$top=1&$select=currentscore,maxscore,activeusercount,enabledservices',
                                },
                              ]}
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="endpoint"
                              label="Or enter an endpoint"
                              placeholder="Enter the Graph Endpoint you'd like to run the custom report for."
                            />
                          </CCol>
                          <WhenFieldChanges field="reportTemplate" set="endpoint" />
                        </CRow>
                        <CRow className="mb-3">
                          <CCol>
                            <CButton type="submit" disabled={submitting}>
                              <FontAwesomeIcon className="me-2" icon={faSearch} />
                              Query
                            </CButton>
                          </CCol>
                        </CRow>
                        {/*<CRow>*/}
                        {/* <CCol>*/}
                        {/*   <pre>{JSON.stringify(values, null, 2)}</pre>*/}
                        {/* </CCol>*/}
                        {/*</CRow>*/}
                      </CForm>
                    )
                  }}
                />
              </CCardBody>
            </CCollapse>
          </CCard>
        </CCol>
      </CRow>
      <hr />
      <CippPage title="Report Results" tenantSelector={false}>
        {!SearchNow && <span>Execute a search to get started.</span>}
        {graphrequest.isSuccess && QueryColumns.set && SearchNow && (
          <CippTable
            reportName="GraphExplorer"
            columns={QueryColumns.data}
            data={graphrequest.data}
            isFetching={graphrequest.isFetching}
          />
        )}
      </CippPage>
    </>
  )
}

export default GraphExplorer
