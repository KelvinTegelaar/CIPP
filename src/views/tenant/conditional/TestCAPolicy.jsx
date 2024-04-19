import React, { useState } from 'react'
import { CButton, CCallout, CCol, CForm, CRow, CSpinner, CTooltip } from '@coreui/react'
import { useSelector } from 'react-redux'
import { Field, Form } from 'react-final-form'
import { RFFCFormInput, RFFSelectSearch } from 'src/components/forms'
import {
  useGenericGetRequestQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEdit, faEye } from '@fortawesome/free-solid-svg-icons'
import { CippContentCard, CippPage, CippPageList } from 'src/components/layout'
import 'react-datepicker/dist/react-datepicker.css'
import { TenantSelector } from 'src/components/utilities'
import arrayMutators from 'final-form-arrays'
import 'react-datepicker/dist/react-datepicker.css'
import { useListUsersQuery } from 'src/store/api/users'
import { useListConditionalAccessPoliciesQuery } from 'src/store/api/tenants'
import { TableContentCard } from 'src/components/contentcards'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import countryList from 'src/data/countryList'

const TestCAPolicy = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const currentDate = new Date()
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [refreshState, setRefreshState] = useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const onSubmit = (values) => {
    genericPostRequest({
      path: '/api/ExecCACheck',
      values: { tenantFilter: tenantDomain, ...values },
    }).then((res) => {
      setRefreshState(res.requestId)
    })
  }

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const applications = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest',
    params: {
      Endpoint: 'servicePrincipals',
      TenantFilter: tenantDomain,
      IgnoreErrors: true,
      $top: 999,
    },
  })
  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row['displayName'],
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'displayName',
    },
    {
      name: 'State',
      selector: (row) => row['state'],
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'state',
    },
    {
      name: 'Policy Applied',
      selector: (row) => row['policyApplies'],
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'policyApplies',
    },
    {
      name: 'Reasons for not applying',
      selector: (row) => row['reasons'],
      sortable: true,
      exportSelector: 'reasons',
    },
  ]
  return (
    <CippPage title={`Add Schedule`} tenantSelector={false}>
      <>
        <CRow>
          <CCol md={4}>
            <CippContentCard title="Test Conditional Access Policy" icon={faEdit}>
              <Form
                onSubmit={onSubmit}
                mutators={{
                  ...arrayMutators,
                }}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <p>
                        Test your conditional access policies before putting them in production. The
                        returned results will show you if the user is allowed or denied access based
                        on the policy.
                      </p>
                      <CRow className="mb-3">
                        <CCol>
                          <label>Tenant</label>
                          <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <hr />
                        Mandatory Parameters:
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            label={'Select a user to test'}
                            values={users?.map((user) => ({
                              value: user.id,
                              name: `${user.displayName} <${user.userPrincipalName}>`,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="UserId"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            label={'Select the application to test.'}
                            values={applications?.data?.Results?.map((ca) => ({
                              value: ca.appId,
                              name: `${ca.displayName}`,
                            }))}
                            placeholder={
                              !applications.isFetching ? 'Select Application' : 'Loading...'
                            }
                            name="includeApplications"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <hr />
                        Optional Parameters:
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            values={countryList.map(({ Code, Name }) => ({
                              value: Code,
                              name: Name,
                            }))}
                            name="country"
                            placeholder="Type to search..."
                            label="Test from this country"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFCFormInput
                            placeholder="8.8.8.8"
                            label="Test from this IP"
                            name="IpAddress"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            label={'Select the device platform to test'}
                            values={[
                              { value: 'Windows', name: 'Windows' },
                              { value: 'iOS', name: 'iOS' },
                              { value: 'Android', name: 'Android' },
                              { value: 'MacOS', name: 'MacOS' },
                              { value: 'Linux', name: 'Linux' },
                            ]}
                            placeholder={'Select platform'}
                            name="devicePlatform"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            label={'Select the client application type to test'}
                            values={[
                              { value: 'all', name: 'All' },
                              { value: 'Browser', name: 'Browser' },
                              {
                                value: 'mobileAppsAndDesktopClients',
                                name: 'Mobile apps and desktop clients',
                              },
                              { value: 'exchangeActiveSync', name: 'Exchange ActiveSync' },
                              { value: 'easSupported', name: 'EAS supported' },
                              { value: 'other', name: 'Other clients' },
                            ]}
                            placeholder={'Select client application'}
                            name="clientAppType"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            label={'Select the sign in risk level of the user signing in.'}
                            values={[
                              { value: 'low', name: 'Low' },
                              { value: 'medium', name: 'Medium' },
                              { value: 'high', name: 'High' },
                              { value: 'none', name: 'None' },
                            ]}
                            placeholder={'Select Sign-in risk'}
                            name="SignInRiskLevel"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            label={'Select the user risk level of the user signing in.'}
                            values={[
                              { value: 'low', name: 'Low' },
                              { value: 'medium', name: 'Medium' },
                              { value: 'high', name: 'High' },
                              { value: 'none', name: 'None' },
                            ]}
                            placeholder={'Select User Risk'}
                            name="userRiskLevel"
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol md={6}>
                          <CButton type="submit" disabled={submitting}>
                            Test policies
                            {postResults.isFetching && (
                              <FontAwesomeIcon
                                icon={faCircleNotch}
                                spin
                                className="ms-2"
                                size="1x"
                              />
                            )}
                          </CButton>
                        </CCol>
                      </CRow>
                      {postResults.isSuccess && (
                        <CCallout color="success">
                          <li>
                            {postResults.data?.Results?.value
                              ? 'Test succesful. See the table for the results.'
                              : postResults.data.Results}
                          </li>
                        </CCallout>
                      )}
                      {getResults.isFetching && (
                        <CCallout color="info">
                          <CSpinner>Loading</CSpinner>
                        </CCallout>
                      )}
                      {getResults.isSuccess && (
                        <CCallout color="info">{getResults.data?.Results}</CCallout>
                      )}
                      {getResults.isError && (
                        <CCallout color="danger">
                          Could not connect to API: {getResults.error.message}
                        </CCallout>
                      )}
                    </CForm>
                  )
                }}
              />
            </CippContentCard>
          </CCol>
          <CCol md={8}>
            <TableContentCard
              title="Results"
              table={{ data: postResults.data?.Results?.value, columns: columns }}
            />
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default TestCAPolicy
