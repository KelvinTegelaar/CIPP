import React, { useState } from 'react'
import {
  CCol,
  CRow,
  CForm,
  CCallout,
  CSpinner,
  CFormInput,
  CFormLabel,
  CFormRange,
  CProgress,
} from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { CippTable, WizardTableField } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'
import PropTypes from 'prop-types'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { Condition, RFFCFormSwitch } from 'src/components/forms'

const Error = ({ name }) => (
  <Field
    name={name}
    subscription={{ touched: true, error: true }}
    render={({ meta: { touched, error } }) =>
      touched && error ? (
        <CCallout color="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} color="danger" className="me-2" />
          {error}
        </CCallout>
      ) : null
    }
  />
)

Error.propTypes = {
  name: PropTypes.string.isRequired,
}

const requiredArray = (value) => {
  if (value && value.length !== 0) {
    /// group each item in value by roleDefinitionId and select Role name where count is greater than 1
    const duplicateRoles = value
      .map((item) => item.roleDefinitionId)
      .filter((item, index, self) => index !== self.indexOf(item))

    if (duplicateRoles.length > 0) {
      var duplicates = value.filter((item) => duplicateRoles.includes(item.roleDefinitionId))
      /// get unique list of duplicate roles

      duplicates = duplicates
        .filter(
          (role, index, self) =>
            index === self.findIndex((t) => t.roleDefinitionId === role.roleDefinitionId),
        )
        .map((role) => role.RoleName)
      return `Duplicate GDAP Roles selected, ensure there is only one group mapping for the listed roles to continue: ${duplicates.join(
        ', ',
      )}`
    } else {
      return undefined
    }
  } else {
    return 'You must select at least one GDAP Role'
  }
}

