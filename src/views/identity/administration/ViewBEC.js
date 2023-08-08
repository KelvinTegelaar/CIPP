import React, { useEffect } from 'react'
import { CButton, CCallout, CLink } from '@coreui/react'
import { CCardBody, CSpinner } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faRedo,
  faTimesCircle,
  faLaptop,
  faKey,
  faForward,
  faUsers,
  faAsterisk,
  faIdBadge,
  faWindowRestore,
  faSignInAlt,
} from '@fortawesome/free-solid-svg-icons'
import { useLazyExecBecCheckQuery } from 'src/store/api/users'
import useQuery from 'src/hooks/useQuery'
import { CippTable } from 'src/components/tables'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { CippContentCard, CippMasonry, CippMasonryItem, CippPage } from 'src/components/layout'
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton'
import useConfirmModal from 'src/hooks/useConfirmModal'

const ViewBec = () => {
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')
  const [execBecRemediate, execRemediateResults] = useLazyGenericPostRequestQuery()
  const [execBecView, results] = useLazyExecBecCheckQuery()
  const { data: alerts = {}, isFetching, error, isSuccess } = results
  useEffect(() => {
    execBecView({ tenantFilter: tenantDomain, userId: userId })
  }, [execBecView, tenantDomain, userId])

  const deviceColumns = [
    {
      name: 'Device Model',
      selector: (row) => row['DeviceModel'],
      sortable: true,
    },
    {
      name: 'First Sync Time',
      selector: (row) => row['FirstSyncTime'],
      sortable: true,
    },
    {
      name: 'Device User Agent',
      selector: (row) => row['DeviceUserAgent'],
      sortable: true,
    },
  ]

  const rulesColumns = [
    {
      name: 'Creator IP',
      selector: (row) => row['ClientIP'],
      sortable: true,
      grow: 0,
    },
    {
      name: 'Rule Name',
      selector: (row) => row['RuleName'],
      sortable: true,
    },
    {
      name: 'Rule Conditions',
      selector: (row) => row['RuleCondition'],
      sortable: true,
    },
    {
      name: 'Created on',
      selector: (row) => row['CreationTime'],
      sortable: true,
    },
    {
      name: 'Created for',
      selector: (row) => row['UserId'],
      sortable: true,
    },
  ]

  const logonColumns = [
    {
      name: 'App',
      selector: (row) => row['AppDisplayName'],
      sortable: true,
    },
    {
      name: 'Date Time',
      selector: (row) => row['CreatedDateTime'],
      sortable: true,
    },
    {
      name: 'Error code',
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: 'Details',
      selector: (row) => row.Status,
      sortable: true,
    },
  ]

  const mailboxlogonColumns = [
    {
      name: 'IP',
      selector: (row) => row['ClientIP'],
      sortable: true,
    },
    {
      name: 'User',
      selector: (row) => row['CreatedDateTime'],
      sortable: true,
    },
    {
      name: 'User Agent',
      selector: (row) => row['ClientInfoString'],
      sortable: true,
    },
    {
      name: 'Result',
      selector: (row) => row['ResultStatus'],
      sortable: true,
    },
    {
      name: 'Data',
      selector: (row) => row['CreationTime'],
      sortable: true,
    },
  ]
  const newUserColumns = [
    {
      name: 'Username',
      selector: (row) => row['ObjectId'],
      sortable: true,
    },
    {
      name: 'Date',
      selector: (row) => row['CreationTime'],
      sortable: true,
    },
    {
      name: 'By',
      selector: (row) => row['UserId'],
      sortable: true,
    },
  ]

  const passwordColumns = [
    {
      name: 'Username',
      selector: (row) => row['ObjectId'],
      sortable: true,
    },
    {
      name: 'Date',
      selector: (row) => row['CreationTime'],
      sortable: true,
    },
    {
      name: 'Operation',
      selector: (row) => row['Operation'],
      sortable: true,
    },
    {
      name: 'By',
      selector: (row) => row['UserId'],
      sortable: true,
    },
  ]

  const permissionColumns = [
    {
      name: 'Operation',
      selector: (row) => row['Operation'],
      sortable: true,
    },
    {
      name: 'Executed by',
      selector: (row) => row['UserKey'],
      sortable: true,
    },
    {
      name: 'Executed on',
      selector: (row) => row['ObjectId'],
      sortable: true,
    },
    {
      name: 'Permissions',
      selector: (row) => row['Permissions'],
      sortable: true,
    },
  ]

  const appColumns = [
    {
      name: 'Type',
      selector: (row) => row['Operation'],
      sortable: true,
    },
    {
      name: 'User',
      selector: (row) => row['UserId'],
      sortable: true,
    },
    {
      name: 'Application',
      selector: (row) => row['ObjectId'],
      sortable: true,
    },
    {
      name: 'Result',
      selector: (row) => row['ResultStatus'],
      sortable: true,
    },
  ]
  const handleReMediate = useConfirmModal({
    body: <div>Are you sure you want to remediate this user?</div>,
    onConfirm: () => {
      execBecRemediate({
        path: '/api/execBecRemediate',
        values: { userId: userId, tenantFilter: tenantDomain },
      })
    },
  })
  return (
    <CippPage tenantSelector={false} title="View Business Email Compromise Indicators">
      <CippMasonry columns={2}>
        <CippMasonryItem size="full">
          <CippContentCard
            title="Business Email Compromise Overview"
            button={
              <CButton
                size="sm"
                onClick={() =>
                  execBecView({ tenantFilter: tenantDomain, userId: userId, overwrite: true })
                }
                disabled={isFetching}
              >
                {!isFetching && <FontAwesomeIcon icon={faRedo} className="me-2" />}
                Refresh Data
              </CButton>
            }
          >
            <CCallout color="info">
              Loading Data: {isFetching && <CSpinner />}
              {!isFetching && error && <FontAwesomeIcon icon={faTimesCircle} />}
              {isSuccess && (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Data has been extracted at {alerts.ExtractedAt}
                </>
              )}
            </CCallout>
            <p>
              Use this information as a guide to check if a tenant or e-mail address might have been
              compromised. All data is retrieved from the last 7 days of logs.
            </p>
            <p>
              If you need more extensive information, run the{' '}
              <CLink href="https://cloudforensicator.com/">HAWK</CLink> tool to investigate further
              if you believe this user to be compromised.
            </p>
            <p>
              Hit the button below to execute the following tasks:
              <li>Block user signin</li>
              <li>Reset user password</li>
              <li>Disconnect all current sessions</li>
              <li>Disable all inbox rules for the user</li>
            </p>
            <CButton onClick={() => handleReMediate()}>Remediate User</CButton>
            {!execRemediateResults.isSuccess && execRemediateResults.isError && (
              <CCallout color="danger">Error. Could not remediate user</CCallout>
            )}
            {execRemediateResults.isFetching && (
              <CCallout color="info">
                <CSpinner />
              </CCallout>
            )}
            {execRemediateResults.isSuccess && (
              <CCallout color="info">{execRemediateResults.data?.Results}</CCallout>
            )}
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="half">
          <CippContentCard title="User Devices" icon={faLaptop}>
            {isFetching && <Skeleton count={5} />}
            {isSuccess && (
              <CippTable
                keyField="ID"
                columns={deviceColumns}
                data={alerts.SuspectUserDevices}
                striped
                responsive={true}
                tableProps={{ subHeaderComponent: false, pagination: false }}
                wrapperClasses="table-responsive"
                reportName="none"
              />
            )}
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="half">
          <CippContentCard title="Recently Added Email Forwarding Rules" icon={faForward}>
            {isFetching && <Skeleton count={5} />}

            {isSuccess && (
              <CippTable
                keyField="ID"
                columns={rulesColumns}
                data={alerts.NewRules}
                striped
                responsive={true}
                tableProps={{ subHeaderComponent: false }}
                wrapperClasses="table-responsive"
                reportName="none"
              />
            )}
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="half">
          <CippContentCard title="User Last Logon Details" icon={faKey}>
            {isFetching && <Skeleton count={5} />}

            <CCardBody>
              {isSuccess && (
                <CippTable
                  keyField="ID"
                  columns={logonColumns}
                  data={alerts.LastSuspectUserLogon}
                  striped
                  responsive={true}
                  tableProps={{ subHeaderComponent: false }}
                  wrapperClasses="table-responsive"
                  reportName="none"
                />
              )}
            </CCardBody>
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="half">
          <CippContentCard title="Recently Added Users" icon={faUsers}>
            {isFetching && <Skeleton count={5} />}

            {isSuccess && (
              <CippTable
                keyField="ID"
                columns={newUserColumns}
                data={alerts.NewUsers}
                striped
                responsive={true}
                tableProps={{ subHeaderComponent: false }}
                wrapperClasses="table-responsive"
                reportName="none"
              />
            )}
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="full">
          <CippContentCard title="Recent Password Changes" icon={faAsterisk}>
            {isFetching && <Skeleton count={5} />}

            {isSuccess && (
              <CippTable
                keyField="ID"
                columns={passwordColumns}
                data={alerts.ChangedPasswords}
                striped
                responsive={true}
                tableProps={{ subHeaderComponent: false }}
                wrapperClasses="table-responsive"
                reportName="none"
              />
            )}
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="full">
          <CippContentCard title="Mailbox Permissions Changes" icon={faIdBadge}>
            {isFetching && <Skeleton count={5} />}

            {isSuccess && (
              <CippTable
                keyField="ID"
                columns={permissionColumns}
                data={alerts.MailboxPermissionChanges}
                striped
                responsive={true}
                tableProps={{ subHeaderComponent: false }}
                wrapperClasses="table-responsive"
                reportName="none"
              />
            )}
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="full">
          <CippContentCard title="Application Changes" icon={faWindowRestore}>
            {isFetching && <Skeleton count={5} />}

            {isSuccess && (
              <CippTable
                keyField="ID"
                columns={appColumns}
                data={alerts.AddedApps}
                striped
                responsive={true}
                tableProps={{ subHeaderComponent: false }}
                wrapperClasses="table-responsive"
                reportName="none"
              />
            )}
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="full">
          <CippContentCard title="Mailbox Logons" icon={faSignInAlt}>
            {isFetching && <Skeleton count={5} />}

            {isSuccess && (
              <CippTable
                keyField="ID"
                columns={mailboxlogonColumns}
                data={alerts.SuspectUserMailboxLogons}
                striped
                responsive={true}
                tableProps={{ subHeaderComponent: false }}
                wrapperClasses="table-responsive"
                reportName="none"
              />
            )}
          </CippContentCard>
        </CippMasonryItem>
      </CippMasonry>
    </CippPage>
  )
}

export default ViewBec
