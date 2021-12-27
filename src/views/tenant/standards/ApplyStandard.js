import React from 'react'
import { CAlert, CCard, CCol, CRow, CCardTitle, CCardHeader, CCardBody } from '@coreui/react'
import { Field } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import Wizard from '../../../components/Wizard'
import WizardTableField from '../../../components/WizardTableField'
import PropTypes from 'prop-types'
import { RFFCFormSwitch } from '../../../components/RFFComponents'
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
    alert(JSON.stringify({ tenants: values.selectedTenants, standards: values.standards }, null, 2))
    // @todo hook this up
    // genericPostRequest({
    // tenants: values.selectedTenants.defaultDomainName,
    // standards: values.standards,
    // })
  }

  const formValues = {
    selectedTenants: [],
    standards: {},
  }

  return (
    <CCard>
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
                  <h5 className="card-title mb-4">Select Standards</h5>
                </center>
                <hr className="my-4" />
                <div className="mb-2">
                  <RFFCFormSwitch name="standards.AuditLog" label="Enable the Unified Audit Log" />
                  <RFFCFormSwitch
                    name="standards.SecurityDefaults"
                    label="Enable Security Defaults"
                  />
                  <RFFCFormSwitch
                    name="standards.DelegateSentItems"
                    label="Set mailbox Sent Items delegation (Sent items for shared mailboxes)"
                  />
                  <RFFCFormSwitch
                    name="standards.OauthConsent"
                    label="Require admin consent for applications (Prevent OAuth phishing)"
                  />
                  <RFFCFormSwitch
                    name="standards.PasswordExpireDisabled"
                    label="Do not expire passwords"
                  />
                  <RFFCFormSwitch
                    name="standards.AnonReportDisable"
                    label="Enable Usernames instead of pseudo anonymised names in reports"
                  />
                  <RFFCFormSwitch
                    name="standards.SSPR"
                    label="Enable Self Service Password Reset"
                  />
                  <RFFCFormSwitch
                    name="standards.ModernAuth"
                    label="Enable Modern Authentication"
                  />
                  <RFFCFormSwitch
                    name="standards.DisableBasicAuth"
                    label="Disable Basic Authentication"
                  />
                  <RFFCFormSwitch
                    name="standards.DisableSharedMailbox"
                    label="Disable Shared Mailbox AAD accounts"
                  />
                  <RFFCFormSwitch
                    name="standards.AutoExpandArchive"
                    label="Enable Auto-expanding archives"
                  />
                  <RFFCFormSwitch
                    name="standards.SpoofWarn"
                    label="Enable Spoofing warnings for Outlook (This e-mail is external identifiers)"
                  />
                  <RFFCFormSwitch
                    name="standards.LegacyMFA"
                    label="Enable per-user MFA for all user"
                  />
                  <RFFCFormSwitch name="standards.UndoSSPR" label="Undo SSPR Standard" />
                  <RFFCFormSwitch name="standards.UndoOauth" label="Undo App Consent Standard" />
                </div>
                <hr className="my-4" />
              </Wizard.Page>
              <Wizard.Page title="Review and Confirm" description="Confirm the settings to apply">
                <center>
                  <h3 className="text-primary">Step 3</h3>
                  <h5 className="card-title mb-4">Confirm and apply</h5>
                </center>
                <hr className="my-4" />
                <CAlert color="warning" className="d-flex align-items-center">
                  <FontAwesomeIcon color="warning" icon={faExclamationTriangle} size="2x" />

                  <center>
                    WARNING! Setting a standard will make changes to your tenants and set these
                    standards on every 365 tenant you select. If you want to review only, please use
                    the Best Practice Analyser.
                  </center>
                </CAlert>
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
