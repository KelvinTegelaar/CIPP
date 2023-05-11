import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CCollapse,
  CForm,
  CFormInput,
  CInputGroup,
  CRow,
  CSpinner,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { Field, Form } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faSearch } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { CippContentCard } from 'src/components/layout'
import Skeleton from 'react-loading-skeleton'
import { domainsApi } from 'src/store/api/domains'

const GraphExplorer = () => {
  let navigate = useNavigate()
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const tenantdomain = query.get('tenant')
  const SearchNow = query.get('SearchNow')
  const [visibleA, setVisibleA] = useState(true)
  const handleSubmit = async (values) => {
    setVisibleA(false)

    const shippedValues = {
      tenant: values.domain,
      SearchNow: true,
      random: (Math.random() + 1).toString(36).substring(7),
    }
    var queryString = Object.keys(shippedValues)
      .map((key) => key + '=' + shippedValues[key])
      .join('&')

    navigate(`?${queryString}`)
  }
  const [execGraphRequest, graphrequest] = useLazyGenericGetRequestQuery()

  useEffect(() => {
    if (tenantdomain) {
      execGraphRequest({
        path: 'api/ListExternalTenantInfo',
        params: {
          tenant: tenantdomain,
        },
      })
    }
  }, [execGraphRequest, tenant.defaultDomainName, query, tenantdomain])
  const isValidDomain = (value) =>
    /^(((?!-))(xn--|_{1,1})?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$/i.test(
      value,
    )
      ? undefined
      : value

  return (
    <CRow>
      <CCol xs={4}>
        <CCard className="content-card">
          <CCardHeader>
            <CCardTitle>
              <FontAwesomeIcon icon={faSearch} className="mx-2" />
              Domain
            </CCardTitle>
          </CCardHeader>
          <CCardBody>
            <Form
              onSubmit={handleSubmit}
              render={({ handleSubmit, submitting, pristine }) => {
                return (
                  <CForm onSubmit={handleSubmit}>
                    <Field name="domain" validate={isValidDomain}>
                      {({ input, meta }) => {
                        return (
                          <>
                            <CInputGroup className="mb-3">
                              <CFormInput
                                {...input}
                                valid={!meta.error && meta.touched}
                                invalid={meta.error && meta.touched}
                                type="text"
                                id="domain"
                                placeholder="Domain Name"
                                area-describedby="domain"
                                autoCapitalize="none"
                                autoCorrect="off"
                              />
                              <CButton type="submit" color="primary">
                                Check{graphrequest.isFetching && <CSpinner size="sm" />}
                              </CButton>
                            </CInputGroup>
                          </>
                        )
                      }}
                    </Field>
                  </CForm>
                )
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
      {tenantdomain && (
        <CCol>
          <CippContentCard title="Current Tenant" icon={faBook}>
            <CRow>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Tenant Name</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.GraphRequest.displayName}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Tenant ID</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.GraphRequest.tenantId}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Default Domain Name</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.GraphRequest.defaultDomainName}
              </CCol>
            </CRow>
            <CRow>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Tenant Brand Name</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.GraphRequest.federationBrandName}
                {graphrequest.data?.GraphRequest.federationBrandName === null &&
                  'No brand name set'}
              </CCol>
              <CCol sm={8} md={8} className="mb-3">
                <p className="fw-lighter">Domains</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.Domains &&
                  graphrequest.data?.Domains.map((domainname) => <li>{domainname}</li>)}
              </CCol>
            </CRow>
          </CippContentCard>
        </CCol>
      )}
    </CRow>
  )
}

export default GraphExplorer
