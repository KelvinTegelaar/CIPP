import React from 'react'
import { CButton, CCallout, CCol, CForm, CRow, CSpinner } from '@coreui/react'
import { Form } from 'react-final-form'
import { Condition, RFFCFormInput, RFFCFormSelect, RFFCFormSwitch } from 'src/components/forms'
import {
  useGenericGetRequestQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app'
import { faCheck, faCircleNotch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippContentCard, CippPage } from 'src/components/layout'
import { useSelector } from 'react-redux'
import { ModalService } from 'src/components/utilities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Skeleton from 'react-loading-skeleton'
import { CippTable } from 'src/components/tables'

const RefreshAction = () => {
  const [execStandards, execStandardsResults] = useLazyGenericGetRequestQuery()

  const showModal = () =>
    ModalService.confirm({
      body: (
        <div>
          Are you sure you want to run the standards now? <br />
          <i>Please note: this runs every three hours automatically.</i>
        </div>
      ),
      onConfirm: () => execStandards({ path: 'api/Standards_OrchestrationStarter' }),
    })

  return (
    <>
      {execStandardsResults.data?.Results ===
        'Already running. Please wait for the current instance to finish' && (
        <div> {execStandardsResults.data?.Results}</div>
      )}
      <CButton onClick={showModal} size="sm" className="m-1">
        {execStandardsResults.isLoading && <CSpinner size="sm" />}
        {execStandardsResults.error && (
          <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />
        )}
        {execStandardsResults.isSuccess && <FontAwesomeIcon icon={faCheck} className="pe-1" />}
        Run Standards Now
      </CButton>
    </>
  )
}
const DeleteAction = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)

  const [execStandards, execStandardsResults] = useLazyGenericGetRequestQuery()

  const showModal = () =>
    ModalService.confirm({
      body: <div>Are you sure you want to delete this standard?</div>,
      onConfirm: () => execStandards({ path: `api/RemoveStandard?ID=${tenantDomain}` }),
    })

  return (
    <>
      <CButton onClick={showModal}>
        {execStandardsResults.isLoading && <CSpinner size="sm" />}
        {execStandardsResults.error && (
          <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />
        )}
        Delete Standard
      </CButton>
      {execStandardsResults.isSuccess && (
        <CCallout color="success">{execStandardsResults.data.Results}</CCallout>
      )}
    </>
  )
}
const ListAppliedStandards = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const { data: listStandardsAllTenants = [] } = useGenericGetRequestQuery({
    path: 'api/listStandards',
  })

  const {
    data: listStandardResults = [],
    isFetching,
    isSuccess,
  } = useGenericGetRequestQuery({
    path: 'api/listStandards',
    params: { TenantFilter: tenantDomain },
  })

  const handleSubmit = async (values) => {
    // @todo: clean this up api sided so we don't need to perform weird tricks.
    Object.keys(values.standards).filter(function (x) {
      if (values.standards[x] === false) {
        delete values.standards[x]
      }
      return null
    })

    values.standards[`Select_${tenantDomain}`] = tenantDomain

    //filter on only objects that are 'true'
    genericPostRequest({ path: '/api/AddStandardsDeploy', values: values.standards })
  }
  const tableColumns = [
    {
      name: 'Tenant',
      selector: (row) => row['displayName'],
      sortable: true,
      exportSelector: 'displayName',
    },
    {
      name: 'Applied Standards',
      selector: (row) => Object.keys(row.standards).join(','),
      sortable: true,
      exportSelector: 'standards',
    },
  ]

  return (
    <CippPage title="Standards" tenantSelector={false}>
      <>
        {postResults.isSuccess && <CCallout color="success">{postResults.data?.Results}</CCallout>}
        <CRow>
          <CCol lg={6} xs={12}>
            <CippContentCard
              button={
                <>
                  <RefreshAction className="justify-content-end" key="refresh-action-button" />
                </>
              }
              title="List and edit standard"
            >
              {isFetching && <Skeleton count={20} />}
              {isSuccess && !isFetching && (
                <Form
                  initialValues={listStandardResults[0]}
                  onSubmit={handleSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow className="mb-3">
                          <hr />
                          {listStandardResults[0].appliedBy
                            ? `This standard has been applied at ${listStandardResults[0].appliedAt} by ${listStandardResults[0].appliedBy}`
                            : 'This tenant does not yet have a standard applied'}
                          <hr />
                          <h5>Global Standards</h5>
                          <hr />
                          <CCol md={6}>
                            <RFFCFormSwitch
                              name="standards.MailContacts.GeneralContact.Enabled"
                              label="Set General Contact e-mail"
                            />
                            <Condition
                              when="standards.MailContacts.GeneralContact.Enabled"
                              is={true}
                            >
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
                            <Condition
                              when="standards.MailContacts.SecurityContact.Enabled"
                              is={true}
                            >
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
                            <Condition
                              when="standards.MailContacts.MarketingContact.Enabled"
                              is={true}
                            >
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
                            <RFFCFormSwitch
                              name="standards.AuditLog"
                              label="Enable the Unified Audit Log"
                            />
                            <RFFCFormSwitch
                              name="standards.AnonReportDisable"
                              label="Enable Usernames instead of pseudo anonymised names in reports"
                            />

                            <RFFCFormSwitch
                              name="standards.ModernAuth"
                              label="Enable Modern Authentication"
                            />
                            <RFFCFormSwitch
                              name="standards.DisableBasicAuth"
                              label="Disable Basic Authentication"
                            />
                          </CCol>
                        </CRow>
                        <hr />
                        <h5>Azure AD Standards</h5>
                        <hr />
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
                            <RFFCFormSwitch
                              name="standards.TAP"
                              label="Enable Temporary Access Passwords"
                            />

                            <RFFCFormSwitch
                              name="standards.SecurityDefaults"
                              label="Enable Security Defaults"
                            />
                            <RFFCFormSwitch
                              name="standards.PasswordExpireDisabled"
                              label="Do not expire passwords"
                            />
                            <RFFCFormSwitch
                              name="standards.DisableSecurityGroupUsers"
                              label="Disable Security Group creation by users"
                            />
                            <RFFCFormSwitch
                              name="standards.SSPR"
                              label="Enable Self Service Password Reset"
                            />
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
                            <RFFCFormSwitch
                              name="standards.DisableM365GroupUsers"
                              label="Disable M365 Group creation by users"
                            />
                            <RFFCFormSwitch name="standards.UndoSSPR" label="Undo SSPR Standard" />
                            <RFFCFormSwitch
                              name="standards.UndoOauth"
                              label="Undo App Consent Standard"
                            />
                          </CCol>
                        </CRow>
                        <hr />
                        <h5>Exchange Standards</h5>
                        <hr />
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
                        <hr />
                        <h5>SharePoint Standards</h5>
                        <hr />
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
                        {postResults.isSuccess && (
                          <CCallout color="success">{postResults.data.Results}</CCallout>
                        )}
                        <CRow className="mb-3">
                          <CCol md={6}>
                            <CButton type="submit" disabled={submitting}>
                              Save
                              {postResults.isFetching && (
                                <FontAwesomeIcon
                                  icon={faCircleNotch}
                                  spin
                                  className="ms-2"
                                  size="1x"
                                />
                              )}
                            </CButton>
                          </CCol>
                          <CCol md={6} className="d-flex flex-row-reverse">
                            {listStandardResults[0].appliedBy && (
                              <DeleteAction key="deleteAction" />
                            )}
                          </CCol>
                        </CRow>
                      </CForm>
                    )
                  }}
                />
              )}
            </CippContentCard>
          </CCol>
          <CCol lg={6} xs={12}>
            {listStandardsAllTenants && (
              <CippContentCard title="Currently Applied Standards">
                <CippTable
                  reportName={`Standards}`}
                  data={listStandardsAllTenants}
                  columns={tableColumns}
                />
              </CippContentCard>
            )}
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default ListAppliedStandards
