import React from 'react'
import { CCol, CRow, CListGroup, CListGroupItem, CCallout, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import {
  Condition,
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormRadio,
  RFFCFormSelect,
  RFFCFormTextarea,
} from 'src/components/forms'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { OnChange } from 'react-final-form-listeners'

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
const ApplyGroupTemplate = () => {
  const [intuneGetRequest, intuneTemplates] = useLazyGenericGetRequestQuery()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    values.TemplateType = values.Type
    genericPostRequest({ path: '/api/AddGroup', values: values })
  }
  const WhenFieldChanges = ({ field, set }) => (
    <Field name={set} subscription={{}}>
      {(
        // No subscription. We only use Field to get to the change function
        { input: { onChange } },
      ) => (
        <FormSpy subscription={{}}>
          {({ form }) => (
            <OnChange name={field}>
              {(value) => {
                let template = intuneTemplates.data.filter(function (obj) {
                  return obj.GUID === value
                })
                // console.log(template[0][set])
                onChange(template[0][set])
              }}
            </OnChange>
          )}
        </FormSpy>
      )}
    </Field>
  )

  const formValues = {
    TemplateType: 'Admin',
  }

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Add Group Template"
    >
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants to create the group for."
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose tenants</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants" validate={requiredArray}>
          {(props) => (
            <WizardTableField
              reportName="Add-MEM-Policy-Tenant-Selector"
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
      <CippWizard.Page title="Select Options" description="Select which options you want to apply.">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Enter the group information or use a template.</h5>
        </center>
        <hr className="my-4" />
        <CRow>
          <CCol md={12}>
            {intuneTemplates.isUninitialized &&
              intuneGetRequest({ path: 'api/ListGroupTemplates' })}
            {intuneTemplates.isSuccess && (
              <RFFCFormSelect
                name="TemplateList"
                values={intuneTemplates.data?.map((template) => ({
                  value: template.GUID,
                  label: template.Displayname,
                }))}
                placeholder="Select a template"
                label="Please choose a template to apply, or enter the information manually."
              />
            )}
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <RFFCFormSelect
              name="groupType"
              label="Select Policy Type"
              placeholder="Select a group type"
              values={[
                { label: 'Dynamic Group', value: 'dynamic' },
                { label: 'Security Group', value: 'generic' },
                { label: 'Distribution group', value: 'distribution' },
                { label: 'Azure Role Group', value: 'azurerole' },
                { label: 'Mail Enabled Security Group', value: 'security' },
              ]}
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md={12}>
            <RFFCFormInput
              type="text"
              name="Displayname"
              label="Group Display Name"
              placeholder="Enter a name"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md={12}>
            <RFFCFormInput
              type="text"
              name="Description"
              label="Group Description"
              placeholder="leave blank for none"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md={12}>
            <RFFCFormInput
              type="text"
              name="username"
              label="Group Username"
              placeholder="Enter a name"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md={12}>
            <Condition when="groupType" is="distribution">
              <RFFCFormCheck
                name="allowExternal"
                label="Let people outside the organization email the group"
              />
            </Condition>
            <Condition when="groupType" is="dynamic">
              <RFFCFormTextarea
                type="text"
                name="MembershipRules"
                label="Membership Rule"
                placeholder="Enter membership rule syntax"
              />
            </Condition>
          </CCol>
        </CRow>
        <hr className="my-4" />
        <WhenFieldChanges field="TemplateList" set="Description" />
        <WhenFieldChanges field="TemplateList" set="Displayname" />
        <WhenFieldChanges field="TemplateList" set="MembershipRules" />
        <WhenFieldChanges field="TemplateList" set="groupType" />
        <WhenFieldChanges field="TemplateList" set="username" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 3</h3>
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
                      <CListGroup flush>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Display Name: {props.values.Displayname}
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.Displayname ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Description: {props.values.Description}
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.Description ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Type: {props.values.Type}
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.Type ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                      </CListGroup>
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

export default ApplyGroupTemplate
