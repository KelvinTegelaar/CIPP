import React, { useEffect, useState } from 'react'
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
} from '@coreui/react'
import useQuery from '../../../hooks/useQuery'
import { setModalContent, showModal } from '../../../store/modules/modal'
import { listUser, listUsers } from '../../../store/modules/users'
import { listDomains } from '../../../store/modules/domains'
import { listLicenses } from '../../../store/modules/licenses'
import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'react-final-form'
import {
  Condition,
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormSelect,
  RFFCFormSwitch,
  RFFSelectSearch,
} from '../../../components/RFFComponents'
import countryList from '../../../assets/countrylist.json'

const EditUser = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const [queryError, setQueryError] = useState(false)

  const domains = useSelector((state) => state.domains) || {}
  const licenses = useSelector((state) => state.licenses) || {}
  const users = useSelector((state) => state.users) || {}

  const {
    licenses: {
      list: licenseList = [],
      loading: licenseLoading,
      loaded: licenseLoaded,
      error: licenseError,
    } = {},
  } = licenses
  const {
    domains: {
      list: domainsList = [],
      loading: domainsLoading,
      loaded: domainsLoaded,
      error: domainsError,
    } = {},
  } = domains
  const {
    users: { list: usersList = [], loading: usersLoading, loaded: usersLoaded, error: usersError },
    user: { user = {}, loading: userLoading, loaded: userLoaded, error: userError },
  } = users

  useEffect(() => {
    async function load() {
      dispatch(listUser({ tenantDomain, userId }))
      dispatch(listUsers({ tenant: { defaultDomainName: tenantDomain } }))
      dispatch(listDomains({ tenantDomain }))
      dispatch(listLicenses({ tenantDomain }))
    }

    if (!userId || !tenantDomain) {
      dispatch(
        setModalContent({
          body: 'Error invalid request, could not load requested user.',
          title: 'Invalid Request',
        }),
      )
      dispatch(showModal())
      setQueryError(true)
    } else {
      load()
    }
  }, [userId, tenantDomain, dispatch])

  const onSubmit = (values) => {
    window.alert(JSON.stringify(values))
  }
  const initialState = {
    keepLicenses: true,
    ...user,
  }

  // this is dumb
  const formDisabled = queryError === true || !!userError || !user || Object.keys(user).length === 0

  return (
    <CCard className="bg-white rounded p-5">
      {!queryError && (
        <>
          <CRow>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Account Details</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {!userLoaded && userLoading && <CSpinner />}
                  {!userLoaded && !userLoading && userError && <span>Error loading user</span>}
                  {userLoaded && !userLoading && (
                    <Form
                      initialValues={{ ...initialState }}
                      onSubmit={onSubmit}
                      render={({ handleSubmit, submitting, values }) => {
                        return (
                          <CForm onSubmit={handleSubmit}>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput
                                  type="text"
                                  name="givenName"
                                  label="Edit First Name"
                                  disabled={formDisabled}
                                />
                              </CCol>
                              <CCol md={6}>
                                <RFFCFormInput
                                  type="text"
                                  name="surname"
                                  label="Edit Last Name"
                                  disabled={formDisabled}
                                />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={12}>
                                <RFFCFormInput
                                  type="text"
                                  name="displayName"
                                  label="Edit Display Name"
                                  disabled={formDisabled}
                                />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput
                                  type="text"
                                  name="mailNickname"
                                  label="Edit Username"
                                  disabled={formDisabled}
                                />
                              </CCol>
                              <CCol md={6}>
                                {!domainsLoaded && domainsLoading && <CSpinner />}
                                {domainsLoaded && !domainsLoading && (
                                  <RFFCFormSelect
                                    // label="Domain"
                                    name="primDomain"
                                    disabled={formDisabled}
                                    placeholder={domainsLoaded ? 'Select domain' : 'Loading...'}
                                    values={domainsList.map((domain) => ({
                                      value: domain.id,
                                      label: domain.id,
                                    }))}
                                  />
                                )}
                                {!domainsLoaded && !domainsLoading && domainsError && (
                                  <span>Failed to load list of domains</span>
                                )}
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={12}>
                                <CFormLabel>Settings</CFormLabel>
                                <RFFCFormCheck
                                  disabled={formDisabled}
                                  name="Autopassword"
                                  label="Reset Password"
                                />
                                <RFFCFormCheck
                                  disabled={formDisabled}
                                  name="RequirePasswordChange"
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
                                  disabled={formDisabled}
                                  name="Usagelocation"
                                  placeholder="Type to search..."
                                  label="Usage Location"
                                />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={12}>
                                <RFFCFormSwitch
                                  name="keepLicenses"
                                  label="Keep current licenses"
                                  disabled={formDisabled}
                                />
                                <Condition when="keepLicenses" is={false}>
                                  <span>Licenses</span>
                                  <br />
                                  {licenseLoading && !licenseLoaded && <CSpinner />}
                                  {!licenseLoading && !licenseLoaded && licenseError && (
                                    <span>Error loading licenses</span>
                                  )}
                                  {licenseLoaded &&
                                    licenseList.map((license) => (
                                      <RFFCFormCheck
                                        disabled={formDisabled}
                                        key={license.id}
                                        name={`Licenses.${license.skuId}`}
                                        label={license.skuPartNumber}
                                      />
                                    ))}
                                </Condition>
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={12}>
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
                                  values={
                                    (!usersError &&
                                      usersLoaded &&
                                      usersList.map((user) => {
                                        // value, name
                                        return { value: user.id, name: user.displayName }
                                      })) ||
                                    []
                                  }
                                  placeholder={usersLoaded ? 'Select user' : 'Loading...'}
                                  name="CopyFrom"
                                />
                                {!usersLoaded && !usersLoading && usersError && (
                                  <span>Failed to load list of users</span>
                                )}
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CCol md={6}>
                                <CButton type="submit" disabled={submitting || formDisabled}>
                                  Edit User
                                </CButton>
                              </CCol>
                            </CRow>
                            {/*<CRow>*/}
                            {/*  <CCol>*/}
                            {/*    <pre>{JSON.stringify(values, null, 2)}</pre>*/}
                            {/*  </CCol>*/}
                            {/*</CRow>*/}
                          </CForm>
                        )
                      }}
                    />
                  )}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Account Information</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {!userLoaded && userLoading && <CSpinner />}
                  {userLoaded && !userLoading && (
                    <>
                      This is the (raw) information for this account.
                      <pre>{JSON.stringify(user, null, 2)}</pre>
                    </>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </CCard>
  )
}

export default EditUser
