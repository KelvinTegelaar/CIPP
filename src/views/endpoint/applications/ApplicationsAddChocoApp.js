import React from 'react'
import { CAlert, CCard, CCol, CRow, CCardTitle, CCardHeader, CCardBody, CForm } from '@coreui/react'
import { Field } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
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
    // @todo: clean this up api sided so we don't need to perform weird tricks.
    var result = Object.keys(values.standards).filter(function (x) {
      if (values.standards[x] === false) {
        delete values.standards[x]
      }
    })

    const shippedTenants = values.selectedTenants.map(
      (tenant) =>
        (values.standards[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    //filter on only objects that are 'true'
    genericPostRequest({ url: 'api/AddStandardsDeploy', values: values.standards })
  }

  const formValues = {
    selectedTenants: [],
    standards: {},
  }

  return (
    <CCard className="col-8">
      <CCardHeader>
        <CCardTitle className="text-primary">Standards Wizard</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <CRow className="row justify-content-center">
          <CCol xxl={12}>
            <Wizard initialValues={{ ...formValues }} onSubmit={handleSubmit}>
              <Wizard.Page
                title="Tenant Choice"
                description="Choose the tenants to create the standard for."
              >
                <center>
                  <h3 className="text-primary">Step 1</h3>
                  <h5 className="card-title mb-4">Choose a tenant</h5>
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
                title="Select Standards"
                description="Select which standards you want to apply."
              >
                <center>
                  <h3 className="text-primary">Step 2</h3>
                  <h5 className="card-title mb-4">Supply the app information</h5>
                </center>
                <hr className="my-4" />
                <CForm onSubmit={handleSubmit}>
                  <CRow>
                    <CCol md={6}>
                      <RFFCFormInput type="text" name="givenName" label="Chocolatey package name" />
                    </CCol>
                    <CCol md={6}>
                      <RFFCFormInput type="text" name="surname" label="Application name" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={12}>
                      <RFFCFormInput type="text" name="displayName" label="Description" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={12}>
                      <RFFCFormInput
                        type="text"
                        name="mailNickname"
                        label="Custom repository URL"
                      />
                    </CCol>
                  </CRow>
                  <RFFCFormSwitch name="InstallAsSystem" label="Install as system" />
                  <RFFCFormRadio name="Assign" label="Do not assign"></RFFCFormRadio>
                  <RFFCFormRadio name="Assign" label="Assign to all users"></RFFCFormRadio>
                  <RFFCFormRadio name="Assign" label="Assign to all devices"></RFFCFormRadio>
                  <RFFCFormRadio
                    name="Assign"
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
                  <CAlert color="warning" className="d-flex align-items-center">
                    <FontAwesomeIcon color="warning" icon={faExclamationTriangle} size="2x" />
                    <center>
                      WARNING! Setting a standard will make changes to your tenants and set these
                      standards on every 365 tenant you select. If you want to review only, please
                      use the Best Practice Analyser.
                    </center>
                  </CAlert>
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
