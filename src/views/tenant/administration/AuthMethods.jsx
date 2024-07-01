import React, { useState } from 'react'
import { CButton, CCardBody, CSpinner, CCard, CCardHeader, CCardTitle } from '@coreui/react'
import { useSelector } from 'react-redux'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList, CippPage } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { useGenericGetRequestQuery } from 'src/store/api/app'
import { CippTable, cellBooleanFormatter } from 'src/components/tables'
import { CellTip, cellGenericFormatter } from 'src/components/tables/CellGenericFormat'

const columns = [
  {
    name: 'id',
    selector: (row) => row['id'],
    sortable: true,
    exportSelector: 'id',
  },
  {
    name: 'state',
    selector: (row) => row['state'],
    cell: cellBooleanFormatter({ colourless: false }),
    sortable: true,
    exportSelector: 'state',
    minWidth: '100px',
  },
  {
    name: 'includeTargets',
    selector: (row) => row['includeTargets'],
    sortable: true,
    cell: cellGenericFormatter(),
    exportSelector: 'includeTargets',
  },
  {
    name: 'excludeTargets',
    selector: (row) => row['excludeTargets'],
    sortable: true,
    cell: cellGenericFormatter(),
    exportSelector: 'excludeTargets',
  },
]

const AuthenticationMethods = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const { data, isFetching, error, isSuccess, refetch } = useGenericGetRequestQuery({
    path: 'api/ListGraphRequest',
    params: {
      Endpoint: 'authenticationMethodsPolicy',
      TenantFilter: tenant?.defaultDomainName,
    },
  })
  return (
    <>
      <CippPage title="Auth Methods" tenantSelector={true}>
        <CCard className="content-card">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <CCardTitle>Auth Methods</CCardTitle>
          </CCardHeader>
          <CCardBody>
            {isFetching && <CSpinner />}
            {isSuccess && (
              <CippTable
                reportName={`Auth Methods`}
                data={data?.Results[0]?.authenticationMethodConfigurations}
                columns={columns}
                refreshFunction={() => refetch()}
              />
            )}
          </CCardBody>
        </CCard>
      </CippPage>
    </>
  )
}

export default AuthenticationMethods
