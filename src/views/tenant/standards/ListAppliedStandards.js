import React from 'react'
import { CButton, CCallout, CCol, CForm, CRow, CSpinner } from '@coreui/react'
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
import { useState } from 'react'
import CippCodeOffCanvas from 'src/components/utilities/CippCodeOffcanvas'

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
                        <hr />{' '}
                        {listStandardResults[0]?.appliedBy
                          ? `This standard has been applied at ${new Date(
                              listStandardResults[0].appliedAt + 'Z',
                            ).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })} ${new Date(
                              listStandardResults[0].appliedAt + 'Z',
                            ).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                            })} by ${listStandardResults[0].appliedBy}`
                          : 'This tenant does not yet have a standard applied'}
                        <hr />
                        <h5>Global Standards</h5>
                        <hr />
                        <CRow className="mb-3" xs={{ cols: 2 }}>
                          {allStandardsList
                            .filter((obj) => obj.cat === 'Global')
                            .map((item, key) => (
                              <>
                                <CCol>
                                  <RFFCFormSwitch
                                    key={key}
                                    name={item.name}
                                    label={item.label}
                                    sublabel={getLabel(item)}
                                    helpText={item.helpText}
                                  />
                                  {item.addedComponent && (
                                    <Condition when={item.name} is={true}>
                                      {item.addedComponent.type === 'Select' ? (
                                        <RFFCFormSelect
                                          name={item.addedComponent.name}
                                          className="mb-3"
                                          label={item.addedComponent.label}
                                          values={item.addedComponent.values}
                                        />
                                      ) : (
                                        <RFFCFormInput
                                          type="text"
                                          className="mb-3"
                                          name={item.addedComponent.name}
                                          label={item.addedComponent.label}
                                        />
                                      )}
                                    </Condition>
                                  )}
                                </CCol>
                              </>
                            ))}
                        </CRow>
                        <hr />
                        <h5>Entra ID Standards</h5>
                        <hr />
                        <CRow className="mb-3" xs={{ cols: 2 }}>
                          {allStandardsList
                            .filter((obj) => obj.cat === 'AAD')
                            .map((item, key) => (
                              <>
                                <CCol>
                                  <RFFCFormSwitch
                                    key={key}
                                    name={item.name}
                                    label={item.label}
                                    sublabel={getLabel(item)}
                                    helpText={item.helpText}
                                  />
                                  {item.addedComponent && (
                                    <Condition when={item.name} is={true}>
                                      {item.addedComponent.type === 'Select' ? (
                                        <RFFCFormSelect
                                          name={item.addedComponent.name}
                                          className="mb-3"
                                          label={item.addedComponent.label}
                                          values={item.addedComponent.values}
                                        />
                                      ) : (
                                        <RFFCFormInput
                                          type="text"
                                          className="mb-3"
                                          name={item.addedComponent.name}
                                          label={item.addedComponent.label}
                                        />
                                      )}
                                    </Condition>
                                  )}
                                </CCol>
                              </>
                            ))}
                        </CRow>
                        <hr />
                        <h5>Exchange Standards</h5>
                        <hr />
                        <CRow className="mb-3" xs={{ cols: 2 }}>
                          {allStandardsList
                            .filter((obj) => obj.cat === 'Exchange')
                            .map((item, key) => (
                              <>
                                <CCol>
                                  <RFFCFormSwitch
                                    key={key}
                                    name={item.name}
                                    label={item.label}
                                    sublabel={getLabel(item)}
                                    helpText={item.helpText}
                                  />
                                  {item.addedComponent && (
                                    <Condition when={item.name} is={true}>
                                      {item.addedComponent.type === 'Select' ? (
                                        <RFFCFormSelect
                                          name={item.addedComponent.name}
                                          className="mb-3"
                                          label={item.addedComponent.label}
                                          values={item.addedComponent.values}
                                        />
                                      ) : (
                                        <RFFCFormInput
                                          type="text"
                                          className="mb-3"
                                          name={item.addedComponent.name}
                                          label={item.addedComponent.label}
                                        />
                                      )}
                                    </Condition>
                                  )}
                                </CCol>
                              </>
                            ))}
                        </CRow>
                        <hr />
                        <h5>Intune Standards</h5>
                        <hr />
                        <CRow className="mb-3" xs={{ cols: 2 }}>
                          {allStandardsList
                            .filter((obj) => obj.cat === 'Intune')
                            .map((item, key) => (
                              <>
                                <CCol>
                                  <RFFCFormSwitch
                                    key={key}
                                    name={item.name}
                                    label={item.label}
                                    sublabel={getLabel(item)}
                                    helpText={item.helpText}
                                  />
                                  {item.addedComponent && (
                                    <Condition when={item.name} is={true}>
                                      {item.addedComponent.type === 'Select' ? (
                                        <RFFCFormSelect
                                          name={item.addedComponent.name}
                                          className="mb-3"
                                          label={item.addedComponent.label}
                                          values={item.addedComponent.values}
                                        />
                                      ) : (
                                        <RFFCFormInput
                                          type="text"
                                          className="mb-3"
                                          name={item.addedComponent.name}
                                          label={item.addedComponent.label}
                                        />
                                      )}
                                    </Condition>
                                  )}
                                </CCol>
                              </>
                            ))}
                        </CRow>
                        <hr />
                        <h5>SharePoint Standards</h5>
                        <hr />
                        <CRow className="mb-3" xs={{ cols: 2 }}>
                          {allStandardsList
                            .filter((obj) => obj.cat === 'SharePoint')
                            .map((item, key) => (
                              <>
                                <CCol>
                                  <RFFCFormSwitch
                                    key={key}
                                    name={item.name}
                                    label={item.label}
                                    sublabel={getLabel(item)}
                                    helpText={item.helpText}
                                  />
                                  {item.addedComponent && (
                                    <Condition when={item.name} is={true}>
                                      {item.addedComponent.type === 'Select' ? (
                                        <RFFCFormSelect
                                          name={item.addedComponent.name}
                                          className="mb-3"
                                          label={item.addedComponent.label}
                                          values={item.addedComponent.values}
                                        />
                                      ) : (
                                        <RFFCFormInput
                                          type="text"
                                          className="mb-3"
                                          name={item.addedComponent.name}
                                          label={item.addedComponent.label}
                                        />
                                      )}
                                    </Condition>
                                  )}
                                </CCol>
                              </>
                            ))}
                        </CRow>
                        <hr />
                        <h5>Templates</h5>
                        <hr />
                        <CRow className="mb-3" xs={{ cols: 2 }}>
                          <CCol>
                            <RFFCFormSwitch
                              name="standards.IntuneTemplate.enabled"
                              label="Deploy Intune Template"
                            />

                            <Condition when="standards.IntuneTemplate.enabled" is={true}>
                              {intuneTemplates.isSuccess && (
                                <RFFSelectSearch
                                  name="standards.IntuneTemplate.TemplateList"
                                  className="mb-3"
                                  multi={true}
                                  values={intuneTemplates.data?.map((template) => ({
                                    value: template.GUID,
                                    name: template.Displayname,
                                  }))}
                                  placeholder="Select a template"
                                  label="Choose your Intune templates to apply"
                                />
                              )}
                            </Condition>
                          </CCol>
                          <CCol>
                            <RFFCFormSwitch
                              name="standards.TransportRuleTemplate.enabled"
                              label="Deploy Transport Rule Template"
                            />

                            <Condition when="standards.TransportRuleTemplate.enabled" is={true}>
                              {transportTemplates.isSuccess && (
                                <RFFSelectSearch
                                  name="standards.TransportRuleTemplate.TemplateList"
                                  className="mb-3"
                                  multi={true}
                                  values={transportTemplates.data?.map((template) => ({
                                    value: template.GUID,
                                    name: template.name,
                                  }))}
                                  placeholder="Select a template"
                                  label="Choose your Transport Rule templates to apply"
                                />
                              )}
                            </Condition>
                          </CCol>
                          <CCol>
                            <RFFCFormSwitch
                              name="standards.ConditionalAccess.enabled"
                              label="Deploy Conditional Access Template"
                            />

                            <Condition when="standards.ConditionalAccess.enabled" is={true}>
                              {caTemplates.isSuccess && (
                                <RFFSelectSearch
                                  name="standards.ConditionalAccess.TemplateList"
                                  className="mb-3"
                                  multi={true}
                                  values={caTemplates.data?.map((template) => ({
                                    value: template.GUID,
                                    name: template.displayName,
                                  }))}
                                  placeholder="Select a template"
                                  label="Choose your Conditional Access templates to apply"
                                />
                              )}
                            </Condition>
                          </CCol>
                          <CCol>
                            <RFFCFormSwitch
                              name="standards.ExConnector.enabled"
                              label="Deploy Exchange Connector Template"
                            />

                            <Condition when="standards.ExConnector.enabled" is={true}>
                              {exConnectorTemplates.isSuccess && (
                                <RFFSelectSearch
                                  name="standards.ExConnector.TemplateList"
                                  className="mb-3"
                                  multi={true}
                                  values={exConnectorTemplates.data?.map((template) => ({
                                    value: template.GUID,
                                    name: template.name,
                                  }))}
                                  placeholder="Select a template"
                                  label="Choose your Transport Rule templates to apply"
                                />
                              )}
                            </Condition>
                          </CCol>
                          <CCol>
                            <RFFCFormSwitch
                              name="standards.GroupTemplate.enabled"
                              label="Deploy Group Template"
                            />
                            <Condition when="standards.GroupTemplate.enabled" is={true}>
                              {groupTemplates.isSuccess && (
                                <RFFSelectSearch
                                  name="standards.GroupTemplate.TemplateList"
                                  className="mb-3"
                                  multi={true}
                                  values={groupTemplates.data?.map((template) => ({
                                    value: template.GUID,
                                    name: template.Displayname,
                                  }))}
                                  placeholder="Select a template"
                                  label="Choose your Group templates to apply"
                                />
                              )}
                            </Condition>
                          </CCol>
                        </CRow>
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
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default ListAppliedStandards
