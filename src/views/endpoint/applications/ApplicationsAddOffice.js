import React from 'react'
import { CCol, CRow, CForm, CListGroup, CListGroupItem, CCallout, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import { RFFCFormRadio, RFFCFormSwitch, RFFSelectSearch } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import langaugeList from 'src/data/languageList'

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

const AddOffice = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    genericPostRequest({ path: '/api/AddOfficeApp', values: values })
  }

  const formValues = {
    excludedApps: [
      { value: 'access', label: 'Access' },
      { value: 'lync', label: 'Skype for Business' },
      { value: 'bing', label: 'Bing' },
    ],
    updateChannel: { value: 'current', label: 'Current Channel' },
    arch: true,
    RemoveVersions: true,
    AcceptLicense: true,
  }

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Office App Wizard"
    >
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants to create the Office Deployment for."
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants" validate={requiredArray}>
          {(props) => (
            <WizardTableField
              reportName="Add-Office-App-Tenant-Selector"
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
        title="Select Office Settings"
        description="Select which options you want to apply to the office installation."
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Supply the app information</h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <CRow>
            <CCol md={6}>
              <RFFSelectSearch
                values={[
                  { value: 'access', name: 'Access' },
                  { value: 'excel', name: 'Excel' },
                  { value: 'oneNote', name: 'OneNote' },
                  { value: 'outlook', name: 'Outlook' },
                  { value: 'powerPoint', name: 'PowerPoint' },
                  { value: 'teams', name: 'Teams' },
                  { value: 'word', name: 'Word' },
                  { value: 'lync', name: 'Skype For Business' },
                  { value: 'bing', name: 'Bing' },
                ]}
                name="excludedApps"
                label="Excluded Apps"
                multi={true}
              />
            </CCol>
            <CCol md={6}>
              <RFFSelectSearch
                values={[
                  { value: 'current', name: 'Current Channel' },
                  { value: 'firstReleaseCurrent', name: 'Current (Preview)' },
                  { value: 'monthlyEnterprise', name: 'Monthly Enterprise' },
                  { value: 'deferred', name: 'Semi-Annual Enterprise' },
                  { value: 'firstReleaseDeferred', name: 'Semi-Annual Enterprise (Preview)' },
                ]}
                name="updateChannel"
                label="Update Channel"
              />
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={12}>
              <RFFSelectSearch
                values={langaugeList.map(({ language, tag }) => ({
                  value: tag,
                  name: language,
                }))}
                name="languages"
                multi={true}
                label="Languages"
              />
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <RFFCFormSwitch
              value={true}
              name="SharedComputerActivation"
              label="Use Shared Computer Activation"
            />

            <RFFCFormSwitch name="arch" label="64 Bit (Recommended)" />
            <RFFCFormSwitch name="RemoveVersions" label="Remove other versions" />
            <RFFCFormSwitch name="AcceptLicense" label="Accept License" />
          </CRow>
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
              /* eslint-disable react/prop-types */
              return (
                <>
                  <CRow>
                    <CCol md={3}></CCol>
                    <CCol md={6}>
                      <CListGroup flush>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Channel: {props.values.updateChannel.value}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          64-bit : {props.values.arch ? 'Yes' : ' No'}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Remove old versions: {props.values.RemoveVersions ? 'Yes' : 'No'}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Shared Computer Activation:{' '}
                          {props.values.SharedComputerActivation ? 'Yes' : 'No'}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Accept EULA: {props.values.AcceptLicense ? 'Yes' : 'No'}
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

export default AddOffice
