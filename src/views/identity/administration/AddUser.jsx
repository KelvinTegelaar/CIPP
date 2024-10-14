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
  CCallout,
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
import { useListAdConnectSettingsQuery } from 'src/store/api/adconnect'
import { useListDomainsQuery } from 'src/store/api/domains'
import { useListLicensesQuery } from 'src/store/api/licenses'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { required } from 'src/validators'
import useQuery from 'src/hooks/useQuery'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import { OnChange } from 'react-final-form-listeners'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const AddUser = () => {
  const currentDate = new Date()
  const [startDate, setStartDate] = useState(currentDate)
  let navigate = useNavigate()
  const [addedAttributes, setAddedAttribute] = React.useState(0)
  const tenant = useSelector((state) => state.app.currentTenant)
  const { defaultDomainName: tenantDomain } = tenant
  let query = useQuery()
  const allQueryObj = {}
  for (const [key, value] of query.entries()) {
    allQueryObj[key] = value
  }
  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const {
    data: adconnectsettings = [],
    isFetching: adcIsFetching,
    error: adcError,
  } = useListAdConnectSettingsQuery({ tenantDomain })

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
    if (values.defaultAttributes) {
      //map default attributes to the addedAttributes array. If addedAttributes is not present, create it.
      values.addedAttributes = values.addedAttributes ? values.addedAttributes : []
      Object.keys(values.defaultAttributes).forEach((key) => {
        values.addedAttributes.push({ Key: key, Value: values.defaultAttributes[key].Value })
      })
    }
    const unixTime = Math.floor(startDate.getTime() / 1000)

    const shippedValues = {
      AddedAliases: values.addedAliases ? values.addedAliases : '',
      BusinessPhone: values.businessPhones,
      City: values.city,
      CompanyName: values.companyName,
      CopyFrom: values.CopyFrom ? values.CopyFrom.value : '',
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
      Usagelocation: values.usageLocation ? values.usageLocation.value : '',
      Username: values.mailNickname,
      streetAddress: values.streetAddress,
      Autopassword: !!values.Autopassword,
      MustChangePass: values.MustChangePass,
      tenantID: tenantDomain,
      addedAttributes: values.addedAttributes,
      setManager: values.setManager,
      Scheduled: values.Scheduled?.enabled ? { enabled: true, date: unixTime } : { enabled: false },
      PostExecution: values.Scheduled?.enabled
        ? { webhook: values.webhook, psa: values.psa, email: values.email }
        : '',
      ...values.license,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/AddUser', values: shippedValues })
  }
  const usagelocation = useSelector((state) => state.app.usageLocation)

  const copyUserVariables = (t) => {
    for (const [key, value] of Object.entries(t.value)) {
      query.delete(key)
      if (value != null) {
        query.append(key, value)
      }
      navigate(`?${query.toString()}`)
    }
  }

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const initialState = {
    Autopassword: false,
    usageLocation: usagelocation,
    ...allQueryObj,
  }
  const currentSettings = useSelector((state) => state.app)

  // Effect to update display name when first or last name changes
  useEffect(() => {
    setDisplayName(`${firstName} ${lastName}`)
  }, [firstName, lastName, displayName])

  return (
    <CippPage title="Add User">
      {postResults.isSuccess && (
        <CCallout color="success" dismissible>
          {postResults.data?.Results.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </CCallout>
      )}
      <CRow>
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Account Details</CCardTitle>
            </CCardHeader>
            <CCardBody>
              {adcError && <span>Unable to determine Azure AD Connect Settings</span>}
              {!adcIsFetching && adconnectsettings.dirSyncEnabled && (
                <CCallout color="warning">
                  Warning! {adconnectsettings.dirSyncEnabled} This tenant currently has Active
                  Directory Sync Enabled. This usually means users should be created in Active
                  Directory
                </CCallout>
              )}
              <Form
                initialValues={{ ...initialState }}
                onSubmit={onSubmit}
                render={({ form, handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <CRow>
                        <CCol md={6}>
                          <RFFCFormInput
                            type="text"
                            name="givenName"
                            label="First Name"
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </CCol>
                        <CCol md={6}>
                          <RFFCFormInput
                            type="text"
                            name="surname"
                            label="Last Name"
                            onChange={(e) => setLastName(e.target.value)}
                          />
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
                          <OnChange name="givenName">
                            {(value) => {
                              form.change('displayName', `${value} ${lastName}`)
                            }}
                          </OnChange>
                          <OnChange name="surname">
                            {(value) => {
                              form.change('displayName', `${firstName} ${value} `)
                            }}
                          </OnChange>
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
                          <RFFCFormCheck name="Autopassword" label="Create password manually" />
                          <Condition when="Autopassword" is={true}>
                            <CCol md={12}>
                              <RFFCFormInput type="password" name="password" label="Password" />
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
                      <CRow>
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
                          <RFFCFormInput name="city" label="City" type="text" />
                        </CCol>
                        <CCol md={6}>
                          <RFFCFormInput name="country" label="Country" type="text" />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol md={6}>
                          <RFFCFormInput name="companyName" label="Company Name" type="text" />
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
                          <RFFCFormInput name="businessPhones" label="Business #" type="text" />
                        </CCol>
                      </CRow>
                      <>
                        {currentSettings?.userSettingsDefaults?.defaultAttributes?.map(
                          (attribute, idx) => (
                            <CRow key={idx}>
                              <CCol>
                                <RFFCFormInput
                                  name={`defaultAttributes.${attribute.label}.Value`}
                                  label={attribute.label}
                                  type="text"
                                />
                              </CCol>
                            </CRow>
                          ),
                        )}
                        {addedAttributes > 0 &&
                          [...Array(addedAttributes)].map((e, i) => (
                            <CRow key={i}>
                              <CCol md={6}>
                                <RFFCFormInput
                                  name={`addedAttributes.${i}.Key`}
                                  label="Attribute Name"
                                  type="text"
                                />
                              </CCol>
                              <CCol md={6}>
                                <RFFCFormInput
                                  name={`addedAttributes.${i}.Value`}
                                  label="Attribute Value"
                                  type="text"
                                />
                              </CCol>
                            </CRow>
                          ))}
                      </>
                      <CRow>
                        <CCol className="mb-3" md={12}>
                          {addedAttributes > 0 && (
                            <CButton
                              onClick={() => setAddedAttribute(addedAttributes - 1)}
                              className={`circular-button`}
                              title={'-'}
                            >
                              <FontAwesomeIcon icon={'minus'} />
                            </CButton>
                          )}
                          <CButton
                            onClick={() => setAddedAttribute(addedAttributes + 1)}
                            className={`circular-button`}
                            title={'+'}
                          >
                            <FontAwesomeIcon icon={'plus'} />
                          </CButton>
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={12}>
                          <RFFSelectSearch
                            label="Set Manager"
                            values={users?.map((user) => ({
                              value: user.id,
                              name: user.displayName,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="setManager"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                        <CCol md={12}>
                          <RFFSelectSearch
                            label="Copy group membership from other user"
                            values={users?.map((user) => ({
                              value: user.mail,
                              name: `${user.displayName} <${user.userPrincipalName}>`,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="CopyFrom"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                        <CCol className="m-3">
                          <RFFCFormSwitch name="Scheduled.enabled" label="Schedule user creation" />
                        </CCol>
                      </CRow>
                      <CRow>
                        <Condition when="Scheduled.enabled" is={true}>
                          <CCol>
                            <label>Scheduled creation Date</label>
                            <DatePicker
                              className="form-control mb-3"
                              selected={startDate}
                              showTimeSelect
                              timeFormat="HH:mm"
                              timeIntervals={15}
                              dateFormat="Pp"
                              onChange={(date) => setStartDate(date)}
                            />
                          </CCol>
                          <CRow>
                            <CCol>
                              <label>Send results to</label>
                              <RFFCFormSwitch name="webhook" label="Webhook" />
                              <RFFCFormSwitch name="email" label="E-mail" />
                              <RFFCFormSwitch name="psa" label="PSA" />
                            </CCol>
                          </CRow>
                        </Condition>
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
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Copy properties</CCardTitle>
            </CCardHeader>
            <CCardBody>
              Use this option to copy the properties from another user, this will only copy the
              visible fields as a template.
              <Select
                className="react-select-container me-3"
                classNamePrefix="react-select"
                options={users?.map((user) => ({
                  value: user,
                  label: `${user.displayName} <${user.userPrincipalName}>`,
                }))}
                isClearable={true}
                name="usageLocation"
                placeholder="Type to search..."
                label="Copy properties from other user"
                onChange={(value) => copyUserVariables(value)}
              />
              {usersError && <span>Failed to load list of users</span>}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CippPage>
  )
}

export default AddUser
