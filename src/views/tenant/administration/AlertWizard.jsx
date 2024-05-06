import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CRow,
  CSpinner,
  CWidgetStatsA,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { useDispatch } from 'react-redux'
import { Form } from 'react-final-form'
import { CippPage } from 'src/components/layout'
import { ModalService, TenantSelectorMultiple } from 'src/components/utilities'
import { RFFCFormInput } from 'src/components/forms/RFFComponents'
import { useListTenantQuery } from 'src/store/api/tenants'
import {
  useLazyExecPermissionsAccessCheckQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import CippPrettyCard from 'src/components/contentcards/CippPrettyCard'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'

const AlertWizard = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const tenantDomain = query.get('tenantFilter')
  const customerId = query.get('customerId')
  const [queryError, setQueryError] = useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const {
    data: tenant = {},
    isFetching,
    error,
    isSuccess,
  } = useListTenantQuery(tenantDomain, customerId)

  const onSubmit = (values) => {
    const shippedValues = {
      tenantid: tenantDomain,
      displayName: values.displayName,
      defaultDomainName: values.defaultDomainName,
      customerId: customerId,
    }
    genericPostRequest({ path: '/api/AlertWizard', values: shippedValues })
  }
  const initialValues = {
    ...tenant[0],
  }
  return (
    <CippPage title="Tenant Details" tenantSelector={false}>
      {!queryError && (
        <>
          <CRow className="mb-3">
            <CCol md={2}>
              <CippButtonCard title="Audit Log Alert">
                Select this option if you'd like to create an alert based on a received Microsoft
                Audit log.
              </CippButtonCard>
            </CCol>
            <CCol md={2}>
              <CippPrettyCard title="CIPP Alert" titleType="big" percentage={10} />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={4}>
              <CippButtonCard title="Tenant Selector" titleType="big" percentage={10}>
                <TenantSelectorMultiple />
              </CippButtonCard>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Current Settings</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {isFetching && <CSpinner />}
                  {error && <span>Error loading Tenant</span>}
                  {isSuccess && (
                    <Form
                      initialValues={{ ...initialValues }}
                      onSubmit={onSubmit}
                      render={({ handleSubmit, submitting, values }) => {
                        return (
                          <CForm onSubmit={handleSubmit}>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput
                                  type="text"
                                  name="displayName"
                                  label="Display Name"
                                />
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CCol md={6}>
                                <CButton type="submit" disabled={submitting}>
                                  Edit Tenant
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
                            </CRow>
                            {postResults.isSuccess && (
                              <CCallout color="success">{postResults.data.Results}</CCallout>
                            )}
                          </CForm>
                        )
                      }}
                    />
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </CippPage>
  )
}

export default AlertWizard
