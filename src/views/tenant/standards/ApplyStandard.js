import React from 'react'
import { CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import { RFFCFormSwitch, Condition, RFFCFormInput, RFFCFormSelect } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'

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

const ApplyStandard = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    // @todo: clean this up api sided so we don't need to perform weird tricks.
    Object.keys(values.standards).filter(function (x) {
      if (values.standards[x] === false) {
        delete values.standards[x]
      }
      return null
    })

    values.selectedTenants.map(
      (tenant) =>
        (values.standards[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    //filter on only objects that are 'true'
    genericPostRequest({ path: '/api/AddStandardsDeploy', values: values.standards })
  }

  const formValues = {
    selectedTenants: [],
    standards: {},
  }

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Standards Wizard"
    >
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants to create the standard for."
      >
        <CCallout color="danger">
          Ensure you read{' '}
          <a href="https://cipp.app/docs/user/usingcipp/tenantadministration/standards/#meet-the-standards">
            the documentation fully
          </a>{' '}
          before proceeding with this wizard. Some of the changes cannot be reverted by CIPP.
        </CCallout>
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants">
          {(props) => (
            <WizardTableField
              reportName="Apply-Standard-Tenant-Selector"
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
        title="Global Standards"
        description="Select which standards you want to apply."
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Select Standards</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow className="mb-3">
            <CCol md={6}>
              <RFFCFormSwitch
                name="standards.MailContacts.GeneralContact.Enabled"
                label="Set General Contact e-mail"
              />
              <Condition when="standards.MailContacts.GeneralContact.Enabled" is={true}>
                <RFFCFormInput
                  type="text"
                  name="standards.MailContacts.GeneralContact.Mail"
                  label="General Contact"
                />
              </Condition>
              <RFFCFormSwitch
                name="standards.MailContacts.SecurityContact.Enabled"
                label="Set Security Contact e-mail"
              />
              <Condition when="standards.MailContacts.SecurityContact.Enabled" is={true}>
                <RFFCFormInput
                  type="text"
                  name="standards.MailContacts.SecurityContact.Mail"
                  label="Security Contact"
                />
              </Condition>
              <RFFCFormSwitch
                name="standards.MailContacts.MarketingContact.Enabled"
                label="Set Marketing Contact e-mail"
              />
              <Condition when="standards.MailContacts.MarketingContact.Enabled" is={true}>
                <RFFCFormInput
                  type="text"
                  name="standards.MailContacts.MarketingContact.Mail"
                  label="Marketing Contact"
                />
              </Condition>
              <RFFCFormSwitch
                name="standards.MailContacts.TechContact.Enabled"
                label="Set Technical Contact e-mail"
              />
              <Condition when="standards.MailContacts.TechContact.Enabled" is={true}>
                <RFFCFormInput
                  type="text"
                  name="standards.MailContacts.TechContact.Mail"
                  label="Technical Contact"
                />
              </Condition>
            </CCol>
            <CCol md={6}>
              <RFFCFormSwitch name="standards.AuditLog" label="Enable the Unified Audit Log" />
              <RFFCFormSwitch
                name="standards.AnonReportDisable"
                label="Enable Usernames instead of pseudo anonymised names in reports"
              />

              <RFFCFormSwitch name="standards.ModernAuth" label="Enable Modern Authentication" />
              <RFFCFormSwitch
                name="standards.DisableBasicAuth"
                label="Disable Basic Authentication"
              />
            </CCol>
          </CRow>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Azure AD Standards"
        description="Select which standards you want to apply."
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Select Standards</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow className="mb-3">
            <CCol md={6}>
              <RFFCFormSwitch
                name="standards.PWnumberMatchingRequiredState"
                label="Enable Passwordless with Number Matching"
              />
              <RFFCFormSwitch
                name="standards.PWdisplayAppInformationRequiredState"
                label="Enable Passwordless with Location information and Number Matching"
              />
              <RFFCFormSwitch name="standards.TAP" label="Enable Temporary Access Passwords" />

              <RFFCFormSwitch name="standards.SecurityDefaults" label="Enable Security Defaults" />
              <RFFCFormSwitch
                name="standards.PasswordExpireDisabled"
                label="Do not expire passwords"
              />
              <RFFCFormSwitch name="standards.SSPR" label="Enable Self Service Password Reset" />
            </CCol>
            <CCol md={6}>
              <RFFCFormSwitch
                name="standards.OauthConsent.Enabled"
                label="Require admin consent for applications (Prevent OAuth phishing.)"
              />
              <Condition when="standards.OauthConsent.Enabled" is={true}>
                <RFFCFormInput
                  type="text"
                  name="standards.OauthConsent.AllowedApps"
                  label="Allowed application IDs, comma separated"
                />
              </Condition>
              <RFFCFormSwitch
                name="standards.AzurePortal"
                label="Disable Azure Portal access for Standard users"
              />
              <RFFCFormSwitch
                name="standards.LegacyMFA"
                label="Enable per-user MFA for all user (Legacy)"
              />

              <RFFCFormSwitch
                name="standards.DisableSelfServiceLicenses"
                label="Disable Self Service Licensing"
              />

              <RFFCFormSwitch name="standards.UndoSSPR" label="Undo SSPR Standard" />
              <RFFCFormSwitch name="standards.UndoOauth" label="Undo App Consent Standard" />
            </CCol>
          </CRow>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Exchange Standards"
        description="Select which standards you want to apply."
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Select Standards</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow className="mb-3">
            <CCol md={6}>
              <RFFCFormSwitch
                name="standards.DisableSharedMailbox"
                label="Disable Shared Mailbox AAD accounts"
              />
              <RFFCFormSwitch
                name="standards.DelegateSentItems"
                label="Set mailbox Sent Items delegation (Sent items for shared mailboxes)"
              />
              <RFFCFormSwitch
                name="standards.SendFromAlias"
                label="Allow users to send from their alias addresses"
              />
            </CCol>
            <CCol md={6}>
              <RFFCFormSwitch
                name="standards.AutoExpandArchive"
                label="Enable Auto-expanding archives"
              />
              <RFFCFormSwitch
                name="standards.SpoofWarn"
                label="Enable Spoofing warnings for Outlook (This e-mail is external identifiers)"
              />

              <RFFCFormSwitch
                name="standards.DisableViva"
                label="Disable daily Insight/Viva reports"
              />
            </CCol>
          </CRow>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Sharepoint Standards"
        description="Select which standards you want to apply."
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Select Standards</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow className="mb-3">
            <CCol md={6}>
              <RFFCFormSwitch
                name="standards.ActivityBasedTimeout"
                label="Enable 1 hour Activity based Timeout"
              />
              <RFFCFormSwitch
                name="standards.sharingCapability.Enabled"
                label="Set Sharing Level for OneDrive and Sharepoint"
              />
              <Condition when="standards.sharingCapability.Enabled" is={true}>
                <RFFCFormSelect
                  label="Select Sharing Level"
                  name="standards.sharingCapability.Level"
                  values={[
                    {
                      label:
                        'Users can share only with people in the organization. No external sharing is allowed.',
                      value: 'disabled',
                    },
                    {
                      label:
                        'Users can share with new and existing guests. Guests must sign in or provide a verification code.',
                      value: 'externalUserSharingOnly',
                    },
                    {
                      label:
                        'Users can share with anyone by using links that do not require sign-in.',
                      value: 'externalUserAndGuestSharing',
                    },
                    {
                      label:
                        'Users can share with existing guests (those already in the directory of the organization).',
                      value: 'existingExternalUserSharingOnly',
                    },
                  ]}
                />
              </Condition>
              <RFFCFormSwitch
                name="standards.ExcludedfileExt.Enabled"
                label="Exclude File Extensions from Syncing"
              />
              <Condition when="standards.ExcludedfileExt.Enabled" is={true}>
                <RFFCFormInput
                  type="text"
                  name="standards.ExcludedfileExt.ext"
                  label="Extensions, Comma separated"
                />
              </Condition>
              <RFFCFormSwitch
                name="standards.disableMacSync"
                label="Do not allow Mac devices to sync using OneDrive"
              />
            </CCol>
            <CCol md={6}>
              <RFFCFormSwitch
                name="standards.DisableReshare"
                label="Disable Resharing by External Users"
              />
              <RFFCFormSwitch
                name="standards.DeletedUserRentention"
                label="Retain a deleted user OneDrive for 1 year"
              />
              <RFFCFormSwitch
                name="standards.DisableUserSiteCreate"
                label="Disable site creation by standard users"
              />
              <RFFCFormSwitch
                name="standards.unmanagedSync"
                label="Only allow users to sync OneDrive from AAD joined devices"
              />
            </CCol>
          </CRow>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 4</h3>
          <h5 className="card-title mb-4">Confirm and apply</h5>
        </center>
        <hr className="my-4" />
        {!postResults.isSuccess && (
          <CCallout color="warning" className="d-flex align-items-center">
            <FontAwesomeIcon color="warning" icon={faExclamationTriangle} size="2x" />
            <center>
              WARNING! Setting a standard will make changes to your tenants and set these standards
              on every 365 tenant you select. If you want to review only, please use the Best
              Practice Analyser.
            </center>
          </CCallout>
        )}
        {postResults.isFetching && (
          <CCallout color="info">
            <CSpinner>Loading</CSpinner>
          </CCallout>
        )}
        {!postResults.isSuccess && (
          <FormSpy>
            {(props) => (
              /* eslint-disable react/prop-types */ <>
                <CRow>
                  <CCol md={{ span: 6, offset: 3 }}>
                    <h5 className="mb-0">Selected Tenants</h5>
                    <CCallout color="info">
                      {props.values.selectedTenants.map((tenant, idx) => (
                        <li key={idx}>
                          {tenant.displayName}- {tenant.defaultDomainName}
                        </li>
                      ))}
                    </CCallout>
                    <h5 className="mb-0">Selected Standards</h5>
                    <CCallout color="info">
                      {Object.entries(props.values.standards).map(([key, value], idx) => (
                        <li key={idx}>
                          {key}: {value ? 'Enabled' : 'Disabled'}
                        </li>
                      ))}
                    </CCallout>
                    <hr />
                  </CCol>
                </CRow>
              </>
            )}
          </FormSpy>
        )}
        {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default ApplyStandard
