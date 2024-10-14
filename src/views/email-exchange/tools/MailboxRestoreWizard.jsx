import React, { useState } from 'react'
import { CCallout, CCol, CListGroup, CListGroupItem, CRow, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { CippWizard } from 'src/components/layout'
import PropTypes from 'prop-types'
import {
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormSelect,
  RFFCFormSwitch,
  RFFSelectSearch,
} from 'src/components/forms'
import { TenantSelector } from 'src/components/utilities'
import { useListUsersQuery } from 'src/store/api/users'
import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'

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

const MailboxRestoreWizard = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [anrFilter, setAnrFilter] = useState('')
  const {
    data: sourceMailboxes = [],
    isFetching: sMailboxesIsFetching,
    error: sMailboxError,
  } = useGenericGetRequestQuery({
    path: '/api/ListMailboxes',
    params: {
      TenantFilter: tenantDomain,
      SoftDeletedMailbox: true,
      SkipLicense: true,
    },
  })
  const {
    data: targetMailboxes = [],
    isFetching: tMailboxesIsFetching,
    error: tMailboxError,
  } = useGenericGetRequestQuery({
    path: '/api/ListMailboxes',
    params: { TenantFilter: tenantDomain, Anr: anrFilter, SkipLicense: true },
  })
  const currentSettings = useSelector((state) => state.app)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    const shippedValues = {
      TenantFilter: tenantDomain,
      RequestName: values.RequestName,
      SourceMailbox: values.SourceMailbox.value,
      TargetMailbox: values.TargetMailbox.value,
      BadItemLimit: values.BadItemLimit,
      LargeItemLimit: values.LargeItemLimit,
      AcceptLargeDataLoss: values.AcceptLargeDataLoss,
    }

    //alert(JSON.stringify(values, null, 2))
    genericPostRequest({ path: '/api/ExecMailboxRestore', values: shippedValues })
  }

  return (
    <CippWizard onSubmit={handleSubmit} wizardTitle="Mailbox Restore Wizard">
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenant to perform a mailbox restore"
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Source Mailbox"
        description="Select a soft deleted mailbox to restore."
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5>Select a soft deleted mailbox to restore.</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <RFFSelectSearch
            label={'Soft Deleted Mailboxes in ' + tenantDomain}
            values={sourceMailboxes?.map((mbx) => ({
              value: mbx.ExchangeGuid,
              name: `${mbx.displayName} <${mbx.UPN}>`,
            }))}
            placeholder={!sMailboxesIsFetching ? 'Select mailbox' : 'Loading...'}
            name="SourceMailbox"
            isLoading={sMailboxesIsFetching}
          />
          {sMailboxError && <span>Failed to load source mailboxes</span>}
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Target Mailbox" description="Select a mailbox to restore to.">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5>Select a mailbox to restore to.</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <RFFSelectSearch
            label={'Mailboxes in ' + tenantDomain}
            name="TargetMailbox"
            values={targetMailboxes?.map((mbx) => ({
              value: mbx.ExchangeGuid,
              name: `${mbx.displayName} <${mbx.UPN}>`,
            }))}
            retainInput={true}
            onInputChange={setAnrFilter}
            isLoading={tMailboxesIsFetching}
          />
          {sMailboxError && <span>Failed to load source mailboxes</span>}
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Restore Request Options" description="Select Mailbox Restore Options">
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5>Enter Restore Request Options</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow>
            <CCol md={6}>
              <RFFCFormInput type="text" name="RequestName" label="Restore Request Name" />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <RFFCFormSwitch name="AcceptLargeDataLoss" label="Accept Large Data Loss" />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <RFFCFormInput name="BadItemLimit" label="Bad Item Limit" />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <RFFCFormInput name="LargeItemLimit" label="Large Item Limit" />
            </CCol>
          </CRow>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 4</h3>
          <h5 className="mb-4">Confirm and apply</h5>
          <hr className="my-4" />
        </center>
        <div className="mb-2">
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
          {!postResults.isSuccess && (
            <FormSpy>
              {/* eslint-disable react/prop-types */}
              {(props) => (
                <>
                  <CRow>
                    <CCol md={{ span: 6, offset: 3 }}>
                      <CListGroup flush>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Selected Tenant:</h5>
                          {tenantDomain}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Source Mailbox:</h5>
                          {props.values.SourceMailbox.label}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Target Mailbox:</h5>
                          {props.values.TargetMailbox.label}
                        </CListGroupItem>
                      </CListGroup>
                    </CCol>
                  </CRow>
                </>
              )}
            </FormSpy>
          )}
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default MailboxRestoreWizard
