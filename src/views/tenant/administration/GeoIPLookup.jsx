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
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { CippContentCard, CippPageList } from 'src/components/layout'
import Skeleton from 'react-loading-skeleton'

const GeoIPLookup = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const ip = query.get('ip')
  const [ipaddress, setIpaddress] = useState(ip)
  const handleSubmit = async (values) => {
    setIpaddress(values.domain)
  }
  const [execGraphRequest, graphrequest] = useLazyGenericGetRequestQuery()

  useEffect(() => {
    if (ipaddress) {
      execGraphRequest({
        path: 'api/ExecGeoIPLookup',
        params: {
          IP: ipaddress,
        },
      })
    }
  }, [execGraphRequest, tenant.defaultDomainName, query, ipaddress, ip])
  const [execAddIp, iprequest] = useLazyGenericGetRequestQuery()

  const addTrustedIP = (State) => {
    execAddIp({
      path: 'api/ExecAddTrustedIP',
      params: {
        IP: ipaddress,
        TenantFilter: tenant.defaultDomainName,
        State: State,
      },
    })
  }

  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['PartitionKey'],
      sortable: true,
      exportSelector: 'PartitionKey',
    },
    {
      name: 'IP',
      selector: (row) => row['RowKey'],
      sortable: true,
      exportSelector: 'RowKey',
    },
    {
      name: 'State',
      selector: (row) => row.state,
      sortable: true,
      exportSelector: 'state',
    },
  ]
  return (
    <>
      <CRow>
        <CCol xs={6} className="mb-3">
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
      </CRow>
      <CRow>
        <CCol className="mb-3" xs={6}>
          <CippPageList
            capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
            title="Whitelisted IPs"
            tenantSelector={false}
            showAllTenantSelector={false}
            datatable={{
              reportName: `${tenant?.defaultDomainName}-IP`,
              path: '/api/ListIPWhitelist',
              columns,
            }}
          />
        </CCol>
        {ipaddress && (
          <CCol xs={6} className="mb-3">
            <CippContentCard title="Current IP information" icon={faBook}>
              <CRow>
                <CCol sm={12} md={4} className="mb-3">
                  <p className="fw-lighter">IP Address</p>
                  {graphrequest.isFetching && <Skeleton />}
                  {ipaddress}
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
                  <p className="fw-lighter">Map Location</p>
                  {graphrequest.isFetching && <Skeleton />}

                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps/search/${graphrequest.data?.lat}+${graphrequest.data?.lon}`}
                  >
                    {graphrequest.data?.lat} / {graphrequest.data?.lon}
                  </a>
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
                </CCol>
                <CCol className="mb-3">
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
    </>
  )
}

export default GeoIPLookup
