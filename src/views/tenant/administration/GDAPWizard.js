import React from 'react'
import { CCol, CRow, CForm, CCallout, CSpinner, CButton } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'
import PropTypes from 'prop-types'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'

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

const requiredArray = (value) => (value && value.length !== 0 ? undefined : 'Required')

const GDAPWizard = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()

  const handleSubmit = async (values) => {
    genericPostRequest({ path: '/api/ExecGDAPMigration', values: values })
  }

  const formValues = {}

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="GDAP Migration Wizard"
    >
      <CippWizard.Page title="GDAP Wizard" description="API Setup">
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Setup GDAP Migration tool</h5>
        </center>
        <hr className="my-4" />
        <CCallout color="info">
          The GDAP migration tool requires setup. Please check the documentation{' '}
          <a
            className="mb-2"
            href="https://cipp.app/docs/user/usingcipp/GDAP/migration/"
            target="_blank"
          >
            here.
          </a>
          <br /> <br />
          This tool is offered as-is, without support, warranties, or guarantees. If you are having
          GDAP migration problems, contact Microsoft via the Partner Support Center.
          <br />
          Please remember to add the CIPP-SAM service principal to the GDAP groups you would like
          CIPP to manage.
          <br /> <br />
          Use the button below to enable the GDAP migration API, you only need to enable this API
          once.
        </CCallout>
        <CButton onClick={() => genericGetRequest({ path: '/api/ExecAddSPN' })}>
          Enable GDAP API
        </CButton>
        {(getResults.isSuccess || getResults.isError) && (
          <CCallout color={getResults.isSuccess ? 'success' : 'danger'}>
            {getResults.isSuccess
              ? getResults.data.Results
              : 'Failed to add SPN. Please manually execute "New-AzureADServicePrincipal -AppId 2832473f-ec63-45fb-976f-5d45a7d4bb91"'}
          </CCallout>
        )}
        <hr className="my-4" />
      </CippWizard.Page>

      <CippWizard.Page
        title="Select which roles you want to add to GDAP relationship"
        description="Choose from the mapped GDAP Roles"
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">
            Select which roles you want to add to GDAP relationship.
          </h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <CCallout color="info">
            CIPP will create a single relationship with all roles you've selected for the maximum
            duration of 730 days using a GUID as a random name for the relationship.
            <br /> It is recommend to put CIPP user in the correct GDAP Role Groups to manage your
            environment secure after deployment of GDAP.
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
          <Error name="gdapRoles" />
        </CForm>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants you wish to create a GDAP relationship for"
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants" validate={requiredArray}>
          {(props) => (
            <WizardTableField
              reportName="Add-Choco-App-Tenant-Selector"
              keyField="defaultDomainName"
              path="/api/ListTenants?AllTenantSelector=false"
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
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 4</h3>
          <h5 className="card-title mb-4">Confirm and apply</h5>
        </center>
        <hr className="my-4" />
        {!postResults.isSuccess && (
          <FormSpy>
            {(props) => {
              return (
                <>
                  <CRow>
                    <CCol md={3}></CCol>
                    <CCol md={6}>
                      <h5 className="mb-0">Selected Tenants</h5>
                      <CCallout color="info">
                        {props.values.selectedTenants.map((tenant, idx) => (
                          <li key={idx}>
                            {tenant.displayName} - {tenant.defaultDomainName}
                          </li>
                        ))}
                      </CCallout>
                      <h5 className="mb-0">Roles and group names</h5>
                      <CCallout color="info">
                        {props.values.gdapRoles.map((role, idx) => (
                          <li key={idx}>
                            {role.RoleName} - {role.GroupName}
                          </li>
                        ))}
                      </CCallout>
                    </CCol>
                  </CRow>
                </>
              )
            }}
          </FormSpy>
        )}
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
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default GDAPWizard
