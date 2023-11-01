import React from 'react'
import {
  CCol,
  CRow,
  CForm,
  CListGroup,
  CListGroupItem,
  CCallout,
  CSpinner,
  CButton,
  CInputGroup,
  CFormInput,
} from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import {
  Condition,
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormRadio,
  RFFCFormSelect,
  RFFCFormSwitch,
} from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useRef } from 'react'
import { OnChange } from 'react-final-form-listeners'

const Error = ({ name }) => (
  <Field
    name={name}
    subscription={{ touched: true, error: true }}
    render={({ meta: { touched, error } }) =>
      touched && error ? (
        <CCallout color="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} color="danger" />
          {error}
        </CCallout>
      ) : null
    }
  />
)

Error.propTypes = {
  name: PropTypes.string.isRequired,
}

const requiredArray = (value) => (value && value.length !== 0 ? undefined : 'Required')

const AddWinGet = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [searchPostRequest, foundPackages] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    if (values.AssignTo === 'customGroup') {
      values.AssignTo = values.customGroup
    }
    values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    genericPostRequest({ path: '/api/AddWinGetApp', values: values })
  }
  const handleSearch = async (values) => {
    searchPostRequest({
      path: '/api/ListPotentialApps',
      values: { type: 'WinGet', searchString: values },
    })
  }
  const searchRef = useRef(null)

  const packageIdRef = useRef(null)
  const packageNameRef = useRef(null)

  const formValues = {
    InstallAsSystem: true,
    DisableRestart: true,
    AssignTo: 'On',
  }
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
                let template = foundPackages.data.filter(function (obj) {
                  console.log(value)
                  return obj.packagename === value
                })
                console.log(template[0])
                onChange(template[0][set])
              }}
            </OnChange>
          )}
        </FormSpy>
      )}
    </Field>
  )

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Add WinGet App"
    >
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants to create the application for."
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants" validate={requiredArray}>
          {(props) => (
            <WizardTableField
              reportName="Add-Choco-App-Tenant-Selector"
              keyField="defaultDomainName"
              path="/api/ListTenants?AllTenantSelector=true"
              columns={[
                {
                  name: 'Display Name',
                  selector: (row) => row['displayName'],
                  sortable: true,
                  exportselector: 'displayName',
                },
                {
                  name: 'Default Domain Name',
                  selector: (row) => row['defaultDomainName'],
                  sortable: true,
                  exportselector: 'mail',
                },
              ]}
              fieldProps={props}
            />
          )}
        </Field>
        <Error name="selectedTenants" />
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Select Application Settings"
        description="Select which application to deploy"
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Supply the app information</h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <CRow>
            <CCol md={6}>
              <CInputGroup className="me-2">
                <CFormInput
                  placeholder="Search Packages"
                  aria-label="Search Packages"
                  ref={searchRef}
                />
                <CButton
                  size="sm"
                  name="SearchNow"
                  onClick={() => handleSearch(searchRef.current.value)}
                >
                  Search
                </CButton>
              </CInputGroup>
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              {foundPackages.isFetching && <CSpinner className="me-3" />}
              {foundPackages.isSuccess && (
                <RFFCFormSelect
                  label="Package"
                  values={foundPackages?.data.map((packagename) => ({
                    value: packagename.packagename,
                    label: `${packagename.applicationName} - ${packagename.packagename}`,
                  }))}
                  placeholder={!foundPackages.isFetching ? 'Select package' : 'Loading...'}
                  name="PackageSelector"
                />
              )}
            </CCol>
            <WhenFieldChanges field="PackageSelector" set="packagename" />
            <WhenFieldChanges field="PackageSelector" set="applicationName" />
          </CRow>
          <hr></hr>
          <CRow>
            <CCol md={6}>
              <RFFCFormInput
                innerRef={packageIdRef}
                type="text"
                name="packagename"
                label="WinGet package identifier"
                value="test"
              />
            </CCol>
            <CCol md={6}>
              <RFFCFormInput
                innerRef={packageNameRef}
                type="text"
                name="applicationName"
                label="Application name"
                value="test"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput type="text" name="description" label="Description" />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              Install options:
              <RFFCFormCheck name="InstallationIntent" label="Mark for Uninstallation" />
              <RFFCFormRadio
                value="On"
                name="AssignTo"
                label="Do not assign"
                validate={false}
              ></RFFCFormRadio>
              <RFFCFormRadio
                value="allLicensedUsers"
                name="AssignTo"
                label="Assign to all users"
                validate={false}
              ></RFFCFormRadio>
              <RFFCFormRadio
                value="AllDevices"
                name="AssignTo"
                label="Assign to all devices"
                validate={false}
              ></RFFCFormRadio>
              <RFFCFormRadio
                value="AllDevicesAndUsers"
                name="AssignTo"
                label="Assign to all users and devices"
              ></RFFCFormRadio>
              <RFFCFormRadio
                value="customGroup"
                name="AssignTo"
                label="Assign to Custom Group"
              ></RFFCFormRadio>
              <Condition when="AssignTo" is="customGroup">
                <RFFCFormInput
                  type="text"
                  name="customGroup"
                  label="Custom Group Names separated by comma. Wildcards (*) are allowed"
                />
              </Condition>
            </CCol>
          </CRow>
        </CForm>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Confirm and apply</h5>
        </center>
        <hr className="my-4" />
        {!postResults.isSuccess && (
          <FormSpy>
            {(props) => {
              return (
                <>
                  <CRow>
                    <CCol md={3}></CCol>
                    <CCol md={6}>
                      <CListGroup flush>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Chocolatey Package: {props.values.packagename}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Application name: {props.values.applicationName}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Description: {props.values.description}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Assign to: {props.values.AssignTo}
                        </CListGroupItem>
                      </CListGroup>
                    </CCol>
                  </CRow>
                </>
              )
            }}
          </FormSpy>
        )}
        {postResults.isFetching && (
          <CCallout color="info">
            <CSpinner>Loading</CSpinner>
          </CCallout>
        )}
        {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default AddWinGet
