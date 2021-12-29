import React from 'react'
import {
  CAlert,
  CCard,
  CCol,
  CRow,
  CCardTitle,
  CCardHeader,
  CCardBody,
  CForm,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import Wizard from '../../../components/Wizard'
import WizardTableField from '../../../components/WizardTableField'
import PropTypes from 'prop-types'
import {
  RFFCFormInput,
  RFFCFormRadio,
  RFFCFormSelect,
  RFFCFormSwitch,
  RFFCFormTextarea,
  RFFSelectSearch,
} from '../../../components/RFFComponents'
import { useListTenantsQuery } from '../../../store/api/tenants'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'

const Error = ({ name }) => (
  <Field
    name={name}
    subscription={{ touched: true, error: true }}
    render={({ meta: { touched, error } }) =>
      touched && error ? (
        <CAlert color="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} color="danger" />
          {error}
        </CAlert>
      ) : null
    }
  />
)

Error.propTypes = {
  name: PropTypes.string.isRequired,
}

const requiredArray = (value) => (value && value.length !== 0 ? undefined : 'Required')

const ApplyStandard = () => {
  const { data: tenants = [] } = useListTenantsQuery()
  const [intuneGetRequest, intuneTemplates] = useLazyGenericGetRequestQuery()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const dispatch = useDispatch()

  const handleSubmit = async (values) => {
    const shippedTenants = values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    genericPostRequest({ url: 'api/AddAutopilotConfig', values: values })
  }

  const handleSelect = async (GUID) => {
    //fill form
  }
  const formValues = {
    Assignto: true,
  }

  return (
    <CCard className="col-8">
      <CCardHeader>
        <CCardTitle className="text-primary">Add Intune policy</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <CRow className="row justify-content-center">
          <CCol xxl={12}>
            <Wizard initialValues={{ ...formValues }} onSubmit={handleSubmit}>
              <Wizard.Page
                title="Tenant Choice"
                description="Choose the tenants to create the ESP for."
              >
                <center>
                  <h3 className="text-primary">Step 1</h3>
                  <h5 className="card-title mb-4">Choose tenants</h5>
                </center>
                <hr className="my-4" />
                <Field name="selectedTenants" validate={requiredArray}>
                  {(props) => (
                    <WizardTableField
                      keyField="customerId"
                      data={tenants}
                      columns={[
                        {
                          dataField: 'displayName',
                          text: 'Tenant Name',
                        },
                        {
                          dataField: 'defaultDomainName',
                          text: 'Domain Name',
                        },
                      ]}
                      fieldProps={props}
                    />
                  )}
                </Field>
                <Error name="selectedTenants" />
                <hr className="my-4" />
              </Wizard.Page>
              <Wizard.Page
                title="Select Options"
                description="Select which options you want to apply."
              >
                <center>
                  <h3 className="text-primary">Step 2</h3>
                  <h5 className="card-title mb-4">
                    Enter the raw JSON for this policy. See{' '}
                    <a href="https://github.com/KelvinTegelaar/CIPP/blob/master/Documentation/DeployPolicy.md">
                      this
                    </a>{' '}
                    for more information.
                  </h5>
                </center>
                <hr className="my-4" />
                <CForm onSubmit={handleSubmit}>
                  <CRow>
                    <CCol md={12}>
                      {intuneTemplates.isUninitialized &&
                        intuneGetRequest({ url: 'api/ListIntuneTemplates' })}
                      {intuneTemplates.isSuccess && (
                        <RFFSelectSearch
                          values={intuneTemplates.data?.map((template) => ({
                            value: template.GUID,
                            name: template.Displayname,
                          }))}
                          name="TemplateList"
                          placeholder="Type to search..."
                          label="Please choose a template to apply, or enter the information manually."
                        />
                      )}
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol>
                      <RFFCFormSelect
                        name="TemplateType"
                        label="Select Policy Type"
                        placeholder="Select a template type"
                        values={[
                          { label: 'Administrative Template', value: 'Admin' },
                          { label: 'Settings Catalog', value: 'Catalog' },
                          { label: 'Custom Configuration', value: 'Device' },
                        ]}
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={12}>
                      <RFFCFormInput
                        type="text"
                        name="DisplayName"
                        label="Policy Display Name"
                        placeholder="Enter a name"
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={12}>
                      <RFFCFormInput
                        type="text"
                        name="Description"
                        label="Description"
                        placeholder="leave blank for none"
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={12}>
                      <RFFCFormTextarea
                        type="text"
                        name="Description"
                        label="Raw JSON"
                        placeholder="Enter RAW JSON information"
                      />
                    </CCol>
                  </CRow>
                  <RFFCFormRadio
                    value=""
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
              </Wizard.Page>
              <Wizard.Page title="Review and Confirm" description="Confirm the settings to apply">
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
                                  Display Name: {props.values.DisplayName}
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={props.values.DisplayName ? faCheckCircle : faTimesCircle}
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Naming template: {props.values.DeviceNameTemplate}
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={
                                      props.values.DeviceNameTemplate
                                        ? faCheckCircle
                                        : faTimesCircle
                                    }
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Self-Deploying
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={
                                      props.values.DeploymentMode ? faCheckCircle : faTimesCircle
                                    }
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Hide Terms
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={props.values.HideTerms ? faCheckCircle : faTimesCircle}
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Hide Privacy
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={props.values.HidePrivacy ? faCheckCircle : faTimesCircle}
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Convert to Autopilot device
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={props.values.CollectHash ? faCheckCircle : faTimesCircle}
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Standard Account
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={
                                      props.values.NotLocalAdmin ? faCheckCircle : faTimesCircle
                                    }
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Allow Whiteglove
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={
                                      props.values.allowWhiteglove ? faCheckCircle : faTimesCircle
                                    }
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Automatically setup keyboard
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={props.values.Autokeyboard ? faCheckCircle : faTimesCircle}
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Allow Whiteglove
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={
                                      props.values.HideChangeAccount ? faCheckCircle : faTimesCircle
                                    }
                                  />
                                </CListGroupItem>
                              </CListGroup>
                            </CCol>
                          </CRow>
                        </>
                      )
                    }}
                  </FormSpy>
                )}
                {postResults.isSuccess && (
                  <CAlert color="success">{postResults.data?.Results}</CAlert>
                )}
                <hr className="my-4" />
              </Wizard.Page>
            </Wizard>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default ApplyStandard
