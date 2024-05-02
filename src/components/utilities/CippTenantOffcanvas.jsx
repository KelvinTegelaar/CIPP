import React, { useState } from 'react'
import { CButton, CTooltip } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faEllipsisV, faBuilding } from '@fortawesome/free-solid-svg-icons'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import Skeleton from 'react-loading-skeleton'
import Portals from 'src/data/portals'
import PropTypes from 'prop-types'

export const CippTenantOffcanvasRow = (row, rowIndex, formatExtraData) => {
  const tenant = row
  return CippTenantOffcanvas({ tenant: row })
}

function CippTenantOffcanvas({ tenant, buildingIcon = false }) {
  const [getTenantDetails, tenantDetails] = useLazyGenericGetRequestQuery()
  const [ocVisible, setOCVisible] = useState(false)

  function loadOffCanvasDetails(domainName) {
    setOCVisible(true)
    getTenantDetails({ path: `api/ListTenantDetails?tenantfilter=${domainName}` })
  }

  function tenantProperty(tenantDetails, propertyName) {
    return (
      <>
        {tenantDetails.isFetching && <Skeleton count={1} width={150} />}
        {!tenantDetails.isFetching &&
          tenantDetails.isSuccess &&
          (tenantDetails.data[propertyName]?.toString() ?? ' ')}
      </>
    )
  }

  const actions = Portals.map((portal) => ({
    icon: <FontAwesomeIcon icon={portal.icon} className="me-2" />,
    label: portal.label,
    external: true,
    color: 'info',
    link: portal.url.replace(portal.variable, tenant[portal.variable]),
  }))
  return (
    <>
      <CTooltip placement="bottom" content="Tenant Information">
        <CButton
          size="sm"
          variant="ghost"
          onClick={() => loadOffCanvasDetails(tenant.defaultDomainName)}
        >
          <FontAwesomeIcon icon={buildingIcon ? faBuilding : faEllipsisV} />
        </CButton>
      </CTooltip>
      <CippActionsOffcanvas
        title="Tenant Information"
        extendedInfo={[
          {
            label: 'Display Name',
            value: tenantProperty(tenantDetails, 'displayName'),
          },
          {
            label: 'Tenant ID',
            value: tenantProperty(tenantDetails, 'id'),
          },
          {
            label: 'Business Phones',
            value: tenantProperty(tenantDetails, 'businessPhones'),
          },
          {
            label: 'Technical Emails',
            value: tenantProperty(tenantDetails, 'technicalNotificationMails'),
          },
          {
            label: 'Tenant Type',
            value: tenantProperty(tenantDetails, 'tenantType'),
          },
          {
            label: 'Created',
            value: tenantProperty(tenantDetails, 'createdDateTime'),
          },
          {
            label: 'AD Connect Enabled',
            value: tenantProperty(tenantDetails, 'onPremisesSyncEnabled'),
          },
          {
            label: 'AD Connect Sync',
            value: tenantProperty(tenantDetails, 'onPremisesLastSyncDateTime'),
          },
          {
            label: 'AD Password Sync',
            value: tenantProperty(tenantDetails, 'onPremisesLastPasswordSyncDateTime'),
          },
        ]}
        actions={[
          {
            id: 'edittenant',
            icon: <FontAwesomeIcon icon={faEdit} className="me-2" />,
            label: 'Edit Tenant',
            link: `/tenant/administration/tenants/Edit?tenantFilter=${tenant.defaultDomainName}&customerId=${tenant.customerId}`,
            color: 'warning',
          },
          ...actions,
        ]}
        placement="end"
        visible={ocVisible}
        id={tenant.id}
        hideFunction={() => setOCVisible(false)}
      />
    </>
  )
}

CippTenantOffcanvas.propTypes = {
  tenant: PropTypes.object,
  buildingIcon: PropTypes.bool,
}

export default CippTenantOffcanvas
