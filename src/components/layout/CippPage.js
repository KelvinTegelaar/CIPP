import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { TenantSelector } from 'src/components/utilities'
import { CAlert, CCard, CCardBody, CCardHeader } from '@coreui/react'
import { CippDatatable } from 'src/components/tables'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { setCurrentTenant } from 'src/store/features/app'
import { useListTenantsQuery } from 'src/store/api/tenants'
import { queryString } from 'src/helpers'

export function CippPage({
  tenantSelector = true,
  title,
  children,
  titleButton = null,
  className = null,
}) {
  const { data: tenants = [], isSuccess } = useListTenantsQuery()
  const tenant = useSelector((state) => state.app.currentTenant)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const updateSearchParams = useCallback(
    (params) => {
      navigate(`${queryString(params)}`, { replace: true })
    },
    [navigate],
  )

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
        updateSearchParams({ customerId: tenant?.customerId })
      }
    }
  }, [dispatch, isSuccess, searchParams, tenant, tenantSelector, tenants, updateSearchParams])

  const handleTenantSelect = (tenant) => {
    setSearchParams({ customerId: tenant.customerId })
  }

  return (
    <div>
      {tenantSelector && <TenantSelector action={handleTenantSelect} />}
      {tenantSelector && <hr />}
      <CCard className={`page-card ${className ?? ''}`}>
        <CCardHeader component="h4" className="d-flex justify-content-between">
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
  className: PropTypes.string,
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
  children,
  className = null,
}) {
  return (
    <CippPage
      className={`datatable ${className ?? ''}`}
      tenantSelector={tenantSelector}
      title={title}
      titleButton={titleButton}
    >
      {children}
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
  ...CippPage.PropTypes,
  datatable: PropTypes.shape({
    reportName: PropTypes.string,
    path: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
    params: PropTypes.object,
  }),
}
