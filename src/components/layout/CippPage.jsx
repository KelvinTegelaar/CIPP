import React from 'react'
import PropTypes from 'prop-types'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'
import { CippDatatable } from 'src/components/tables'
import { useSelector } from 'react-redux'

export function CippPage({
  tenantSelector = false,
  showAllTenantSelector = false,
  title,
  children,
  titleButton = null,
  wizard = false,
}) {
  return (
    <div>
      <>
        {wizard && (
          <CCard className="content-card">
            <CCardBody>{children}</CCardBody>
          </CCard>
        )}
        {!wizard && <CCardBody>{children}</CCardBody>}
      </>
    </div>
  )
}

CippPage.propTypes = {
  className: PropTypes.string,
  tenantSelector: PropTypes.bool,
  showAllTenantSelector: PropTypes.bool,
  title: PropTypes.string,
  children: PropTypes.node,
  titleButton: PropTypes.node,
  wizard: PropTypes.bool,
}

export function CippPageList({
  title,
  titleButton,
  // see CippDatatable for full list
  datatable: { reportName, path, columns, params, ...rest },
  children,
  capabilities = { allTenants: false },
}) {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <>
      {!capabilities.allTenants && tenant.defaultDomainName === 'AllTenants' ? (
        'This page does not yet support the All Tenants overview. Please use the tenant selector to select a tenant.'
      ) : (
        <>
          {children}
          <CCard className="content-card">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <CCardTitle>{title}</CCardTitle>
              {titleButton ? titleButton : null}
            </CCardHeader>
            <CCardBody>
              <CippDatatable
                reportName={reportName}
                path={path}
                columns={columns}
                params={params}
                {...rest}
              />
            </CCardBody>
          </CCard>
        </>
      )}
    </>
  )
}

CippPageList.propTypes = {
  ...CippPage.PropTypes,
  capabilities: PropTypes.shape({
    allTenants: PropTypes.bool,
    helpContext: PropTypes.string,
  }),
  datatable: PropTypes.shape({
    reportName: PropTypes.string,
    path: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
    params: PropTypes.object,
  }),
}