const GDAPInviteWizard = () => {
  const defaultRolesArray = [
    {
      Name: 'User Administrator',
      ObjectId: 'fe930be7-5e62-47db-91af-98c3a49a38b1',
    },
    {
      Name: 'Teams Administrator',
      ObjectId: '69091246-20e8-4a56-aa4d-066075b2a7a8',
    },
    {
      Name: 'SharePoint Administrator',
      ObjectId: 'f28a1f50-f6e7-4571-818b-6a12f2af6b6c',
    },
    {
      Name: 'Security Administrator',
      ObjectId: '194ae4cb-b126-40b2-bd5b-6091b380977d',
    },
    {
      Name: 'Privileged Role Administrator',
      ObjectId: 'e8611ab8-c189-46e8-94e1-60213ab1f814',
    },
    {
      Name: 'Privileged Authentication Administrator',
      ObjectId: '7be44c8a-adaf-4e2a-84d6-ab2649e08a13',
    },
    {
      Name: 'Intune Administrator',
      ObjectId: '3a2c62db-5318-420d-8d74-23affee5d9d5',
    },
    {
      Name: 'Exchange Administrator',
      ObjectId: '29232cdf-9323-42fd-ade2-1d097af3e4de',
    },
    {
      Name: 'Cloud Device Administrator',
      ObjectId: '7698a772-787b-4ac8-901f-60d6b08affd2',
    },
    {
      Name: 'Cloud App Security Administrator',
      ObjectId: '892c5842-a9a6-463a-8041-72aa08ca3cf6',
    },
    {
      Name: 'Authentication Policy Administrator',
      ObjectId: '0526716b-113d-4c15-b2c8-68e3c22b9f80',
    },
    {
      Name: 'Application Administrator',
      ObjectId: '9b895d92-2cd3-44c7-9d02-a6ac2d5ea5c3',
    },
  ]
  const [inviteCount, setInviteCount] = useState(1)
  const [loopRunning, setLoopRunning] = React.useState(false)
  const [massResults, setMassResults] = React.useState([])
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const [easyModeDone, setEasyMode] = useState(false)
  const [easyModeProgress, setEasyModeProgress] = useState(null)

  const handleSubmit = async (values) => {
    if (values.easyMode === true) {
      if (easyModeDone === false) {
        const defaultRoles = {
          gdapRoles: defaultRolesArray,
        }
        const easyModeValues = { ...defaultRoles }
        try {
          await genericPostRequest({ path: '/api/ExecAddGDAPRole', values: easyModeValues })
          const results = await genericGetRequest({ path: '/api/ListGDAPRoles' })
          const filteredResults = results.data.filter((role) =>
            defaultRolesArray.some((defaultRole) => defaultRole.ObjectId === role.roleDefinitionId),
          )
          const uniqueFilteredResults = filteredResults.filter(
            (role, index, self) =>
              index === self.findIndex((t) => t.roleDefinitionId === role.roleDefinitionId),
          )
          filteredResults.length = 0
          Array.prototype.push.apply(filteredResults, uniqueFilteredResults)
          setEasyMode(true)
          const resultsarr = []
          setLoopRunning(true)
          for (var x = 0; x < inviteCount; x++) {
            const results = await genericPostRequest({
              path: '/api/ExecGDAPInvite',
              values: { ...values, gdapRoles: filteredResults },
            })
            resultsarr.push(results.data)
            setMassResults(resultsarr)
          }
          setLoopRunning(false)
        } catch (error) {
          setEasyModeProgress(`Failed to create GDAP roles or invite users ${error}`)
          setLoopRunning(false)
        }
      }
    } else {
      // Normal mode execution
      const resultsarr = []
      setLoopRunning(true)
      for (var y = 0; y < inviteCount; y++) {
        const results = await genericPostRequest({ path: '/api/ExecGDAPInvite', values: values })
        resultsarr.push(results.data)
        setMassResults(resultsarr)
      }
      setLoopRunning(false)
    }
  }

  const formValues = { easyMode: true }

  const inviteColumns = [
    {
      name: 'Id',
      selector: (row) => row?.Invite?.RowKey,
      exportSelector: 'Invite/RowKey',
      sortable: true,
      omit: true,
      cell: cellGenericFormatter(),
    },
    {
      name: 'Invite Link',
      sortable: true,
      selector: (row) => row?.Invite?.InviteUrl,
      exportSelector: 'Invite/InviteUrl',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Onboarding Link',
      sortable: true,
      selector: (row) => row?.Invite?.OnboardingUrl,
      exportSelector: 'Invite/OnboardingUrl',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Message',
      sortable: true,
      selector: (row) => row?.Message,
      exportSelector: 'Message',
      cell: cellGenericFormatter(),
    },
  ]

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="GDAP Invite Wizard"
    >
      <CippWizard.Page title="Roles" description="Choose from the mapped GDAP Roles">
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">
            Select which roles you want to add to GDAP relationship.
          </h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <RFFCFormSwitch name="easyMode" label="Use CIPP recommended roles and settings" />
          <Condition when="easyMode" is={true}>
            <CCallout color="info">
              <p>
                CIPP will create 12 new groups in your Azure AD environment if they do not exist,
                and add the CIPP user to these 12 groups. The CIPP user will be added to the
                following groups:
              </p>
              <ul>
                <li>M365 GDAP Application Administrator</li>
                <li>M365 GDAP Authentication Policy Administrator</li>
                <li>M365 GDAP Cloud App Security Administrator</li>
                <li>M365 GDAP Cloud Device Administrator</li>
                <li>M365 GDAP Exchange Administrator</li>
                <li>M365 GDAP Intune Administrator</li>
                <li>M365 GDAP Privileged Authentication Administrator</li>
                <li>M365 GDAP Privileged Role Administrator</li>
                <li>M365 GDAP Security Administrator</li>
                <li>M365 GDAP SharePoint Administrator</li>
                <li>M365 GDAP Teams Administrator</li>
                <li>M365 GDAP User Administrator</li>
              </ul>
              Any other user that needs to gain access to your Microsoft CSP Tenants will need to be
              manually added to these groups.
            </CCallout>
          </Condition>
          <Condition when="easyMode" is={false}>
            <CCallout color="info">
              CIPP will create a single relationship with all roles you've selected for the maximum
              duration of 730 days using a GUID as a random name for the relationship.
            </CCallout>

            <div className="mb-2">
              <TitleButton href="/tenant/administration/gdap-role-wizard" title="Map GDAP Roles" />
            </div>

            <Field name="gdapRoles" validate={requiredArray}>
              {(props) => (
                <WizardTableField
                  reportName="gdaproles"
                  keyField="defaultDomainName"
                  path="/api/ListGDAPRoles"
                  columns={[
                    {
                      name: 'Name',
                      selector: (row) => row['RoleName'],
                      sortable: true,
                      exportselector: 'Name',
                    },
                    {
                      name: 'Group',
                      selector: (row) => row['GroupName'],
                      sortable: true,
                    },
                  ]}
                  fieldProps={props}
                />
              )}
            </Field>
          </Condition>
          <Error name="gdapRoles" />
        </CForm>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Invite Options" description="Select options for the invite">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Invite Options</h5>
        </center>
        <hr className="my-4" />
        <CFormLabel>Number of Invites</CFormLabel>
        <CRow className="mb-3">
          <CCol md={1} xs={6}>
            <CFormInput
              id="invite-count"
              value={inviteCount}
              onChange={(e) => setInviteCount(e.target.value)}
            />
          </CCol>
          <CCol>
            <CFormRange
              className="mt-2"
              min={1}
              max={100}
              defaultValue={1}
              value={inviteCount}
              onChange={(e) => setInviteCount(e.target.value)}
            />
          </CCol>
        </CRow>
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Confirm and apply</h5>
        </center>
        <hr className="my-4" />
        {massResults.length < 1 && (
          <FormSpy>
            {/* eslint-disable react/prop-types */}
            {(props) => {
              return (
                <>
                  <CRow>
                    <CCol md={3}></CCol>
                    <CCol md={6}>
                      {props.values.easyMode === false && (
                        <>
                          <h5 className="mb-0">Roles and group names</h5>
                          {props.values.gdapRoles.map((role, idx) => (
                            <React.Fragment key={idx}>
                              {role.RoleName === 'Company Administrator' && (
                                <CCallout color="warning">
                                  WARNING: The Company Administrator role will prevent GDAP
                                  relationships from automatically extending. We recommend against
                                  using this in any GDAP relationship.
                                </CCallout>
                              )}
                            </React.Fragment>
                          ))}
                          <CCallout color="info">
                            <ul>
                              {props.values.gdapRoles.map((role, idx) => (
                                <li key={idx}>
                                  {role.RoleName} - {role.GroupName}
                                </li>
                              ))}
                            </ul>
                          </CCallout>
                        </>
                      )}
                      {props.values.easyMode === true && (
                        <>
                          <CCallout color="info">
                            <p>
                              You have selected CIPP to manage your roles and groups. Invites will
                              contain the following roles and groups
                            </p>
                            <ul>
                              <li>M365 GDAP Application Administrator</li>
                              <li>M365 GDAP Authentication Policy Administrator</li>
                              <li>M365 GDAP Cloud App Security Administrator</li>
                              <li>M365 GDAP Cloud Device Administrator</li>
                              <li>M365 GDAP Exchange Administrator</li>
                              <li>M365 GDAP Intune Administrator</li>
                              <li>M365 GDAP Privileged Authentication Administrator</li>
                              <li>M365 GDAP Privileged Role Administrator</li>
                              <li>M365 GDAP Security Administrator</li>
                              <li>M365 GDAP SharePoint Administrator</li>
                              <li>M365 GDAP Teams Administrator</li>
                              <li>M365 GDAP User Administrator</li>
                            </ul>
                          </CCallout>
                        </>
                      )}
                      {easyModeProgress && <CCallout color="danger">{easyModeProgress}</CCallout>}
                      {getResults.isFetching && <CSpinner />}
                    </CCol>
                  </CRow>
                </>
              )
            }}
          </FormSpy>
        )}
        {(massResults.length >= 1 || loopRunning) && (
          <>
            <CCallout color="info">
              <p className="mb-3">
                The invites have been generated. You can view the results below. The
                <strong className="m-1">invite link</strong> is to be used by a Global Administrator
                of your clients Tenant. The<strong className="m-1">onboarding</strong>link is to be
                used by a CIPP administrator to finish the process inside of CIPP.
              </p>
            </CCallout>
            <div style={{ width: '100%' }} className="mb-3">
              {loopRunning ? (
                <span>
                  Generating Invites <CSpinner className="ms-2" size="sm" />
                </span>
              ) : (
                <span>
                  Generating Invites
                  <FontAwesomeIcon className="ms-2" icon="check-circle" />
                </span>
              )}
              <CProgress className="mt-2" value={(massResults.length / inviteCount) * 100}>
                {massResults.length}/{inviteCount}
              </CProgress>
            </div>

            <CippTable
              reportName="gdap-invites"
              data={massResults}
              columns={inviteColumns}
              disablePDFExport={true}
            />
          </>
        )}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default GDAPInviteWizard
