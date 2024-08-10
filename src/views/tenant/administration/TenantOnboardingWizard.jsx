import React, { useRef, useEffect } from 'react'
import { CAccordion, CCallout, CCol, CRow } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { CippWizard } from 'src/components/layout'
import PropTypes from 'prop-types'
import { RFFCFormSwitch } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { WizardTableField, cellDateFormatter, cellNullTextFormatter } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'
import RelationshipOnboarding from 'src/views/tenant/administration/onboarding/RelationshipOnboarding'

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

function useInterval(callback, delay, state) {
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  })

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }

    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay, state])
}

const TenantOnboardingWizard = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const currentSettings = useSelector((state) => state.app)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const requiredArray = (value) => (value && value.length !== 0 ? undefined : 'Required')

  const handleSubmit = async (values) => {}
  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row.customer?.displayName,
      sortable: true,
      exportSelector: 'customer/displayName',
      cell: cellNullTextFormatter(),
    },
    {
      name: 'Relationship Name',
      selector: (row) => row['displayName'],
      sortable: true,
      exportSelector: 'displayName',
    },
    {
      name: 'Status',
      selector: (row) => row['status'],
      sortable: true,
      exportSelector: 'status',
    },
    {
      name: 'Created',
      selector: (row) => row['createdDateTime'],
      sortable: true,
      exportSelector: 'createdDateTime',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'Activated',
      selector: (row) => row['activatedDateTime'],
      sortable: true,
      exportSelector: 'activatedDateTime',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'End',
      selector: (row) => row['endDateTime'],
      sortable: true,
      exportSelector: 'endDateTime',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'Auto Extend',
      selector: (row) => row['autoExtendDuration'],
      sortable: true,
      exportSelector: 'endDateTime',
      cell: (row) => (row['autoExtendDuration'] === 'PT0S' ? 'No' : 'Yes'),
    },
    {
      name: 'Includes CA Role',
      selector: (row) => row?.accessDetails,
      sortable: true,
      cell: (row) =>
        row?.accessDetails?.unifiedRoles?.filter(
          (e) => e.roleDefinitionId === '62e90394-69f5-4237-9190-012177145e10',
        ).length > 0
          ? 'Yes'
          : 'No',
    },
  ]
  return (
    <CippWizard
      initialValues={currentSettings.onboardingDefaults}
      onSubmit={handleSubmit}
      hideSubmit={true}
      wizardTitle="Tenant Onboarding Wizard"
    >
      <CippWizard.Page
        title="Relationship Choice"
        description="Choose the GDAP relationship to onboard"
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a relationship</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <TitleButton
            href="/tenant/administration/gdap-invite-wizard"
            title="Create GDAP Invite"
          />
        </div>
        <Field name="selectedRelationships" validate={requiredArray}>
          {(props) => (
            <>
              <WizardTableField
                reportName="Add-GDAP-Relationship"
                keyField="id"
                path="/api/ListGraphRequest"
                params={{
                  Endpoint: 'tenantRelationships/delegatedAdminRelationships',
                  $filter:
                    "(status eq 'active' or status eq 'approvalPending') and not startsWith(displayName,'MLT_')",
                }}
                columns={columns}
                filterlist={[
                  { filterName: 'Active Relationships', filter: 'Complex: status eq active' },
                  {
                    filterName: 'Pending Relationships',
                    filter: 'Complex: status eq approvalPending',
                  },
                  {
                    filterName: 'Active with Auto Extend',
                    filter: 'Complex: status eq active; autoExtendDuration ne PT0S',
                  },
                  {
                    filterName: 'Active without Auto Extend',
                    filter: 'Complex: status eq active; autoExtendDuration eq PT0S',
                  },
                ]}
                fieldProps={props}
              />
              <Error name="selectedRelationships" />
            </>
          )}
        </Field>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Onboarding Options"
        description="Select options for tenant onboarding"
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Tenant Onboarding Options</h5>
        </center>
        <hr className="my-4" />
        <h5>Standards</h5>
        <RFFCFormSwitch
          name="standardsExcludeAllTenants"
          helpText='Enabling this feature excludes this tenant from any top-level
                                      "All Tenants" standard. This means that only the standards you
                                      explicitly set for this tenant will be applied.'
          label="Exclude this tenant from top-level standards"
          className="mb-4"
        />
        <h5>Optional Settings</h5>
        <p>
          Use these options for relationships created outside of the CIPP Invite Wizard or if the
          SAM user is missing required GDAP groups from the Partner Tenant.
        </p>
        <RFFCFormSwitch name="autoMapRoles" label="Map missing groups to GDAP Roles" />
        <RFFCFormSwitch name="addMissingGroups" label="Add CIPP SAM user to missing groups" />
        <FormSpy>
          {/* eslint-disable react/prop-types */}
          {(props) => {
            return (
              <>
                {(props.values.autoMapRoles || props.values.addMissingGroups) && (
                  <Field name="gdapRoles" validate={requiredArray}>
                    {(props) => (
                      <>
                        <WizardTableField
                          reportName="gdaproles"
                          keyField="defaultDomainName"
                          path="/api/ListGDAPRoles"
                          isModal={true}
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
                        <Error name="gdapRoles" />
                      </>
                    )}
                  </Field>
                )}
              </>
            )
          }}
        </FormSpy>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        initialvalues={currentSettings.tenantOnboardingDefaults}
        title="Tenant Onboarding"
        description="Start the onboarding process for selected GDAP relationships"
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5>Tenant Onboarding</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <FormSpy>
            {/* eslint-disable react/prop-types */}
            {(props) => {
              return (
                <>
                  <CRow>
                    <CCol md={3}></CCol>
                    <CCol md={12}>
                      <h5 className="mb-0">Onboarding Status</h5>
                      <CAccordion flush className="mt-3" alwaysOpen>
                        {props.values.selectedRelationships.map((relationship, idx) => (
                          <RelationshipOnboarding
                            relationship={relationship}
                            gdapRoles={props.values.gdapRoles}
                            autoMapRoles={props.values.autoMapRoles}
                            addMissingGroups={props.values.addMissingGroups}
                            standardsExcludeAllTenants={props.values.standardsExcludeAllTenants}
                            key={idx}
                          />
                        ))}
                      </CAccordion>
                    </CCol>
                  </CRow>
                </>
              )
            }}
          </FormSpy>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default TenantOnboardingWizard
