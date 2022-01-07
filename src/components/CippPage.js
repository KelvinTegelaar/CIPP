import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import TenantSelector from './cipp/TenantSelector'
import { CAlert, CCard, CCardBody, CCardHeader } from '@coreui/react'
import CippDatatable from './cipp/CippDatatable'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { setCurrentTenant } from '../store/features/app'
import { useListTenantsQuery } from '../store/api/tenants'

export function CippPage({ tenantSelector = true, title, children, titleButton = null }) {
  const { data: tenants = [], isSuccess } = useListTenantsQuery()
  const tenant = useSelector((state) => state.app.currentTenant)
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useDispatch()

  useEffect(() => {
    if (tenantSelector) {
      const customerId = searchParams.get('customerId')
      if (customerId && isSuccess) {
        const currentTenant = tenants.filter((tenant) => tenant.customerId === customerId)
        if (currentTenant.length > 0) {
          dispatch(setCurrentTenant({ tenant: currentTenant[0] }))
        }
      }
      if (!customerId && Object.keys(tenant).length > 0) {
        setSearchParams({ customerId: tenant?.customerId })
      }
    }
  }, [searchParams, dispatch, tenants, isSuccess, tenant, setSearchParams, tenantSelector])

  const handleTenantSelect = (tenant) => {
    setSearchParams({ customerId: tenant.customerId })
  }

  return (
    <div>
      {tenantSelector && <TenantSelector action={handleTenantSelect} />}
      {tenantSelector && <hr />}
      <CCard className="page-card">
        <CCardHeader component="h3" className="d-flex justify-content-between">
          {title}
          {titleButton}
        </CCardHeader>
        <CCardBody>
          {tenantSelector && Object.keys(tenant).length === 0 ? (
            <CAlert className="mb-0" color="warning">
              Select a tenant to get started.
            </CAlert>
          ) : (
            children
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}

CippPage.propTypes = {
  tenantSelector: PropTypes.bool,
  title: PropTypes.string,
  children: PropTypes.node,
  titleButton: PropTypes.node,
}

export function CippPageList({
  tenantSelector = true,
  title,
  titleButton,
  // see CippDatatable for full list
  datatable: { reportName, path, columns, params, ...rest },
}) {
  return (
    <CippPage tenantSelector={tenantSelector} title={title} titleButton={titleButton}>
      <CippDatatable
        reportName={reportName}
        path={path}
        columns={columns}
        params={params}
        {...rest}
      />
    </CippPage>
  )
}

CippPageList.propTypes = {
  tenantSelector: PropTypes.bool,
  title: PropTypes.string.isRequired,
  titleButton: PropTypes.element,
  datatable: PropTypes.shape({
    reportName: PropTypes.string,
    path: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
    params: PropTypes.object,
  }),
}
