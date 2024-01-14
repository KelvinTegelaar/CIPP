import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCallout,
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

const GeoIPLookup = () => {
  let navigate = useNavigate()
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const ip = query.get('ip')
  const SearchNow = query.get('SearchNow')
  const [visibleA, setVisibleA] = useState(true)
  const handleSubmit = async (values) => {
    setVisibleA(false)

    const shippedValues = {
      ip: values.domain,
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
    if (ip) {
      execGraphRequest({
        path: 'api/ExecGeoIPLookup',
        params: {
          IP: ip,
        },
      })
    }
  }, [execGraphRequest, tenant.defaultDomainName, query, ip])
  const [execAddIp, iprequest] = useLazyGenericGetRequestQuery()

  const addTrustedIP = (State) => {
    execAddIp({
      path: 'api/ExecAddTrustedIP',
      params: {
        IP: ip,
        TenantFilter: tenant.defaultDomainName,
        State: State,
      },
    })
  }

  return (
    <CRow>
      <CCol xs={4}>
        <CCard className="content-card">
          <CCardHeader>
            <CCardTitle>
              <FontAwesomeIcon icon={faSearch} className="mx-2" />
              Geo IP Lookup
            </CCardTitle>
          </CCardHeader>
          <CCardBody>
            <Form
              onSubmit={handleSubmit}
              render={({ handleSubmit, submitting, pristine }) => {
                return (
                  <CForm onSubmit={handleSubmit}>
                    <Field name="domain">
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
                                placeholder="IP Address"
                                area-describedby="IP Address"
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
      {ip && (
        <CCol>
          <CippContentCard title="Current IP information" icon={faBook}>
            <CRow>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">IP Address</p>
                {graphrequest.isFetching && <Skeleton />}
                {ip}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">AS</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.as}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Owner</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.org}
              </CCol>
            </CRow>
            <CRow>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">ISP</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.isp}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Geo IP Location</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.country} - {graphrequest.data?.city}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Lat/Lon</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.lat} / {graphrequest.data?.lon}
              </CCol>
            </CRow>
            <CRow>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Hosting</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.hosting ? 'Yes' : 'No'}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Mobile</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.mobile ? 'Yes' : 'No'}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Proxy or Anonimizer</p>
                {graphrequest.isFetching && <Skeleton />}
                {graphrequest.data?.proxy ? 'Yes' : 'No'}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol className="mb-3">
                <CButton color="primary" onClick={() => addTrustedIP('Trusted')} className="me-3">
                  Add as trusted IP for selected tenant
                  {iprequest.isFetching && <CSpinner size="sm" />}
                </CButton>
                <CButton
                  className="me-3"
                  color="primary"
                  onClick={() => addTrustedIP('NotTrusted')}
                >
                  Remove as trusted IP for selected tenant
                  {iprequest.isFetching && <CSpinner size="sm" />}
                </CButton>
              </CCol>
            </CRow>
            {iprequest.data && (
              <CCallout color="info" className="mt-3">
                {iprequest.data?.results}
              </CCallout>
            )}
          </CippContentCard>
        </CCol>
      )}
    </CRow>
  )
}

export default GeoIPLookup
