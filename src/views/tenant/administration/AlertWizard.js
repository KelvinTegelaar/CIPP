import React from 'react'
import { CCol, CRow, CForm, CListGroup, CListGroupItem, CCallout, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import { Condition, RFFCFormSelect, RFFCFormSwitch, RFFSelectSearch } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import countryList from 'src/data/countryList.json'
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

const AlertWizard = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    Object.keys(values).filter(function (x) {
      if (values[x] === null) {
        delete values[x]
      }
      return null
    })
    values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    genericPostRequest({ path: '/api/AddAlert', values: values })
  }

  const formValues = {}

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Tenant Alerting Wizard"
    >
      <CippWizard.Page title="Tenant Choice" description="Choose the tenants to send alerts for">
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
      <CippWizard.Page title="Select Alerts" description="Select which alerts you want to receive.">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Select alerts to receive</h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <p>
            Alerts setup on this page will be sent to webhook configured in CIPPs settings, and be
            delivered as messages
          </p>
          <RFFCFormSwitch
            value={true}
            name="SetAlerts"
            label="Setup alerts for the selected tenants"
          />
          <CRow>
            <Condition when="SetAlerts" is={true}>
              <CCol>
                <RFFCFormSwitch
                  value={true}
                  name="MFAAlertUsers"
                  label="Alert on users without any form of MFA"
                />
                <RFFCFormSwitch name="MFAAdmins" label="Alert on admins without any form of MFA" />
                <RFFCFormSwitch
                  name="NoCAConfig"
                  label="Alert on tenants without a Conditional Access policy, while having Conditional Access licensing available."
                />
                <RFFCFormSwitch name="NewRole" label="Alert on new users added to any admin role" />
                <RFFCFormSwitch name="AdminPassword" label="Alert on changed admin Passwords" />
                <RFFCFormSwitch
                  name="DefenderStatus"
                  label="Alert if Defender is not running (Tenant must be on-boarded in Lighthouse)"
                />
                <RFFCFormSwitch
                  name="DefenderMalware"
                  label="Alert on Defender Malware found  (Tenant must be on-boarded in Lighthouse)"
                />
                <RFFCFormSwitch name="QuotaUsed" label="Alert on 90% mailbox quota used" />
              </CCol>
              <CCol>
                <RFFCFormSwitch name="SharePointQuota" label="Alert on 90% SharePoint quota used" />
                <RFFCFormSwitch name="UnusedLicenses" label="Alert on unused licenses" />
                <RFFCFormSwitch name="OverusedLicenses" label="Alert on overused licenses" />
                <RFFCFormSwitch
                  name="ExpiringLicenses"
                  label="Alert on licenses expiring in 30 days"
                />

                <RFFCFormSwitch
                  name="AppSecretExpiry"
                  label="Alert on expiring application secrets"
                />
                <RFFCFormSwitch name="ApnCertExpiry" label="Alert on expiring APN certificates" />
                <RFFCFormSwitch name="VppTokenExpiry" label="Alert on expiring VPP tokens" />
                <RFFCFormSwitch name="DepTokenExpiry" label="Alert on expiring DEP tokens" />
                <RFFCFormSwitch
                  name="SecDefaultsUpsell"
                  label="Alert on Security Defaults automatic enablement"
                />
                <RFFCFormSwitch name="NewTenant" label="Alert on New Tenants being added." />
              </CCol>
            </Condition>
          </CRow>
        </CForm>

        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Select Webhook Alerts"
        description="Select which alerts you want to receive."
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Select webhook alerts</h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <p>
            These alerts are received directly from the audit log, and will be processed as soon as
            Microsoft sends them to CIPP. These alerts generate a ticket, email or webhook message
            per alert, with more information about the alert.
          </p>

          <p>
            "Alerts setup on this page will be sent to the webhook configured in CIPPs settings, and
            be delivered as raw json information. Warning: Teams, Slack, and Discord do not support
            receiving raw json messages"
          </p>
          <CRow>
            <CCol>
              <RFFSelectSearch
                name="EventTypes"
                label="Select the environments you want to receive alerts for"
                multi
                values={[
                  { name: 'Exchange', value: 'Audit.Exchange' },
                  { name: 'Azure AD', value: 'Audit.AzureActiveDirectory' },
                ]}
              />
            </CCol>
            <CCol>
              <RFFSelectSearch
                name="Operations"
                label="Select the operations you want to receive alerts for"
                multi
                values={[
                  { value: 'New-InboxRule', name: 'New Inbox Rules' },
                  { value: 'Set-Inboxrule', name: 'Set Inbox Rules' },
                  { value: 'Add member to role.', name: 'Adding a member to any admin role' },
                  {
                    value: 'Remove Member from a role.',
                    name: 'Removing a member from any admin role',
                  },

                  { value: 'Disable account.', name: 'Disabling any account' },
                  { value: 'Enable account.', name: 'Enabling any account' },
                  {
                    value: 'Update StsRefreshTokenValidFrom Timestamp.',
                    name: 'Revoking a users sessions.',
                  },
                  {
                    value: 'Disable Strong Authentication.',
                    name: 'MFA has been disabled.',
                  },
                  { value: 'Reset user password.', name: 'Reset user password' },
                  { value: 'AdminLoggedIn', name: 'Admin has logged in' },
                  {
                    value: 'UserLoggedInFromUnknownLocation',
                    name: 'A user has logged in from non-allowed location',
                  },
                  {
                    value: 'Add service principal.',
                    name: 'Enterprise App Added',
                  },
                  {
                    value: 'Remove service principal.',
                    name: 'Enterprise App Removed',
                  },
                ]}
              />
            </CCol>
            <CCol>
              <RFFSelectSearch
                name="AllowedLocations"
                label="Select the countries to not alert on logon from"
                multi
                values={countryList.map(({ Code, Name }) => ({
                  value: Code,
                  name: Name,
                }))}
              />
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
                          Alert on users without any form of MFA
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.MFAAlertUsers ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on admins without any form of MFA
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.MFAAdmins ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on new users added to any admin role
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.NewRole ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on changed admin Passwords
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.AdminPassword ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert if Defender is not running
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.DefenderStatus ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on Defender Malware
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.DefenderMalware ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on 90% mailbox quota used
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.QuotaUsed ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on unused licenses
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.UnusedLicenses ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on overused licenses
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.OverusedLicenses ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on expiring application secrets
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.AppSecretExpiry ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on expiring APN certificates
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.ApnCertExpiry ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on expiring VPP tokens
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.VppTokenExpiry ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on expiring DEP tokens
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.DepTokenExpiry ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on no CA policies
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.NoCAConfig ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on Security Defaults automatic enablement
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.SecDefaultsUpsell ? faCheck : faTimes}
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
        {postResults.isFetching && (
          <CCallout color="info">
            <CSpinner>Loading</CSpinner>
          </CCallout>
        )}
        {postResults.isSuccess && (
          <CCallout color="success">
            {postResults.data.Results.map((message, idx) => {
              return <li key={idx}>{message}</li>
            })}
          </CCallout>
        )}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default AlertWizard
