import React from 'react'
import { CCallout, CSpinner } from '@coreui/react'
import { Field } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import { RFFCFormSwitch } from 'src/components/forms'
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
          <RFFCFormSwitch name="standards.SecurityDefaults" label="Enable Security Defaults" />
          <RFFCFormSwitch
            name="standards.DelegateSentItems"
            label="Set mailbox Sent Items delegation (Sent items for shared mailboxes)"
          />
          <RFFCFormSwitch
            name="standards.OauthConsent"
            label="Require admin consent for applications (Prevent OAuth phishing)"
          />
          <RFFCFormSwitch name="standards.PasswordExpireDisabled" label="Do not expire passwords" />
          <RFFCFormSwitch
            name="standards.AnonReportDisable"
            label="Enable Usernames instead of pseudo anonymised names in reports"
          />
          <RFFCFormSwitch name="standards.SSPR" label="Enable Self Service Password Reset" />
          <RFFCFormSwitch name="standards.ModernAuth" label="Enable Modern Authentication" />
          <RFFCFormSwitch name="standards.DisableBasicAuth" label="Disable Basic Authentication" />
          <RFFCFormSwitch
            name="standards.DisableSharedMailbox"
            label="Disable Shared Mailbox AAD accounts"
          />
          <RFFCFormSwitch
            name="standards.DisableSelfServiceLicenses"
            label="Disable Self Service Licensing"
          />
          <RFFCFormSwitch
            name="standards.AutoExpandArchive"
            label="Enable Auto-expanding archives"
          />
          <RFFCFormSwitch
            name="standards.SpoofWarn"
            label="Enable Spoofing warnings for Outlook (This e-mail is external identifiers)"
          />
          <RFFCFormSwitch name="standards.LegacyMFA" label="Enable per-user MFA for all user" />
          <RFFCFormSwitch name="standards.UndoSSPR" label="Undo SSPR Standard" />
          <RFFCFormSwitch name="standards.UndoOauth" label="Undo App Consent Standard" />
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 3</h3>
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
        {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default ApplyStandard
