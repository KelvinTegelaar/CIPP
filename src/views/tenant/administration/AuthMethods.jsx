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

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  const formatTargets = (targets) => {
    if (Array.isArray(targets)) {
      return targets.map((target) => JSON.stringify(target)).join(', ')
    }
    return targets
  }

  return (
    <>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="Extended Information"
        extendedInfo={[
          { label: 'id', value: `${row.id}` },
          { label: 'state', value: `${row.state}` },
          { label: 'includeTargets', value: formatTargets(row.includeTargets) },
          { label: 'excludeTargets', value: formatTargets(row.excludeTargets) },
        ]}
        actions={[
          {
            label: 'Enable Policy',
            color: 'info',
            modal: true,
            modalType: 'POST',
            modalBody: {
              id: row.id,
              state: 'enabled',
              TenantFilter: tenant.defaultDomainName,
            },
            modalUrl: `/api/SetAuthMethod`,
            modalMessage: 'Are you sure you want to enable this policy?',
          },
          {
            label: 'Disable Policy',
            color: 'info',
            modal: true,
            modalType: 'POST',
            modalBody: {
              id: row.id,
              state: 'disabled',
              TenantFilter: tenant.defaultDomainName,
            },
            modalUrl: `/api/SetAuthMethod`,
            modalMessage: 'Are you sure you want to enable this policy?',
          },
        ]}
        placement="end"
        visible={ocVisible}
        id={row.id}
        hideFunction={() => setOCVisible(false)}
      />
    </>
  )
}

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
  {
    name: 'Actions',
    cell: Offcanvas,
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
