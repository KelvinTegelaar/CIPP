import { CSpinner, CButton } from '@coreui/react'
import {
  faEllipsisV,
  faTrashAlt,
  faExclamationTriangle,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellDateFormatter, cellNullTextFormatter } from 'src/components/tables'
import { CippActionsOffcanvas, ModalService } from 'src/components/utilities'
import GDAPRoles from 'src/data/GDAPRoles'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import Skeleton from 'react-loading-skeleton'

const RefreshAction = () => {
  const [execGdapInviteQueue, { isLoading, isSuccess, error }] = useLazyGenericGetRequestQuery()

  const showModal = () =>
    ModalService.confirm({
      body: <div>Process recently approved GDAP relationships?</div>,
      onConfirm: () =>
        execGdapInviteQueue({
          path: 'api/ExecGDAPInviteApproved',
        }),
    })

  return (
    <CButton onClick={showModal} size="sm" className="m-1">
      {isLoading && <CSpinner size="sm" />}
      {error && <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />}
      {isSuccess && <FontAwesomeIcon icon={faCheck} className="pe-1" />}
      Map recently approved relationships
    </CButton>
  )
}

const Actions = (row, rowIndex, formatExtraData) => {
  const [ocVisible, setOCVisible] = useState(false)
  const [getGdapInvite, gdapInvite] = useLazyGenericGetRequestQuery()

  function inviteProperty(gdapInvite, propertyName) {
    return (
      <>
        {gdapInvite.isFetching && <Skeleton count={1} width={150} />}
        {!gdapInvite.isFetching &&
          gdapInvite.isSuccess &&
          (gdapInvite.data[propertyName]?.toString() ?? ' ')}
      </>
    )
  }

  function loadOffCanvasDetails(id) {
    setOCVisible(true)
    getGdapInvite({
      path: 'api/ListGDAPInvite',
      params: { RelationshipId: id },
    })
  }
  var extendedInfo = []
  extendedInfo.push({
    label: 'Invite URL',
    value: inviteProperty(gdapInvite, 'InviteUrl'),
  })
  const tenant = useSelector((state) => state.app.currentTenant)

  row?.accessDetails?.unifiedRoles?.map((role) => {
    for (var x = 0; x < GDAPRoles.length; x++) {
      if (GDAPRoles[x].ObjectId == role.roleDefinitionId) {
        extendedInfo.push({
          label: GDAPRoles[x].Name,
          value: GDAPRoles[x].Description,
        })
        break
      }
    }
  })

  return (
    <>
      <CButton size="sm" color="link" onClick={() => loadOffCanvasDetails(row.id)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title={'GDAP - ' + row?.customer?.displayName}
        extendedInfo={extendedInfo}
        actions={[
          {
            label: 'Start Onboarding',
            color: 'primary',
            link:
              '/tenant/administration/tenant-onboarding-wizard?tableFilter=Complex: id eq ' +
              row.id,
          },
          {
            label: 'Open Relationship in Partner Center',
            color: 'info',
            link:
              'https://partner.microsoft.com/en-us/dashboard/commerce2/customers/' +
              row?.customer?.tenantId +
              '/adminrelationships/' +
              row.id,
            external: true,
          },
          {
            label: 'Enable automatic extension',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecAutoExtendGDAP?ID=${row.id}`,
            modalMessage: 'Are you sure you want to enable auto-extend for this relationship',
          },
          {
            label: 'Terminate Relationship',
            color: 'danger',
            modal: true,
            icon: <FontAwesomeIcon icon={faTrashAlt} className="me-2" />,
            modalUrl: `/api/ExecDeleteGDAPRelationship?GDAPID=${row.id}`,
            modalMessage: 'Are you sure you want to delete this relationship?',
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
const GDAPRelationships = () => {
  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row.customer?.displayName,
      sortable: true,
      exportSelector: 'customer/displayName',
      cell: cellNullTextFormatter(),
    },
    {
      name: 'Relationship Name',
      selector: (row) => row['displayName'],
      sortable: true,
      exportSelector: 'displayName',
    },
    {
      name: 'Status',
      selector: (row) => row['status'],
      sortable: true,
      exportSelector: 'status',
    },
    {
      name: 'Created',
      selector: (row) => row['createdDateTime'],
      sortable: true,
      exportSelector: 'createdDateTime',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'Activated',
      selector: (row) => row['activatedDateTime'],
      sortable: true,
      exportSelector: 'activatedDateTime',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'End',
      selector: (row) => row['endDateTime'],
      sortable: true,
      exportSelector: 'endDateTime',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'Auto Extend',
      selector: (row) => row['autoExtendDuration'],
      sortable: true,
      exportSelector: 'endDateTime',
      cell: (row) => (row['autoExtendDuration'] === 'PT0S' ? 'No' : 'Yes'),
    },
    {
      name: 'Includes CA Role',
      selector: (row) => row?.accessDetails,
      sortable: true,
      cell: (row) =>
        row?.accessDetails?.unifiedRoles?.filter(
          (e) => e.roleDefinitionId === '62e90394-69f5-4237-9190-012177145e10',
        ).length > 0
          ? 'Yes'
          : 'No',
    },
    {
      name: 'Actions',
      cell: Actions,
      maxWidth: '80px',
    },
  ]
  return (
    <div>
      <CippPageList
        titleButton={<RefreshAction />}
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="GDAP Relationship List"
        tenantSelector={false}
        datatable={{
          filterlist: [
            { filterName: 'Active Relationships', filter: 'Complex: status eq active' },
            { filterName: 'Terminated Relationships', filter: 'Complex: status eq terminated' },
            { filterName: 'Pending Relationships', filter: 'Pending' },
            {
              filterName: 'Active with Auto Extend',
              filter: 'Complex: status eq active; autoExtendDuration ne PT0S',
            },
            {
              filterName: 'Active without Auto Extend',
              filter: 'Complex: status eq active; autoExtendDuration eq PT0S',
            },
          ],
          tableProps: {
            selectableRows: true,
            actionsList: [
              {
                label: 'Terminate Relationship',
                modal: true,
                modalUrl: `/api/ExecDeleteGDAPRelationship?&GDAPID=!id`,
                modalMessage: 'Are you sure you want to terminate these relationships?',
              },
              {
                label: 'Auto Extend Relationship',
                modal: true,
                modalUrl: `/api/ExecAutoExtendGDAP?ID=!id`,
                modalMessage: 'Are you sure you want to enable automatic extension?',
              },
            ],
          },
          keyField: 'id',
          columns,
          reportName: `GDAP-Relationships`,
          path: '/api/ListGraphRequest',
          params: { Endpoint: 'tenantRelationships/delegatedAdminRelationships' },
        }}
      />
    </div>
  )
}

export default GDAPRelationships
