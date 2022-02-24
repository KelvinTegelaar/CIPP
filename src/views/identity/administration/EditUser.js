import React, { useEffect, useState } from 'react'
import { CButton, CCallout, CCol, CForm, CFormLabel, CRow, CSpinner } from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { useDispatch, useSelector } from 'react-redux'
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
import countryList from 'src/data/countryList'
import { useListUserQuery, useListUsersQuery } from 'src/store/api/users'
import { useListDomainsQuery } from 'src/store/api/domains'
import { useListLicensesQuery } from 'src/store/api/licenses'
import { CippCodeBlock, ModalService } from 'src/components/utilities'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEdit, faEye } from '@fortawesome/free-solid-svg-icons'
import { CippContentCard, CippPage } from 'src/components/layout'
import { password } from 'src/validators'

const EditUser = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const [queryError, setQueryError] = useState(false)

  //const [editUser, { error: editUserError, isFetching: editUserIsFetching }] = useEditUserMutation()

  const {
    data: user = {},
    isFetching: userIsFetching,
    error: userError,
  } = useListUserQuery({ tenantDomain, userId })

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const {
    data: domains = [],
    isFetching: domainsIsFetching,
    error: domainsError,
  } = useListDomainsQuery({ tenantDomain, userId })

  const {
    data: licenses = [],
    isFetching: licensesIsFetching,
    error: licensesError,
  } = useListLicensesQuery({ tenantDomain })

  useEffect(() => {
    if (!userId || !tenantDomain) {
      ModalService.open({
        body: 'Error invalid request, could not load requested user.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    } else {
      setQueryError(false)
    }
  }, [userId, tenantDomain, dispatch])
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    //@todo: need to fix copyfrom in api so this is no longer required
    if (!values.CopyFrom) {
      values.CopyFrom = ''
    }
    //@todo: need to fix this in api so this hacky shit is no longer needed.

    const shippedValues = {
      AddedAliases: values.addedAliases,
      BusinessPhone: values.businessPhones,
      RemoveAllLicenses: values.RemoveAllLicenses,
      City: values.city,
      CompanyName: values.companyName,
      CopyFrom: values.CopyFrom,
      Country: values.country,
      Department: values.department,
      DisplayName: values.displayName,
      Domain: values.primDomain,
      firstName: values.givenName,
      Jobtitle: values.jobTitle,
      LastName: values.surname,
      License: values.licenses,
      MobilePhone: values.mobilePhone,
      Password: values.password,
      PostalCode: values.postalCode,
      Usagelocation: values.usageLocation,
      UserID: userId,
      Username: values.mailNickname,
      streetAddress: values.streetAddress,
      tenantID: tenantDomain,
      ...values.license,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/EditUser', values: shippedValues })
  }
  const usagelocation = useSelector((state) => state.app.usageLocation)

  const initialState = {
    keepLicenses: true,
    usageLocation: usagelocation,
    ...user,
  }

  // this is dumb
  const formDisabled = queryError === true || !!userError || !user || Object.keys(user).length === 0
  const RawUser = JSON.stringify(user, null, 2)
  return (
    <CippPage
      title={`Edit User: ${userIsFetching ? 'Loading...' : user.displayName}`}
      tenantSelector={false}
    >
      {!queryError && (
        <>
          {postResults.isSuccess && (
            <CCallout color="success">{postResults.data?.Results}</CCallout>
          )}
          {queryError && (
            <CRow>
              <CCol xs={12}>
                <CCallout color="danger">
                  {/* @todo add more descriptive help message here */}
                  Failed to load user
                </CCallout>
              </CCol>
            </CRow>
          )}
          <CRow>
            <CCol lg={6} xs={12}>
              <CippContentCard title="Account Details" icon={faEdit}>
                {userIsFetching && <CSpinner />}
                {userError && <span>Error loading user</span>}
                {!userIsFetching && (
                  <Form
                    initialValues={{ ...initialState }}
                    onSubmit={onSubmit}
                    render={({ handleSubmit, submitting, values }) => {
                      return (
                        <CForm onSubmit={handleSubmit}>
                          <CRow>
                            <CCol lg={6} xs={12}>
                              <RFFCFormInput
                                type="text"
                                name="givenName"
                                label="Edit First Name"
                                disabled={formDisabled}
                              />
                            </CCol>
                            <CCol lg={6} xs={12}>
                              <RFFCFormInput
                                type="text"
                                name="surname"
                                label="Edit Last Name"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs={12}>
                              <RFFCFormInput
                                type="text"
                                name="displayName"
                                label="Edit Display Name"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol lg={6} xs={12}>
                              <RFFCFormInput
                                type="text"
                                name="mailNickname"
                                label="Edit Username"
                                disabled={formDisabled}
                              />
                            </CCol>
                            <CCol lg={6} xs={12}>
                              {domainsIsFetching && <CSpinner />}
                              {!domainsIsFetching && (
                                <RFFCFormSelect
                                  // label="Domain"
                                  name="primDomain"
                                  label="Primary Domain name"
                                  disabled={formDisabled}
                                  placeholder={!domainsIsFetching ? 'Select domain' : 'Loading...'}
                                  values={domains?.map((domain) => ({
                                    value: domain.id,
                                    label: domain.id,
                                  }))}
                                />
                              )}
                              {domainsError && <span>Failed to load list of domains</span>}
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs={12}>
                              <RFFCFormTextarea
                                type="text"
                                name="addedAliases"
                                label="Add Aliases"
                                placeholder="Enter one alias per line"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs={12}>
                              <CFormLabel>Settings</CFormLabel>
                              <RFFCFormCheck
                                disabled={formDisabled}
                                name="Autopassword"
                                label="Reset Password"
                              />
                              <Condition when="Autopassword" is={true}>
                                <CCol xs={12}>
                                  <RFFCFormInput
                                    validate={password}
                                    type="password"
                                    name="password"
                                    label="Password"
                                  />
                                </CCol>
                              </Condition>
                              <RFFCFormCheck
                                disabled={formDisabled}
                                name="RequirePasswordChange"
                                label="Require password change at next logon"
                              />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CCol xs={12}>
                              <RFFSelectSearch
                                values={countryList.map(({ Code, Name }) => ({
                                  value: Code,
                                  name: Name,
                                }))}
                                disabled={formDisabled}
                                name="UsageLocation"
                                placeholder="Type to search..."
                                label="Usage Location"
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs={12}>
                              <RFFCFormSwitch
                                name="licenses"
                                label="Replace Licenses"
                                disabled={formDisabled}
                              />
                              <Condition when="licenses" is={true}>
                                <span>Licenses</span>
                                <br />
                                {licensesIsFetching && <CSpinner />}
                                {licensesError && <span>Error loading licenses</span>}
                                <RFFCFormCheck
                                  disabled={formDisabled}
                                  key={'license.id'}
                                  name={'RemoveAllLicenses'}
                                  label={'Remove all licenses'}
                                />
                                {licensesIsFetching && <CSpinner />}
                                {licensesError && <span>Error loading licenses</span>}
                                {!licensesIsFetching &&
                                  licenses?.map((license) => (
                                    <RFFCFormCheck
                                      disabled={formDisabled}
                                      key={license.id}
                                      name={`license.License_${license.skuId}`}
                                      label={`${license.skuPartNumber} (${license.availableUnits} available)`}
                                    />
                                  ))}
                              </Condition>
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs={12}>
                              <RFFCFormInput
                                name="jobTitle"
                                label="Job Title"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="streetAddress"
                                label="Street"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="postalCode"
                                label="Postal Code"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="city"
                                label="city"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="country"
                                label="Country"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="companyName"
                                label="Company Name"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="department"
                                label="Department"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="mobilePhone"
                                label="Mobile #"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="businessPhones"
                                label="Business #"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CCol md={12}>
                              <RFFSelectSearch
                                label="Copy group membership from other user"
                                disabled={formDisabled}
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
                              <CButton type="submit" disabled={submitting || formDisabled}>
                                Edit User
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
                              {postResults.data.Results.map((message, idx) => {
                                return <li key={idx}>{message}</li>
                              })}
                            </CCallout>
                          )}
                        </CForm>
                      )
                    }}
                  />
                )}
              </CippContentCard>
            </CCol>
            <CCol lg={6} xs={12}>
              <CippContentCard title="Raw User Data" icon={faEye}>
                {userIsFetching && <CSpinner />}
                {userError && <span>Error loading user</span>}
                {!userIsFetching && (
                  <>
                    This is the (raw) information for this account.
                    <CippCodeBlock language="json" code={RawUser} />
                  </>
                )}
              </CippContentCard>
            </CCol>
          </CRow>
        </>
      )}
    </CippPage>
  )
}

export default EditUser
