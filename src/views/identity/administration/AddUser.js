import React, { useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import { TenantSelector } from '../../../components/cipp'

import { useListDomainsQuery } from '../../../store/api/domains'
import { useListLicensesQuery } from '../../../store/api/licenses'
import { useListUsersQuery, useAddUserMutation } from '../../../store/api/users'

import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'react-final-form'
import {
  RFFCFormCheck,
  RFFCFormInput,
  Condition,
  RFFCFormTextarea,
  RFFSelectSearch,
  RFFCFormSwitch,
  RFFCFormSelect,
} from '../../../components/RFFComponents'
import countryList from '../../../assets/countrylist.json'

const required = (value) => (value ? undefined : 'Required')
const passwordRequired = (value, values) => {
  if (!values.Autopassword && !values.Password) {
    return 'Password option required'
  }
  return undefined
}

export default function AddUser() {
  const dispatch = useDispatch()
  const app = useSelector((state) => state.app) ?? {}
  const { currentTenant = {} } = app
  const tenantDomain = currentTenant?.defaultDomainName

  const [addUser, { data: addUserResult, isFetching: addUserFetching, error: addUserError }] =
    useAddUserMutation()
  const {
    data: licenseList = [],
    isFetching: licensesFetching,
    isSuccess: licensesSuccess,
    error: licensesError,
  } = useListLicensesQuery({ tenantDomain })

  const {
    data: usersList = [],
    isFetching: usersFetching,
    isSuccess: usersSuccess,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const {
    data: domainsList = [],
    isFetching: domainsFetching,
    error: domainsError,
  } = useListDomainsQuery({ tenantDomain })

  const onSubmit = async (values) => {
    // eslint-disable-next-line no-undef
    // @todo bind this to create user
    // addUser({ user: values })
    window.alert(JSON.stringify(values, 0, 2))
  }

  const initialValues = {
    License: false,
    Autopassword: false,
    mustChangePass: false,
  }

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <CCard>
          <CCardHeader>
            <CCardTitle>Account Details</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <Form
              initialValues={{ ...initialValues }}
              onSubmit={onSubmit}
              render={({ handleSubmit, submitting, pristine, values }) => (
                <CForm onSubmit={handleSubmit}>
                  <CRow>
                    <h5>Identity</h5>
                    <CCol md={6} className="mb-3 gy-5">
                      <CInputGroup className="w-100">
                        <RFFCFormInput
                          // label="Username"
                          name="username"
                          placeholder="Enter username"
                          validate={required}
                        />
                        <CInputGroupText className="mb-3 gy-3">@</CInputGroupText>
                        <RFFCFormSelect
                          // label="Domain"
                          name="domain"
                          placeholder={domainsFetching ? 'Loading...' : 'Select domain'}
                          values={domainsList.map((domain) => ({
                            value: domain.id,
                            label: domain.id,
                          }))}
                          validate={required}
                        />
                        {!domainsFetching && domainsError && (
                          <span>Failed to load list of domains</span>
                        )}
                      </CInputGroup>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={3} className="mb-3">
                      <RFFCFormInput
                        name="firstname"
                        label="First Name"
                        placeholder="Enter first name"
                        validate={required}
                      />
                    </CCol>
                    <CCol md={3} className="mb-3">
                      <RFFCFormInput
                        name="lastname"
                        label="Last Name"
                        placeholder="Enter last name"
                        validate={required}
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6} className="mb-3">
                      <RFFCFormInput
                        name="Displayname"
                        label="Display Name"
                        placeholder="Enter the display name"
                        validate={required}
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <h5>Settings</h5>
                    <CCol md={6} className="mb-3">
                      <RFFCFormCheck
                        label="Create password automatically"
                        name="Autopassword"
                        validate={passwordRequired}
                      />
                      <Condition when="Autopassword" is={false}>
                        <RFFCFormInput
                          name="Password"
                          type="password"
                          placeholder="Enter a password"
                          validate={passwordRequired}
                        />
                      </Condition>
                      <RFFCFormCheck
                        name="mustchangepass"
                        label="Require password change at next logon"
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6} className="mb-3">
                      <RFFSelectSearch
                        values={countryList.map(({ Code, Name }) => ({
                          value: Code,
                          name: Name,
                        }))}
                        name="usageLocation"
                        placeholder="Type to search..."
                        label="Usage Location"
                        validate={required}
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6} className="mb-3">
                      <RFFCFormSwitch
                        name="License"
                        label="Create user with license"
                        value={false}
                      />
                      <Condition when="License" is={true}>
                        <span>Licenses</span>
                        <br />
                        {licensesFetching && <CSpinner />}
                        {!licensesFetching && licensesError && <span>Error loading licenses</span>}
                        {licensesSuccess &&
                          licenseList.map((license) => (
                            <RFFCFormCheck
                              key={license.id}
                              name={`Licenses.${license.skuId}`}
                              label={license.skuPartNumber}
                            />
                          ))}
                      </Condition>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6} className="mb-3">
                      <RFFCFormTextarea
                        name="AddedAliases"
                        type="textarea"
                        label="Aliases"
                        placeholder="Enter one alias per line, leave blank if no Aliases are required."
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6} className="mb-3">
                      <RFFSelectSearch
                        label="Copy group membership from other user"
                        values={
                          (!usersError &&
                            usersSuccess &&
                            usersList.map((user) => {
                              // value, name
                              return { value: user.id, name: user.displayName }
                            })) ||
                          []
                        }
                        placeholder={usersFetching ? 'Loading...' : 'Select user'}
                        name="CopyFrom"
                      />
                      {!usersSuccess && usersError && <span>Failed to load list of users</span>}
                    </CCol>
                  </CRow>
                  <CRow>
                    <h5>Job info</h5>
                    <CCol md={6} className="mb-3">
                      <RFFCFormInput name="JobTitle" label="Job title" type="text" />
                      <RFFCFormInput name="Department" label="Department" type="text" />
                      <RFFCFormInput name="CompanyName" label="Company name" type="text" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6}>
                      <CButton type="submit" disabled={submitting}>
                        Add User
                      </CButton>
                    </CCol>
                  </CRow>
                  {/* @todo remove this message */}
                  Note: does not submit at the moment
                  {process.env.NODE_ENV !== 'production' && (
                    <>
                      <pre>{JSON.stringify(values, null, 2)}</pre>
                    </>
                  )}
                </CForm>
              )}
            />
          </CCardBody>
        </CCard>
      </div>
    </div>
  )
}

AddUser.propTypes = {}
