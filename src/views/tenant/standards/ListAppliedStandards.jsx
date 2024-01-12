import React, { useState } from 'react'
import {
  CButton,
  CCallout,
  CCol,
  CForm,
  CRow,
  CSpinner,
  CAccordion,
  CAccordionHeader,
  CAccordionBody,
  CAccordionItem,
  CWidgetStatsB,
  CBadge,
} from '@coreui/react'
import { Form } from 'react-final-form'
import {
  Condition,
  RFFCFormInput,
  RFFCFormRadio,
  RFFCFormSelect,
  RFFCFormSwitch,
  RFFSelectSearch,
} from 'src/components/forms'
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
import allStandardsList from 'src/data/standards'
import CippCodeOffCanvas from 'src/components/utilities/CippCodeOffcanvas'
import GDAPRoles from 'src/data/GDAPRoles'

const RefreshAction = () => {
  const [execStandards, execStandardsResults] = useLazyGenericGetRequestQuery()
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const showModal = (selectedTenant) =>
    ModalService.confirm({
      body: (
        <div>
          Are you sure you want to run the standards now? <br />
          <i>Please note: this runs every three hours automatically.</i>
        </div>
      ),
      onConfirm: () =>
        execStandards({ path: `api/ExecStandardsRun?Tenantfilter=${selectedTenant}` }),
    })

  return (
    <>
      {execStandardsResults.data?.Results ===
        'Already running. Please wait for the current instance to finish' && (
        <div> {execStandardsResults.data?.Results}</div>
      )}
      <p>
        <CButton onClick={() => showModal('AllTenants')} size="sm" className="m-1">
          {execStandardsResults.isLoading && <CSpinner size="sm" />}
          {execStandardsResults.error && (
            <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />
          )}
          {execStandardsResults.isSuccess && <FontAwesomeIcon icon={faCheck} className="me-2" />}
          Run Standards Now (All Tenants)
        </CButton>
        <CButton onClick={() => showModal(tenantDomain)} size="sm" className="m-1">
          {execStandardsResults.isLoading && <CSpinner size="sm" />}
          {execStandardsResults.error && (
            <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />
          )}
          {execStandardsResults.isSuccess && <FontAwesomeIcon icon={faCheck} className="me-2" />}
          Run Standards Now (Selected Tenant)
        </CButton>
      </p>
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
      <>
        {execStandardsResults.isSuccess && (
          <CCallout color="success">{execStandardsResults.data.Results}</CCallout>
        )}
      </>
    </>
  )
}
const ApplyNewStandard = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const [ocVisible, setOCVisible] = useState(false)
    const handleDeleteIntuneTemplate = (apiurl, message) => {
      ModalService.confirm({
        title: 'Confirm',
        body: <div>{message}</div>,
        onConfirm: () => ExecuteGetRequest({ path: apiurl }),
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
      })
    }
    return (
      <>
        <CButton
          size="sm"
          variant="ghost"
          color="danger"
          onClick={() =>
            handleDeleteIntuneTemplate(
              `api/RemoveStandard?ID=${row.displayName}`,
              'Do you want to delete this standard?',
            )
          }
        >
          <FontAwesomeIcon icon={'trash'} href="" />
        </CButton>
        <CippCodeOffCanvas
          row={row}
          state={ocVisible}
          type="CATemplate"
          hideFunction={() => setOCVisible(false)}
        />
      </>
    )
  }
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
      selector: (row) => row['StandardsExport'],
      sortable: true,
      exportSelector: 'StandardsExport',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
    },
  ]
  const [intuneGetRequest, intuneTemplates] = useLazyGenericGetRequestQuery()
  const [transportGetRequest, transportTemplates] = useLazyGenericGetRequestQuery()
  const [exConnectorGetRequest, exConnectorTemplates] = useLazyGenericGetRequestQuery()
  const [caGetRequest, caTemplates] = useLazyGenericGetRequestQuery()
  const [groupGetRequest, groupTemplates] = useLazyGenericGetRequestQuery()
  const initialValues = listStandardResults[0]
  const allTenantsStandard = listStandardsAllTenants.find(
    (tenant) => tenant.displayName === 'AllTenants',
  )

  function getLabel(item) {
    const keys = item.name.split('.')
    let value = keys.reduce((prev, curr) => prev && prev[curr], allTenantsStandard)
    return value ? `* Enabled via All Tenants` : ''
  }

  const groupedStandards = allStandardsList.reduce((acc, obj) => {
    acc[obj.cat] = acc[obj.cat] || []
    acc[obj.cat].push(obj)
    return acc
  }, {})

  // Function to count enabled standards
  function countEnabledStandards(standards, type) {
    let count = 0
    Object.keys(standards).forEach((key) => {
      const standard = standards[key]
      // Check if 'Enabled' exists and the specific type is true, for non-v2 standards
      if (standard?.Enabled && standard?.Enabled[type]) {
        count++
      } else if (standard && standard[type]) {
        // Check if the type exists directly under the standard
        count++
      }
    })
    return count
  }

  // Assuming listStandardResults[0] contains your JSON object
  const enabledStandards = listStandardResults[0] ? listStandardResults[0].standards : {}
  const enabledAlertsCount = countEnabledStandards(enabledStandards, 'alert')
  const enabledRemediationsCount = countEnabledStandards(enabledStandards, 'remediate')
  const enabledWarningsCount = countEnabledStandards(enabledStandards, 'report')
  const totalAvailableStandards = allStandardsList.length

  return (
    <CippPage title="Standards" tenantSelector={false}>
      <>
        {postResults.isSuccess && <CCallout color="success">{postResults.data?.Results}</CCallout>}
        <CRow>
          <CCol lg={12} xs={12}>
            <CippContentCard
              button={
                <>
                  <RefreshAction className="justify-content-end" key="refresh-action-button" />
                </>
              }
              title={`List and edit standard - ${tenantDomain}`}
            >
              {isFetching && <Skeleton count={20} />}
              {intuneTemplates.isUninitialized &&
                intuneGetRequest({ path: 'api/ListIntuneTemplates' })}
              {transportTemplates.isUninitialized &&
                transportGetRequest({ path: 'api/ListTransportRulesTemplates' })}
              {caTemplates.isUninitialized && caGetRequest({ path: 'api/ListCAtemplates' })}
              {exConnectorTemplates.isUninitialized &&
                exConnectorGetRequest({ path: 'api/ListExConnectorTemplates' })}
              {groupTemplates.isUninitialized &&
                groupGetRequest({ path: 'api/ListGroupTemplates' })}
              {isSuccess && !isFetching && (
                <Form
                  initialValues={initialValues}
                  onSubmit={handleSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow className="mb-3">
                          <CCol md={4}>
                            <CWidgetStatsB
                              className="mb-3"
                              progress={{
                                color: 'info',
                                value:
                                  totalAvailableStandards > 0
                                    ? Math.round(
                                        (enabledWarningsCount / totalAvailableStandards) * 1000,
                                      ) / 10
                                    : 0,
                              }}
                              text={
                                listStandardResults[0].appliedBy
                                  ? `Created by ${listStandardResults[0].appliedBy}`
                                  : 'None'
                              }
                              title={`${enabledWarningsCount} out of ${totalAvailableStandards}`}
                              value="Enabled Warnings"
                            />
                          </CCol>
                          <CCol md={4}>
                            <CWidgetStatsB
                              className="mb-3"
                              progress={{
                                color: 'info',
                                value:
                                  totalAvailableStandards > 0
                                    ? Math.round(
                                        (enabledAlertsCount / totalAvailableStandards) * 1000,
                                      ) / 10
                                    : 0,
                              }}
                              text={
                                listStandardResults[0].appliedBy
                                  ? `Created by ${listStandardResults[0].appliedBy}`
                                  : 'None'
                              }
                              title={`${enabledAlertsCount} out of ${totalAvailableStandards}`}
                              value="Enabled Alerts"
                            />
                          </CCol>
                          <CCol md={4}>
                            <CWidgetStatsB
                              className="mb-3"
                              progress={{
                                color: 'info',
                                value:
                                  totalAvailableStandards > 0
                                    ? Math.round(
                                        (enabledRemediationsCount / totalAvailableStandards) * 1000,
                                      ) / 10
                                    : 0,
                              }}
                              text={
                                listStandardResults[0].appliedBy
                                  ? `Created by ${listStandardResults[0].appliedBy}`
                                  : 'None'
                              }
                              title={`${enabledRemediationsCount} out of ${totalAvailableStandards}`}
                              value="Enabled Remediations"
                            />
                          </CCol>
                          <CAccordion
                            alwaysOpen
                            activeItemKey={
                              tenantDomain !== 'AllTenants' ? 'general-1' : 'standard-0'
                            }
                          >
                            {tenantDomain !== 'AllTenants' && (
                              <CAccordionItem itemKey={'general-1'} key={`general-1`}>
                                <CAccordionHeader>General Standard Settings</CAccordionHeader>
                                <CAccordionBody>
                                  <CRow className="mb-3">
                                    <CCol md={4}>
                                      <div
                                        style={{
                                          display: 'flex',
                                          flexDirection: 'row',
                                          justifyContent: 'space-between',
                                        }}
                                      >
                                        <h5>Do not apply All Tenants Standard to this tenant</h5>
                                        <div>
                                          <CBadge color="info">Minimal Impact</CBadge>
                                        </div>
                                      </div>
                                      <p>
                                        <small>
                                          Enabling this feature excludes this tenant from any
                                          top-level "All Tenants" standard. This means that only the
                                          standards you explicitly set for this tenant will be
                                          applied. Standards previously applied by the "All Tenants"
                                          standard will not be reverted.
                                        </small>
                                      </p>
                                    </CCol>
                                    <CCol>
                                      <h5>Report</h5>
                                      <RFFCFormSwitch
                                        name="ignore.ignore1"
                                        disabled={true}
                                        helpText={
                                          'Report stores the data in the database to use in custom BPA reports.'
                                        }
                                      />
                                    </CCol>
                                    <CCol>
                                      <h5>Alert</h5>
                                      <RFFCFormSwitch
                                        name="ignore.ignore2"
                                        disabled={true}
                                        helpText={
                                          'Alert Generates an alert in the log, if remediate is enabled the log entry will also say if the remediation was successful.'
                                        }
                                      />
                                    </CCol>
                                    <CCol>
                                      <h5>Remediate</h5>
                                      <RFFCFormSwitch
                                        name="standards.OverrideAllTenants.remediate"
                                        helpText={'Remediate executes the fix for standard.'}
                                      />
                                    </CCol>
                                    <CCol md={3}>
                                      <h5>Optional Input</h5>
                                    </CCol>
                                  </CRow>
                                </CAccordionBody>
                              </CAccordionItem>
                            )}
                            {Object.keys(groupedStandards).map((cat, catIndex) => (
                              <CAccordionItem
                                itemKey={'standard-' + catIndex}
                                key={`accordion-item-${catIndex}`}
                              >
                                <CAccordionHeader>{cat}</CAccordionHeader>
                                <CAccordionBody>
                                  {groupedStandards[cat].map((obj, index) => (
                                    <CRow key={`row-${catIndex}-${index}`} className="mb-3">
                                      <CCol md={4}>
                                        <div
                                          style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                          }}
                                        >
                                          <h5>{obj.label}</h5>
                                          <div>
                                            <CBadge color={obj.impactColour}>{obj.impact}</CBadge>
                                          </div>
                                        </div>
                                        <p>
                                          <small>{obj.helpText}</small>
                                        </p>
                                      </CCol>
                                      <CCol>
                                        <h5>Report</h5>
                                        <RFFCFormSwitch
                                          name={`${obj.name}.report`}
                                          disabled={obj.disabledFeatures?.report}
                                          helpText="Report stores the data in the database to use in custom BPA reports."
                                          sublabel={getLabel(obj)}
                                        />
                                      </CCol>
                                      <CCol>
                                        <h5>Alert</h5>
                                        <RFFCFormSwitch
                                          name={`${obj.name}.alert`}
                                          disabled={obj.disabledFeatures?.warn}
                                          helpText="Alert Generates an alert in the log, if remediate is enabled the log entry will also say if the remediation was successful."
                                          sublabel={getLabel(obj)}
                                        />
                                      </CCol>
                                      <CCol>
                                        <h5>Remediate</h5>
                                        <RFFCFormSwitch
                                          name={`${obj.name}.remediate`}
                                          disabled={obj.disabledFeatures?.remediate}
                                          helpText={'Remediate executes the fix for standard.'}
                                          sublabel={getLabel(obj)}
                                        />
                                      </CCol>
                                      <CCol md={3}>
                                        <h5>Optional Input</h5>
                                        {obj.addedComponent &&
                                          obj.addedComponent.map((component) => (
                                            <>
                                              {component.type === 'Select' && (
                                                <RFFCFormSelect
                                                  name={component.name}
                                                  className="mb-3"
                                                  label={component.label}
                                                  values={component.values}
                                                />
                                              )}
                                              {component.type === 'input' && (
                                                <RFFCFormInput
                                                  type="text"
                                                  className="mb-3"
                                                  name={component.name}
                                                  label={component.label}
                                                />
                                              )}
                                              {component.type === 'number' && (
                                                <RFFCFormInput
                                                  type="number"
                                                  className="mb-3"
                                                  name={component.name}
                                                  label={component.label}
                                                />
                                              )}
                                              {component.type === 'AdminRolesMultiSelect' && (
                                                <RFFSelectSearch
                                                  multi={true}
                                                  name={component.name}
                                                  className="mb-3"
                                                  label={component.label}
                                                  values={GDAPRoles.map((role) => ({
                                                    value: role.ObjectId,
                                                    name: role.Name,
                                                  }))}
                                                />
                                              )}
                                            </>
                                          ))}
                                      </CCol>
                                    </CRow>
                                  ))}
                                </CAccordionBody>
                              </CAccordionItem>
                            ))}
                            <CAccordionItem>
                              <CAccordionHeader>Templates Standard Deployment</CAccordionHeader>
                              <CAccordionBody>
                                {[
                                  {
                                    name: 'Intune Template',
                                    switchName: 'standards.IntuneTemplate',
                                    assignable: true,
                                    templates: intuneTemplates,
                                  },
                                  {
                                    name: 'Transport Rule Template',
                                    switchName: 'standards.TransportRuleTemplate',
                                    templates: transportTemplates,
                                  },
                                  {
                                    name: 'Conditional Access Template',
                                    switchName: 'standards.ConditionalAccess',
                                    templates: caTemplates,
                                  },
                                  {
                                    name: 'Exchange Connector Template',
                                    switchName: 'standards.ExConnector',
                                    templates: exConnectorTemplates,
                                  },
                                  {
                                    name: 'Group Template',
                                    switchName: 'standards.GroupTemplate',
                                    templates: groupTemplates,
                                  },
                                ].map((template, index) => (
                                  <CRow key={`template-row-${index}`} className="mb-3">
                                    <CCol md={4}>
                                      <h5>{template.name}</h5>
                                      <small>Deploy {template.name}</small>
                                    </CCol>
                                    <CCol>
                                      <h5>Report</h5>
                                      <RFFCFormSwitch name="ignore.ignore1" disabled={true} />
                                    </CCol>
                                    <CCol>
                                      <h5>Alert</h5>
                                      <RFFCFormSwitch name="ignore.ignore2" disabled={true} />
                                    </CCol>
                                    <CCol>
                                      <h5>Remediate</h5>
                                      <RFFCFormSwitch name={`${template.switchName}.remediate`} />
                                    </CCol>
                                    <CCol md={3}>
                                      <h5>Optional Input</h5>
                                      {template.templates.isSuccess && (
                                        <RFFSelectSearch
                                          name={`${template.switchName}.TemplateList`}
                                          className="mb-3"
                                          multi={true}
                                          values={template.templates.data?.map((t) => ({
                                            value: t.GUID,
                                            name: t.name || t.Displayname || t.displayName,
                                          }))}
                                          placeholder="Select a template"
                                          label={`Choose your ${template.name}`}
                                        />
                                      )}
                                      {template.assignable && (
                                        <>
                                          <RFFCFormRadio
                                            value=""
                                            name={`${template.switchName}.AssignTo`}
                                            label="Do not assign"
                                          ></RFFCFormRadio>
                                          <RFFCFormRadio
                                            value="allLicensedUsers"
                                            name={`${template.switchName}.AssignTo`}
                                            label="Assign to all users"
                                          ></RFFCFormRadio>
                                          <RFFCFormRadio
                                            value="AllDevices"
                                            name={`${template.switchName}.AssignTo`}
                                            label="Assign to all devices"
                                          ></RFFCFormRadio>
                                          <RFFCFormRadio
                                            value="AllDevicesAndUsers"
                                            name={`${template.switchName}.AssignTo`}
                                            label="Assign to all users and devices"
                                          ></RFFCFormRadio>
                                          <RFFCFormRadio
                                            value="customGroup"
                                            name={`${template.switchName}.AssignTo`}
                                            label="Assign to Custom Group"
                                          ></RFFCFormRadio>
                                          <Condition
                                            when={`${template.switchName}.AssignTo`}
                                            is="customGroup"
                                          >
                                            <RFFCFormInput
                                              type="text"
                                              name={`${template.switchName}.customGroup`}
                                              label="Custom Group Names separated by comma. Wildcards (*) are allowed"
                                            />
                                          </Condition>
                                        </>
                                      )}
                                    </CCol>
                                  </CRow>
                                ))}
                                <CRow key={`template-row-autopilotprofile`} className="mb-3">
                                  <CCol md={4}>
                                    <h5>Autopilot Profile</h5>
                                    <small>Deploy Autopilot profile</small>
                                  </CCol>
                                  <CCol>
                                    <h5>Report</h5>
                                    <RFFCFormSwitch name="ignore.ignore1" disabled={true} />
                                  </CCol>
                                  <CCol>
                                    <h5>Alert</h5>
                                    <RFFCFormSwitch name="ignore.ignore2" disabled={true} />
                                  </CCol>
                                  <CCol>
                                    <h5>Remediate</h5>
                                    <RFFCFormSwitch name={`standards.APConfig.remediate`} />
                                  </CCol>
                                  <CCol md={3}>
                                    <h5>Optional Input</h5>
                                    <CRow>
                                      <CCol md={12}>
                                        <RFFCFormInput
                                          type="text"
                                          name="standards.APConfig.DisplayName"
                                          label="Display name"
                                          placeholder="Enter a profile name"
                                        />
                                      </CCol>
                                    </CRow>
                                    <CRow>
                                      <CCol md={12}>
                                        <RFFCFormInput
                                          type="text"
                                          name="standards.APConfig.Description"
                                          label="Description"
                                          placeholder="leave blank for none"
                                        />
                                      </CCol>
                                    </CRow>
                                    <CRow>
                                      <CCol md={12}>
                                        <RFFCFormInput
                                          type="text"
                                          name="standards.APConfig.DeviceNameTemplate"
                                          label="Unique name template"
                                          placeholder="leave blank for none"
                                        />
                                        <br></br>
                                      </CCol>
                                    </CRow>
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APConfig.CollectHash"
                                      label="Convert all targeted devices to Autopilot"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APConfig.Assignto"
                                      label="Assign to all devices"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APConfig.DeploymentMode"
                                      label="Self-deploying mode"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APConfig.HideTerms"
                                      label="Hide Terms and conditions"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APConfig.HidePrivacy"
                                      label="Hide Privacy Settings"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APConfig.HideChangeAccount"
                                      label="Hide Change Account Options"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APConfig.NotLocalAdmin"
                                      label="Setup user as standard user (Leave unchecked to setup user as local admin)"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APConfig.allowWhiteglove"
                                      label="Allow White Glove OOBE"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APConfig.Autokeyboard"
                                      label="Automatically configure keyboard"
                                    />
                                  </CCol>
                                </CRow>
                                <CRow key={`template-row-autopilotstatuspage`} className="mb-3">
                                  <CCol md={4}>
                                    <h5>Autopilot Status Page</h5>
                                    <small>Deploy Autopilot Status Page</small>
                                  </CCol>
                                  <CCol>
                                    <h5>Report</h5>
                                    <RFFCFormSwitch name="ignore.ignore1" disabled={true} />
                                  </CCol>
                                  <CCol>
                                    <h5>Alert</h5>
                                    <RFFCFormSwitch name="ignore.ignore2" disabled={true} />
                                  </CCol>
                                  <CCol>
                                    <h5>Remediate</h5>
                                    <RFFCFormSwitch name={`standards.APESP.remediate`} />
                                  </CCol>
                                  <CCol md={3}>
                                    <h5>Optional Input</h5>
                                    <CRow>
                                      <CCol>
                                        <RFFCFormInput
                                          type="number"
                                          name="standards.APESP.TimeOutInMinutes"
                                          label="Timeout in minutes"
                                          placeholder="60"
                                        />
                                      </CCol>
                                    </CRow>
                                    <CRow>
                                      <CCol md={12}>
                                        <RFFCFormInput
                                          type="text"
                                          name="standards.APESP.ErrorMessage"
                                          label="Custom Error Message"
                                          placeholder="leave blank to not set."
                                        />
                                      </CCol>
                                    </CRow>
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APESP.ShowProgress"
                                      label="Show progress to users"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APESP.EnableLog"
                                      label="Turn on log collection"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APESP.OBEEOnly"
                                      label="Show status page only with OOBE setup"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APESP.blockDevice"
                                      label="Block device usage during setup"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APESP.Allowretry"
                                      label="Allow retry"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APESP.AllowReset"
                                      label="Allow reset"
                                    />
                                    <RFFCFormSwitch
                                      value={true}
                                      name="standards.APESP.AllowFail"
                                      label="Allow users to use device if setup fails"
                                    />
                                  </CCol>
                                </CRow>
                              </CAccordionBody>
                            </CAccordionItem>
                          </CAccordion>
                        </CRow>

                        <CRow className="me-3">
                          {postResults.isSuccess && (
                            <CCallout color="success">{postResults.data.Results}</CCallout>
                          )}
                          <CRow className="mb-3">
                            <CCol md={3}>
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
                            <CCol className="d-flex flex-row-reverse">
                              {listStandardResults[0].appliedBy && (
                                <DeleteAction key="deleteAction" />
                              )}
                            </CCol>
                          </CRow>
                        </CRow>
                      </CForm>
                    )
                  }}
                />
              )}
            </CippContentCard>
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default ApplyNewStandard
