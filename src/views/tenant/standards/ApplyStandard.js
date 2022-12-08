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
          <CRow className="mb-3" xs={{ cols: 2 }}>
            {allStandardsList
              .filter((obj) => obj.cat === 'Global')
              .map((item, key) => (
                <>
                  <RFFCFormSwitch key={key} name={item.name} label={item.label} />
                  {item.addedComponent && (
                    <Condition when={item.name} is={true}>
                      {item.addedComponent.type === 'Select' ? (
                        <RFFCFormSelect
                          name={item.addedComponent.name}
                          label={item.addedComponent.label}
                          values={item.addedComponent.values}
                        />
                      ) : (
                        <RFFCFormInput
                          type="text"
                          name={item.addedComponent.name}
                          label={item.addedComponent.label}
                        />
                      )}
                    </Condition>
                  )}
                </>
              ))}
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
          <CRow className="mb-3" xs={{ cols: 2 }}>
            {allStandardsList
              .filter((obj) => obj.cat === 'AAD')
              .map((item, key) => (
                <>
                  <RFFCFormSwitch key={key} name={item.name} label={item.label} />
                  {item.addedComponent && (
                    <Condition when={item.name} is={true}>
                      {item.addedComponent.type === 'Select' ? (
                        <RFFCFormSelect
                          name={item.addedComponent.name}
                          label={item.addedComponent.label}
                          values={item.addedComponent.values}
                        />
                      ) : (
                        <RFFCFormInput
                          type="text"
                          name={item.addedComponent.name}
                          label={item.addedComponent.label}
                        />
                      )}
                    </Condition>
                  )}
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
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Select Standards</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow className="mb-3" xs={{ cols: 2 }}>
            {allStandardsList
              .filter((obj) => obj.cat === 'Exchange')
              .map((item, key) => (
                <>
                  <RFFCFormSwitch key={key} name={item.name} label={item.label} />
                  {item.addedComponent && (
                    <Condition when={item.name} is={true}>
                      {item.addedComponent.type === 'Select' ? (
                        <RFFCFormSelect
                          name={item.addedComponent.name}
                          label={item.addedComponent.label}
                          values={item.addedComponent.values}
                        />
                      ) : (
                        <RFFCFormInput
                          type="text"
                          name={item.addedComponent.name}
                          label={item.addedComponent.label}
                        />
                      )}
                    </Condition>
                  )}
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
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Select Standards</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow className="mb-3" xs={{ cols: 2 }}>
            {allStandardsList
              .filter((obj) => obj.cat === 'SharePoint')
              .map((item, key) => (
                <>
                  <RFFCFormSwitch key={key} name={item.name} label={item.label} />
                  {item.addedComponent && (
                    <Condition when={item.name} is={true}>
                      {item.addedComponent.type === 'Select' ? (
                        <RFFCFormSelect
                          name={item.addedComponent.name}
                          label={item.addedComponent.label}
                          values={item.addedComponent.values}
                        />
                      ) : (
                        <RFFCFormInput
                          type="text"
                          name={item.addedComponent.name}
                          label={item.addedComponent.label}
                        />
                      )}
                    </Condition>
                  )}
                </>
              ))}
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
                      {Object.entries(props.values.standards).map(([key, value]) =>
                        allStandardsList
                          .filter((obj) => obj.name.includes(key))
                          .map((item, idx) => <li key={idx}>{item.label}</li>),
                      )}
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
