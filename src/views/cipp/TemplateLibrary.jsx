import React, { useState } from 'react'
import { CAlert, CButton, CCallout, CCol, CForm, CRow, CSpinner, CTooltip } from '@coreui/react'
import { useSelector } from 'react-redux'
import { Field, Form } from 'react-final-form'
import { RFFCFormInput, RFFCFormSwitch } from 'src/components/forms'
import {
  useGenericGetRequestQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEdit, faEye } from '@fortawesome/free-solid-svg-icons'
import { CippPage, CippPageList } from 'src/components/layout'
import 'react-datepicker/dist/react-datepicker.css'
import { ModalService, TenantSelector } from 'src/components/utilities'
import arrayMutators from 'final-form-arrays'
import { useListConditionalAccessPoliciesQuery } from 'src/store/api/tenants'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'
import { CellTip, cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { cellBadgeFormatter, cellDateFormatter } from 'src/components/tables'
import { Alert } from '@coreui/coreui'

const TemplateLibrary = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [refreshState, setRefreshState] = useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const onSubmit = (values) => {
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    const unixTime = Math.floor(startDate.getTime() / 1000) - 45
    const shippedValues = {
      TenantFilter: tenantDomain,
      Name: `CIPP Template ${tenantDomain}`,
      Command: { value: `New-CIPPTemplateRun` },
      Parameters: { TemplateSettings: { ...values } },
      ScheduledTime: unixTime,
      Recurrence: { value: '4h' },
    }
    genericPostRequest({
      path: '/api/AddScheduledItem?DisallowDuplicateName=true',
      values: shippedValues,
    }).then((res) => {
      setRefreshState(res.requestId)
    })
  }

  const {
    data: caPolicies = [],
    isFetching: caIsFetching,
    error: caError,
  } = useListConditionalAccessPoliciesQuery({ domain: tenantDomain })

  return (
    <CippPage title={`Add Backup Schedule`} tenantSelector={false}>
      <>
        <CRow>
          <CCol md={6}>
            <CippButtonCard
              CardButton={
                <CButton type="submit" form="addTask">
                  Set Tenant as Template Library
                  {postResults.isFetching && (
                    <FontAwesomeIcon icon={faCircleNotch} spin className="ms-2" size="1x" />
                  )}
                </CButton>
              }
              title="Add Template Library"
              icon={faEdit}
            >
              <Form
                onSubmit={onSubmit}
                mutators={{
                  ...arrayMutators,
                }}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm id="addTask" onSubmit={handleSubmit}>
                      <p>
                        Template libraries are tenants setup to retrieve the latest version of
                        policies from. By setting a tenant as a template library, automatic updates
                        will be made to the templates within CIPP based on this template library
                        every 4 hours.
                        <CAlert className="m-3" color="warning">
                          Enabling this feature will overwrite templates with the same name.
                        </CAlert>
                      </p>
                      <CRow className="mb-3">
                        <CCol>
                          <label>Tenant</label>
                          <Field name="tenantFilter">
                            {(props) => <TenantSelector showAllTenantSelector={false} />}
                          </Field>
                        </CCol>
                      </CRow>
                      <CRow>
                        <hr />
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <h3 className="underline mb-4">Conditional Access</h3>
                          <RFFCFormSwitch name="ca" label="Create Conditional Access Templates" />
                          <h3 className="underline mb-4">Intune</h3>
                          <RFFCFormSwitch
                            name="intuneconfig"
                            label="Create Intune Configuration Templates "
                          />
                          <RFFCFormSwitch
                            name="intunecompliance"
                            label="Create Intune Compliance Templates"
                          />
                          <RFFCFormSwitch
                            name="intuneprotection"
                            label="Create Intune Protection Templates"
                          />
                        </CCol>
                      </CRow>
                      {postResults.isSuccess && (
                        <CCallout color="success">
                          <li>{postResults.data.Results}</li>
                        </CCallout>
                      )}
                      {getResults.isFetching && (
                        <CCallout color="info">
                          <CSpinner>Loading</CSpinner>
                        </CCallout>
                      )}
                      {getResults.isSuccess && (
                        <CCallout color="info">{getResults.data?.Results}</CCallout>
                      )}
                      {getResults.isError && (
                        <CCallout color="danger">
                          Could not connect to API: {getResults.error.message}
                        </CCallout>
                      )}
                    </CForm>
                  )
                }}
              />
            </CippButtonCard>
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default TemplateLibrary
