import React from 'react'
import { CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import {
  RFFCFormSwitch,
  Condition,
  RFFCFormInput,
  RFFCFormSelect,
  RFFSelectSearch,
} from 'src/components/forms'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import allStandardsList from 'src/data/standards'

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
function getDeepKeys(obj) {
  return Object.keys(obj)
    .filter((key) => obj[key] instanceof Object)
    .map((key) => getDeepKeys(obj[key]).map((k) => `${key}.${k}`))
    .reduce((x, y) => x.concat(y), Object.keys(obj))
}
const ApplyStandard = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const [intuneGetRequest, intuneTemplates] = useLazyGenericGetRequestQuery()
  const [transportGetRequest, transportTemplates] = useLazyGenericGetRequestQuery()
  const [exConnectorGetRequest, exConnectorTemplates] = useLazyGenericGetRequestQuery()
  const [caGetRequest, caTemplates] = useLazyGenericGetRequestQuery()
  const [groupGetRequest, groupTemplates] = useLazyGenericGetRequestQuery()

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
          <a href="https://docs.cipp.app/user-documentation/tenant/standards/apply-standard">
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
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Entra ID Standards"
        description="Select which standards you want to apply."
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Select Standards</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
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
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Exchange Standards"
        description="Select which standards you want to apply."
      >
        <center>
          <h3 className="text-primary">Step 4</h3>
          <h5 className="card-title mb-4">Select Standards</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
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
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Intune Standards"
        description="Select which standards you want to apply."
      >
        <center>
          <h3 className="text-primary">Step 5</h3>
          <h5 className="card-title mb-4">Select Standards</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
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
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="SharePoint Standards"
        description="Select which standards you want to apply."
      >
        <center>
          <h3 className="text-primary">Step 5</h3>
          <h5 className="card-title mb-4">Select Standards</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
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
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Apply Templates"
        description="Select which templates you want to apply."
      >
        <center>
          <h3 className="text-primary">Step 7</h3>
          <h5 className="card-title mb-4">Select Default Templates to apply</h5>
        </center>
        <hr className="my-4" />
        <CCallout color="warning">
          Attention: Selected options below will run every 3 hours and overwrite any previously set
          policy by the same name. This will keep the policy exactly in the state as defined by the
          template.
        </CCallout>
        <div className="mb-2">
          <CRow className="mb-3" xs={{ cols: 2 }}>
            <CCol>
              <RFFCFormSwitch
                name="standards.IntuneTemplate.enabled"
                label="Deploy Intune Template"
              />
              <Condition when="standards.IntuneTemplate.enabled" is={true}>
                {intuneTemplates.isUninitialized &&
                  intuneGetRequest({ path: 'api/ListIntuneTemplates' })}
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
                {transportTemplates.isUninitialized &&
                  transportGetRequest({ path: 'api/ListTransportRulesTemplates' })}
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
                {caTemplates.isUninitialized && caGetRequest({ path: 'api/ListCAtemplates' })}
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
                {exConnectorTemplates.isUninitialized &&
                  exConnectorGetRequest({ path: 'api/ListExConnectorTemplates' })}
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
                    label="Choose your Exchange Connector templates to apply"
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
                {groupTemplates.isUninitialized &&
                  groupGetRequest({ path: 'api/ListGroupTemplates' })}
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
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 6</h3>
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
              <>
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
                      {getDeepKeys(props.values.standards)
                        .reduce((acc, key) => {
                          const existingItem = allStandardsList.find((obj) =>
                            obj.name.includes(key),
                          )
                          if (
                            existingItem &&
                            !acc.find((item) => item.name === existingItem.name)
                          ) {
                            acc.push(existingItem)
                          }
                          return acc
                        }, [])
                        .map((item, idx) => (
                          <li key={idx}>{item.label}</li>
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
