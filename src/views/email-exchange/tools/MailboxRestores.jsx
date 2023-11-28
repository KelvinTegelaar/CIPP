import { CButton } from '@coreui/react'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellDateFormatter } from 'src/components/tables'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import Skeleton from 'react-loading-skeleton'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'

const Actions = (row, rowIndex, formatExtraData) => {
  const [ocVisible, setOCVisible] = useState(false)
  const [getMailboxRestoreStats, mailboxRestoreStats] = useLazyGenericGetRequestQuery()
  const tenant = useSelector((state) => state.app.currentTenant)

  function statProperty(mailboxRestoreStats, propertyName) {
    return (
      <>
        {mailboxRestoreStats.isFetching && <Skeleton count={1} width={150} />}
        {!mailboxRestoreStats.isFetching &&
          mailboxRestoreStats.isSuccess &&
          (mailboxRestoreStats?.data[0][propertyName]?.toString() ?? ' ')}
      </>
    )
  }

  function loadOffCanvasDetails(id) {
    setOCVisible(true)
    getMailboxRestoreStats({
      path: 'api/ListMailboxRestores',
      params: {
        TenantFilter: tenant.defaultDomainName,
        Identity: id,
        Statistics: true,
        IncludeReport: true,
      },
    })
  }
  var extendedInfo = [
    { label: 'Status', value: statProperty(mailboxRestoreStats, 'Status') },
    { label: 'Status Detail', value: statProperty(mailboxRestoreStats, 'StatusDetail') },
    { label: 'Sync Stage', value: statProperty(mailboxRestoreStats, 'SyncStage') },
    { label: 'Data Consistency', value: statProperty(mailboxRestoreStats, 'DataConsistencyScore') },
    {
      label: 'Estimated Transfer',
      value: statProperty(mailboxRestoreStats, 'EstimatedTransferSize'),
    },
    {
      label: 'Bytes Transferred',
      value: statProperty(mailboxRestoreStats, 'BytesTransferred'),
    },
    {
      label: 'Percent Complete',
      value: statProperty(mailboxRestoreStats, 'PercentComplete'),
    },
    {
      label: 'Estimated Item Count',
      value: statProperty(mailboxRestoreStats, 'EstimatedTransferItemCount'),
    },
    {
      label: 'Transferred Items',
      value: statProperty(mailboxRestoreStats, 'ItemsTransferred'),
    },
  ]

  return (
    <>
      <CButton size="sm" color="link" onClick={() => loadOffCanvasDetails(row.Identity)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="Mailbox Restore"
        extendedInfo={extendedInfo}
        actions={[
          {
            modal: true,
            modalType: 'codeblock',
            modalBody: mailboxRestoreStats?.data ? mailboxRestoreStats?.data[0]?.Report : '',
            label: 'Show Report',
            color: 'info',
          },
          {
            label: 'Resume Restore Request',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecMailboxRestore?TenantFilter=${tenant.defaultDomainName}&Identity=${row.Identity}&Action=Resume`,
            modalMessage: 'Are you sure you want to resume this restore request?',
          },
          {
            label: 'Suspend Restore Request',
            color: 'warning',
            modal: true,
            modalUrl: `/api/ExecMailboxRestore?TenantFilter=${tenant.defaultDomainName}&Identity=${row.Identity}&Action=Suspend`,
            modalMessage: 'Are you sure you want to suspend this restore request?',
          },
          {
            label: 'Remove Restore Request',
            color: 'danger',
            modal: true,
            modalUrl: `/api/ExecMailboxRestore?TenantFilter=${tenant.defaultDomainName}&Identity=${row.Identity}&Action=Remove`,
            modalMessage: 'Are you sure you want to remove this restore request?',
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

const MailboxRestores = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const columns = [
    {
      name: 'Name',
      selector: (row) => row['Name'],
      sortable: true,
      exportSelector: 'Name',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Status',
      selector: (row) => row['Status'],
      sortable: true,
      exportSelector: 'Status',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Target Mailbox',
      selector: (row) => row['TargetMailbox'],
      sortable: true,
      exportSelector: 'TargetMailbox',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Created',
      selector: (row) => row['WhenCreated'],
      sortable: true,
      exportSelector: 'WhenCreated',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'Changed',
      selector: (row) => row['WhenChanged'],
      sortable: true,
      exportSelector: 'WhenChanged',
      cell: cellDateFormatter({ format: 'short' }),
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
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Mailbox Restores"
        tenantSelector={false}
        datatable={{
          filterlist: [{ filterName: 'Completed', filter: 'Complex: Status eq Completed' }],
          tableProps: {},
          keyField: 'id',
          columns,
          reportName: `MailboxRestores`,
          path: '/api/ListMailboxRestores',
          params: { TenantFilter: tenant.defaultDomainName },
        }}
      />
    </div>
  )
}

export default MailboxRestores
