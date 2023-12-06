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
      <>
        {execStandardsResults.isSuccess && (
          <CCallout color="success">{execStandardsResults.data.Results}</CCallout>
        )}
      </>
    </>
  )
}
const ListAppliedStandards = () => {
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
      // Check if 'Enabled' exists and the specific type is true
      if (standard?.Enabled && standard?.Enabled[type]) {
        count++
      } else if (standard[type]) {
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
                              progress={{ color: 'info', value: enabledWarningsCount }}
                              text={`Created by ${listStandardResults[0].appliedBy}`}
                              title={`${enabledWarningsCount} out of 64`}
                              value="Enabled Warnings"
                            />
                          </CCol>
                          <CCol md={4}>
                            <CWidgetStatsB
                              className="mb-3"
                              progress={{ color: 'info', value: enabledAlertsCount }}
                              text={`Created by ${listStandardResults[0].appliedBy}`}
                              title={`${enabledAlertsCount} out of 64`}
                              value="Enabled Alerts"
                            />
                          </CCol>
                          <CCol md={4}>
                            <CWidgetStatsB
                              className="mb-3"
                              progress={{ color: 'info', value: enabledRemediationsCount }}
                              text={`Created by ${listStandardResults[0].appliedBy}`}
                              title={`${enabledRemediationsCount} out of 64`}
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
                                      <h5>Do not apply All Tenants Standard to this tenant</h5>
                                      <p>
                                        <small>
                                          Enabling this feature excludes this tenant from any
                                          top-level "All Tenants" standard. This means that only the
                                          standards you explicitly set for this tenant will be
                                          applied. Standards previously applied by the "All Tenants"
                                          standard will not be reverted.
                                        </small>
                                      </p>
                                      <CBadge color="info">Minimal Impact</CBadge>
                                    </CCol>
                                    <CCol>
                                      <h5>Warn</h5>
                                      <RFFCFormSwitch
                                        name="ignore.ignore1"
                                        disabled={true}
                                        helpText={
                                          'Exclude this standard from the All Tenants standard. This will only apply explicitly set standards to this tenant.'
                                        }
                                      />
                                    </CCol>
                                    <CCol>
                                      <h5>Alert</h5>
                                      <RFFCFormSwitch
                                        name="ignore.ignore2"
                                        disabled={true}
                                        helpText={
                                          'Exclude this standard from the All Tenants standard. This will only apply explicitly set standards to this tenant.'
                                        }
                                      />
                                    </CCol>
                                    <CCol>
                                      <h5>Remediate</h5>
                                      <RFFCFormSwitch
                                        name="standards.OverrideAllTenants.remediate"
                                        helpText={
                                          'Exclude this standard from the All Tenants standard. This will only apply explicitly set standards to this tenant.'
                                        }
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
                                        <h5>{obj.label}</h5>
                                        <p>
                                          <small>{obj.helpText}</small>
                                        </p>
                                        <CBadge color={obj.impactColour}>{obj.impact}</CBadge>
                                      </CCol>
                                      <CCol>
                                        <h5>Warn</h5>
                                        <RFFCFormSwitch
                                          name={`${obj.name}.report`}
                                          helpText={obj.helpText}
                                          sublabel={getLabel(obj)}
                                        />
                                      </CCol>
                                      <CCol>
                                        <h5>Alert</h5>
                                        <RFFCFormSwitch
                                          name={`${obj.name}.alert`}
                                          helpText={obj.helpText}
                                          sublabel={getLabel(obj)}
                                        />
                                      </CCol>
                                      <CCol>
                                        <h5>Remediate</h5>
                                        <RFFCFormSwitch
                                          name={`${obj.name}.remediate`}
                                          helpText={obj.helpText}
                                          sublabel={getLabel(obj)}
                                        />
                                      </CCol>
                                      <CCol md={3}>
                                        <h5>Optional Input</h5>
                                        {(obj.addedComponent &&
                                          obj.addedComponent.type === 'Select' && (
                                            <RFFCFormSelect
                                              name={obj.addedComponent.name}
                                              className="mb-3"
                                              label={obj.addedComponent.label}
                                              values={obj.addedComponent.values}
                                            />
                                          )) ||
                                          (obj.addedComponent &&
                                            obj.addedComponent.type === 'input' && (
                                              <RFFCFormInput
                                                type="text"
                                                className="mb-3"
                                                name={obj.addedComponent.name}
                                                label={obj.addedComponent.label}
                                              />
                                            )) ||
                                          (obj.addedComponent &&
                                            obj.addedComponent.type === 'AdminRolesMultiSelect' && (
                                              <RFFSelectSearch
                                                multi={true}
                                                name={obj.addedComponent.name}
                                                className="mb-3"
                                                label={obj.addedComponent.label}
                                                values={GDAPRoles.map((role) => ({
                                                  value: role.ObjectId,
                                                  name: role.Name,
                                                }))}
                                              />
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
                                    switchName: 'standards.IntuneTemplate.enabled',
                                    templates: intuneTemplates,
                                  },
                                  {
                                    name: 'Transport Rule Template',
                                    switchName: 'standards.TransportRuleTemplate.enabled',
                                    templates: transportTemplates,
                                  },
                                  {
                                    name: 'Conditional Access Template',
                                    switchName: 'standards.ConditionalAccess.enabled',
                                    templates: caTemplates,
                                  },
                                  {
                                    name: 'Exchange Connector Template',
                                    switchName: 'standards.ExConnector.enabled',
                                    templates: exConnectorTemplates,
                                  },
                                  {
                                    name: 'Group Template',
                                    switchName: 'standards.GroupTemplate.enabled',
                                    templates: groupTemplates,
                                  },
                                ].map((template, index) => (
                                  <CRow key={`template-row-${index}`} className="mb-3">
                                    <CCol md={4}>
                                      <h5>{template.name}</h5>
                                      <small>Deploy {template.name}</small>
                                    </CCol>
                                    <CCol>
                                      <h5>Warn</h5>
                                      <RFFCFormSwitch name="ignore.ignore1" disabled={true} />
                                    </CCol>
                                    <CCol>
                                      <h5>Alert</h5>
                                      <RFFCFormSwitch name="ignore.ignore2" disabled={true} />
                                    </CCol>
                                    <CCol>
                                      <h5>Remediate</h5>
                                      <RFFCFormSwitch name={template.switchName} />
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
                                            name: t.name || t.Displayname,
                                          }))}
                                          placeholder="Select a template"
                                          label={`Choose your ${template.name}`}
                                        />
                                      )}
                                    </CCol>
                                  </CRow>
                                ))}
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
          {/* <CCol lg={6} xs={12}>
            {listStandardsAllTenants && (
              <CippContentCard title="Currently Applied Standards">
                {getResults.isLoading && <CSpinner size="sm" />}
                {getResults.isSuccess && (
                  <CCallout color="info">{getResults.data?.Results}</CCallout>
                )}
                <CippTable
                  reportName={`Standards`}
                  data={listStandardsAllTenants}
                  columns={tableColumns}
                />
              </CippContentCard>
            )}
          </CCol> */}
        </CRow>
      </>
    </CippPage>
  )
}

export default ListAppliedStandards
