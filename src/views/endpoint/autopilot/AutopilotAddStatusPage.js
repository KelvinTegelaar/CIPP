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
import { RFFCFormInput, RFFCFormRadio, RFFCFormSwitch } from '../../../components/RFFComponents'
import { useListTenantsQuery } from '../../../store/api/tenants'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'

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
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const dispatch = useDispatch()

  const handleSubmit = async (values) => {
    const shippedTenants = values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    genericPostRequest({ url: 'api/AddEnrollment', values: values })
  }

  const formValues = {
    InstallAsSystem: true,
    DisableRestart: true,
  }

  return (
    <CCard className="col-8">
      <CCardHeader>
        <CCardTitle className="text-primary">Autopilot Enrollment Status Page Wizard</CCardTitle>
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
                  <h5 className="card-title mb-4">Supply the ESP Information</h5>
                </center>
                <hr className="my-4" />
                <CForm onSubmit={handleSubmit}>
                  <CRow>
                    <CCol md={2}>
                      <RFFCFormInput
                        type="text"
                        name="TimeOutInMinutes"
                        label="Timeout in minutes"
                        placeholder="60"
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={12}>
                      <RFFCFormInput
                        type="text"
                        name="ErrorMessage"
                        label="Custom Error Message"
                        placeholder="leave blank to not set."
                      />
                    </CCol>
                  </CRow>
                  <RFFCFormSwitch value={true} name="ShowProgress" label="Show progress to users" />
                  <RFFCFormSwitch value={true} name="EnableLog" label="Turn on log collection" />
                  <RFFCFormSwitch
                    value={true}
                    name="OBEEOnly"
                    label="Show status page only with OOBE setup"
                  />
                  <RFFCFormSwitch
                    value={true}
                    name="blockDevice"
                    label="Block device usage during setup"
                  />
                  <RFFCFormSwitch value={true} name="Allowretry" label="Allow retry" />
                  <RFFCFormSwitch value={true} name="AllowReset" label="Allow reset" />
                  <RFFCFormSwitch
                    value={true}
                    name="AllowFail"
                    label="Allow users to use device if setup fails"
                  />
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
