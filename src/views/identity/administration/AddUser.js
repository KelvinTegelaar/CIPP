import React, { useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import TenantSelector from '../../../components/cipp/TenantSelector'
import { listDomains, listLicenses, listUsers } from '../../../store/modules/identity'
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
  const identity = useSelector((state) => state.identity) || {}
  const app = useSelector((state) => state.app) ?? {}
  const { currentTenant = {} } = app
  const {
    licenses: {
      list: licenseList = [],
      loading: licenseLoading,
      loaded: licenseLoaded,
      error: licenseError,
    } = {},
    domains: {
      list: domainsList = [],
      loading: domainsLoading,
      loaded: domainsLoaded,
      error: domainsError,
    } = {},
    users: { list: usersList = [], loading: usersLoading, loaded: usersLoaded, error: usersError },
  } = identity

  const action = () => {
    dispatch(listLicenses({ tenantDomain: currentTenant.defaultDomainName }))
    dispatch(listDomains({ tenantDomain: currentTenant.defaultDomainName }))
    dispatch(listUsers({ tenantDomain: currentTenant.defaultDomainName }))
  }

  const onSubmit = async (values) => {
    // eslint-disable-next-line no-undef
    // @todo bind this
    window.alert(JSON.stringify(values, 0, 2))
  }

  const initialValues = {
    License: false,
    Autopassword: false,
    mustChangePass: false,
  }

  useEffect(() => {
    async function load() {
      if (currentTenant.defaultDomainName) {
        dispatch(listLicenses({ tenantDomain: currentTenant.defaultDomainName }))
        dispatch(listDomains({ tenantDomain: currentTenant.defaultDomainName }))
        dispatch(listUsers({ tenant: currentTenant }))
      }
    }
    load()
  }, [currentTenant, dispatch])

  return (
    <div>
      <TenantSelector action={action} />
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
                          placeholder={domainsLoaded ? 'Select domain' : 'Loading...'}
                          values={domainsList.map((domain) => ({
                            value: domain.id,
                            label: domain.id,
                          }))}
                          validate={required}
                        />
                        {!domainsLoaded && !domainsLoading && domainsError && (
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
                        {licenseLoading && !licenseLoaded && <CSpinner />}
                        {!licenseLoading && !licenseLoaded && licenseError && (
                          <span>Error loading licenses</span>
                        )}
                        {licenseLoaded &&
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
