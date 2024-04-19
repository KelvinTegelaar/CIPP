import React, { useState } from 'react'
import { CCol, CRow, CListGroup, CListGroupItem, CCallout, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import {
  Condition,
  RFFCFormInput,
  RFFCFormRadio,
  RFFCFormSelect,
  RFFCFormTextarea,
} from 'src/components/forms'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { OnChange } from 'react-final-form-listeners'
import CippJsonView from 'src/components/utilities/CippJsonView'

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
const AddPolicy = () => {
  const [intuneGetRequest, intuneTemplates] = useLazyGenericGetRequestQuery()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    values.TemplateType = values.Type
    if (values.AssignTo === 'customGroup') {
      values.AssignTo = values.customGroup
    }
    genericPostRequest({ path: '/api/AddPolicy', values: values })
  }
  const [matchMap, setMatchMap] = useState([])
  const handleMap = (values) => {
    if (JSON.stringify(values) != JSON.stringify(matchMap)) {
      setMatchMap(values)
    }
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

  WhenFieldChanges.propTypes = {
    field: PropTypes.node,
    set: PropTypes.string,
  }

  const formValues = {
    TemplateType: 'Admin',
  }

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Add Intune policy"
    >
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants to create the policy for."
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose tenants</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants" validate={requiredArray}>
          {/* eslint-disable react/prop-types */}
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
          <h5 className="card-title mb-4">Enter the information for this policy</h5>
        </center>
        <hr className="my-4" />
        <CRow>
          <CCol md={12}>
            {intuneTemplates.isUninitialized &&
              intuneGetRequest({ path: 'api/ListIntuneTemplates' })}
            {intuneTemplates.isSuccess && (
              <RFFCFormSelect
                name="TemplateList"
                values={intuneTemplates.data?.map((template) => ({
                  value: template.GUID,
                  label: template.Displayname,
                }))}
                placeholder="Select a template"
                label="Please choose a template to apply."
              />
            )}
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <Condition when="RAWJson" regex="%.*%">
              <RFFCFormSelect
                name="Type"
                label="Select Policy Type"
                placeholder="Select a template type"
                values={[
                  { label: 'Administrative Template', value: 'Admin' },
                  { label: 'Settings Catalog', value: 'Catalog' },
                  { label: 'Custom Configuration', value: 'Device' },
                  { label: 'App Protection or Configuration Policy', value: 'AppProtection' },
                  { label: 'Compliance Policy', value: 'deviceCompliancePolicies' },
                ]}
              />
            </Condition>
          </CCol>
        </CRow>
        <CRow>
          <CCol md={12}>
            <RFFCFormInput
              type="text"
              name="Displayname"
              label="Policy Display Name"
              placeholder="Enter a name"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md={12}>
            <RFFCFormInput
              type="text"
              name="Description"
              label="Description"
              placeholder="leave blank for none"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md={12}>
            <Condition when="RAWJson" regex="%.*%">
              <RFFCFormTextarea
                type="text"
                name="RAWJson"
                label="Raw JSON"
                placeholder="Enter RAW JSON information"
              />
            </Condition>
          </CCol>
        </CRow>
        <FormSpy>
          {(props) => {
            console.log(props.values.RAWJson)
            const json = props.values?.RAWJson ? JSON.parse(props.values.RAWJson) : undefined
            return (
              <>
                <CippJsonView object={json} />
                <Condition when="RAWJson" regex="%.*%">
                  <CRow>
                    {props.values.RAWJson?.match('%.*%') &&
                      handleMap([...props.values.RAWJson.matchAll('%\\w+%')])}
                    {matchMap.map((varname) =>
                      props.values.selectedTenants.map((item, index) => (
                        <CCol md={6} key={index}>
                          <RFFCFormInput
                            type="text"
                            name={`replacemap.[${item.defaultDomainName}].${varname}`}
                            label={`Replace ${varname} for tenant ${item.defaultDomainName}`}
                          />
                        </CCol>
                      )),
                    )}
                  </CRow>
                </Condition>
              </>
            )
          }}
        </FormSpy>
        <RFFCFormRadio value="" name="AssignTo" label="Do not assign"></RFFCFormRadio>
        <RFFCFormRadio
          value="allLicensedUsers"
          name="AssignTo"
          label="Assign to all users"
        ></RFFCFormRadio>
        <RFFCFormRadio
          value="AllDevices"
          name="AssignTo"
          label="Assign to all devices"
        ></RFFCFormRadio>
        <RFFCFormRadio
          value="AllDevicesAndUsers"
          name="AssignTo"
          label="Assign to all users and devices"
        ></RFFCFormRadio>
        <RFFCFormRadio
          value="customGroup"
          name="AssignTo"
          label="Assign to Custom Group"
        ></RFFCFormRadio>
        <Condition when="AssignTo" is="customGroup">
          <RFFCFormInput
            type="text"
            name="customGroup"
            label="Custom Group Names separated by comma. Wildcards (*) are allowed"
          />
        </Condition>
        <hr className="my-4" />
        <WhenFieldChanges field="TemplateList" set="Description" />
        <WhenFieldChanges field="TemplateList" set="Displayname" />
        <WhenFieldChanges field="TemplateList" set="RAWJson" />
        <WhenFieldChanges field="TemplateList" set="Type" />
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
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Assign to: {props.values.AssignTo}
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.AssignTo ? faCheck : faTimes}
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

export default AddPolicy
