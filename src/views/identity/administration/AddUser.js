import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CFormLabel,
  CRow,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { Form } from 'react-final-form'
import {
  Condition,
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormSelect,
  RFFCFormSwitch,
  RFFCFormTextarea,
  RFFSelectSearch,
} from 'src/components/forms'
import { CippPage } from 'src/components/layout'
import countryList from 'src/data/countryList'
import { useListUsersQuery } from 'src/store/api/users'
import { useListDomainsQuery } from 'src/store/api/domains'
import { useListLicensesQuery } from 'src/store/api/licenses'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { required } from 'src/validators'

const passwordRequired = (value, values) => {
  if (!values.Autopassword && !values.password) {
    return 'Password or automatically set password required'
  }
  return undefined
}

const AddUser = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const { defaultDomainName: tenantDomain } = tenant

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const {
    data: domains = [],
    isFetching: domainsIsFetching,
    error: domainsError,
  } = useListDomainsQuery({ tenantDomain })

  const {
    data: licenses = [],
    isFetching: licensesIsFetching,
    error: licensesError,
  } = useListLicensesQuery({ tenantDomain })

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    //@todo: need to fix copyfrom in api so this is no longer required
    if (!values.CopyFrom) {
      values.CopyFrom = ''
    }
    //@todo: need to fix this in api so this hacky shit is no longer needed.
    if (!values.addedAliases) {
      values.addedAliases = ''
    }

    const shippedValues = {
      AddedAliases: values.addedAliases,
      BusinessPhone: values.businessPhones,
      City: values.city,
      CompanyName: values.companyName,
      CopyFrom: values.CopyFrom,
      Country: values.country,
      Department: values.department,
      DisplayName: values.displayName,
      Domain: values.primDomain,
      FirstName: values.givenName,
      Jobtitle: values.jobTitle,
      LastName: values.surname,
      License: values.licenses,
      MobilePhone: values.mobilePhone,
      Password: values.password,
      PostalCode: values.postalCode,
      Usagelocation: values.usageLocation,
      Username: values.mailNickname,
      streetAddress: values.streetAddress,
      Autopassword: values.Autopassword,
      MustChangePass: values.MustChangePass,
      tenantID: tenantDomain,
      ...values.license,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/AddUser', values: shippedValues })
  }
  const usagelocation = useSelector((state) => state.app.usageLocation)

  const initialState = {
    Autopassword: true,
    usageLocation: usagelocation,
  }

  return (
    <CippPage tenantSelector={true} title="Add User">
      {postResults.isSuccess && (
        <CAlert color="success" dismissible>
          {postResults.data?.Results}
        </CAlert>
      )}
      <CRow>
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Account Details</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <Form
                initialValues={{ ...initialState }}
                onSubmit={onSubmit}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <CRow>
                        <CCol md={6}>
                          <RFFCFormInput type="text" name="givenName" label="First Name" />
                        </CCol>
                        <CCol md={6}>
                          <RFFCFormInput type="text" name="surname" label="Last Name" />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol md={12}>
                          <RFFCFormInput
                            type="text"
                            name="displayName"
                            label="Display Name"
                            validate={required}
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol md={6}>
                          <RFFCFormInput
                            type="text"
                            name="mailNickname"
                            label="Username"
                            validate={required}
                          />
                        </CCol>
                        <CCol md={6}>
                          {domainsIsFetching && <CSpinner />}
                          {!domainsIsFetching && (
                            <RFFCFormSelect
                              // label="Domain"
                              name="primDomain"
                              label="Primary Domain name"
                              placeholder={!domainsIsFetching ? 'Select domain' : 'Loading...'}
                              values={domains?.map((domain) => ({
                                value: domain.id,
                                label: domain.id,
                              }))}
                              validate={required}
                            />
                          )}
                          {domainsError && <span>Failed to load list of domains</span>}
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol md={12}>
                          <RFFCFormTextarea
                            type="text"
                            name="addedAliases"
                            label="Add Aliases"
                            placeholder="Enter one alias per line"
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol md={12}>
                          <CFormLabel>Settings</CFormLabel>
                          <RFFCFormCheck
                            name="Autopassword"
                            label="Automatically Set Password"
                            validate={passwordRequired}
                          />
                          <Condition when="Autopassword" is={false}>
                            <CCol md={12}>
                              <RFFCFormInput
                                type="password"
                                name="password"
                                label="Password"
                                validate={passwordRequired}
                              />
                            </CCol>
                          </Condition>
                          <RFFCFormCheck
                            name="MustChangePass"
                            label="Require password change at next logon"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={12}>
                          <RFFSelectSearch
                            values={countryList.map(({ Code, Name }) => ({
                              value: Code,
                              name: Name,
                            }))}
                            name="usageLocation"
                            placeholder="Type to search..."
                            label="Usage Location"
                            validate={required}
                            value={usagelocation}
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol md={12}>
                          <RFFCFormSwitch name="licenses" label="Create user with license" />
                          <Condition when="licenses" is={true}>
                            <span>Licenses</span>
                            <br />
                            {licensesIsFetching && <CSpinner />}
                            {licensesError && <span>Error loading licenses</span>}
                            {!licensesIsFetching &&
                              licenses?.map((license) => (
                                <RFFCFormCheck
                                  key={license.id}
                                  name={`license.License_${license.skuId}`}
                                  label={`${license.skuPartNumber} (${license.availableUnits} available)`}
                                />
                              ))}
                          </Condition>
                        </CCol>
                      </CRow>
                      {/* <CRow> Temporarily disabled, API does not support this yet.
                              <CCol md={12}>
                                <RFFCFormInput name="jobTitle" label="Job Title" type="text" />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput name="streetAddress" label="Street" type="text" />
                              </CCol>
                              <CCol md={6}>
                                <RFFCFormInput name="postalCode" label="Postal Code" type="text" />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput name="city" label="city" type="text" />
                              </CCol>
                              <CCol md={6}>
                                <RFFCFormInput name="country" label="Country" type="text" />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput
                                  name="companyName"
                                  label="Company Name"
                                  type="text"
                                />
                              </CCol>
                              <CCol md={6}>
                                <RFFCFormInput name="department" label="Department" type="text" />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput name="mobilePhone" label="Mobile #" type="text" />
                              </CCol>
                              <CCol md={6}>
                                <RFFCFormInput
                                  name="businessPhones"
                                  label="Business #"
                                  type="text"
                                />
                              </CCol>
                            </CRow> */}
                      <CRow className="mb-3">
                        <CCol md={12}>
                          <RFFSelectSearch
                            label="Copy group membership from other user"
                            values={users?.map((user) => ({
                              value: user.mail,
                              name: user.displayName,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="CopyFrom"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CButton type="submit" disabled={submitting}>
                            Add User
                            {postResults.isFetching && (
                              <FontAwesomeIcon
                                icon={faCircleNotch}
                                spin
                                className="me-2"
                                size="1x"
                              />
                            )}
                          </CButton>
                        </CCol>
                      </CRow>
                      {postResults.isSuccess && (
                        <CAlert color="success">{postResults.data?.Results}</CAlert>
                      )}
                    </CForm>
                  )
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CippPage>
  )
}

export default AddUser
