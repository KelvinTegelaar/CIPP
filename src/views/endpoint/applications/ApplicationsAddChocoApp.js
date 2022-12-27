import React from 'react'
import {
  CCol,
  CRow,
  CForm,
  CListGroup,
  CListGroupItem,
  CCallout,
  CSpinner,
  CInputGroup,
  CFormInput,
  CButton,
} from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import {
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormRadio,
  RFFCFormSelect,
  RFFCFormSwitch,
} from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { OnChange } from 'react-final-form-listeners'
import { useRef } from 'react'

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

const ApplyStandard = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [searchPostRequest, foundPackages] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    genericPostRequest({ path: '/api/AddChocoApp', values: values })
  }
  const handleSearch = async ({ searchString, customRepo }) => {
    searchPostRequest({
      path: '/api/ListAppsRepository',
      values: { Search: searchString, Repository: customRepo },
    })
  }
  const formValues = {
    InstallAsSystem: true,
    DisableRestart: true,
    AssignTo: 'On',
  }
  const searchRef = useRef(null)
  const customRepoRef = useRef(null)

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
                let template = foundPackages.data.Results.filter(function (obj) {
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
      wizardTitle="Chocolatey App Wizard"
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
        description="Select which application to deploy."
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
                  onClick={() =>
                    handleSearch({
                      searchString: searchRef.current.value,
                      customRepo: customRepoRef.current.value,
                    })
                  }
                >
                  Search
                </CButton>
              </CInputGroup>
            </CCol>
            <CCol md={6}>
              <CFormInput
                className="me-2"
                name="customRepo"
                placeholder="Custom repository URL"
                aria-label="Custom repository URL"
                ref={customRepoRef}
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              {foundPackages.isFetching && <CSpinner className="me-3" />}
              {foundPackages.isSuccess && (
                <RFFCFormSelect
                  label="Package"
                  values={foundPackages?.data.Results.map((chocoPackage) => ({
                    value: chocoPackage.packagename,
                    label: `${chocoPackage.applicationName} - ${chocoPackage.packagename}`,
                  }))}
                  placeholder={!foundPackages.isFetching ? 'Select package' : 'Loading...'}
                  name="PackageSelector"
                />
              )}
            </CCol>
            <WhenFieldChanges field="PackageSelector" set="packagename" />
            <WhenFieldChanges field="PackageSelector" set="applicationName" />
            <WhenFieldChanges field="PackageSelector" set="description" />
            <WhenFieldChanges field="PackageSelector" set="customRepo" />
          </CRow>
          <hr></hr>
          <CRow>
            <CCol md={6}>
              <RFFCFormInput type="text" name="packagename" label="Chocolatey package name" />
            </CCol>
            <CCol md={6}>
              <RFFCFormInput type="text" name="applicationName" label="Application name" />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput type="text" name="description" label="Description" />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput type="text" name="customRepo" label="Custom repository URL" />
            </CCol>
          </CRow>
          Install options:
          <RFFCFormSwitch value={true} name="InstallAsSystem" label="Install as system" />
          <RFFCFormSwitch name="DisableRestart" label="Disable Restart" />
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
                          Custom Repo:
                          {props.values.customRepo ? props.values.customRepo : ' No'}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Install as System: {props.values.InstallAsSystem ? 'Yes' : 'No'}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Disable Restart: {props.values.DisableRestart ? 'Yes' : 'No'}
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

export default ApplyStandard
