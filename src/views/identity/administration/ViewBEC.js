import React, { useEffect } from 'react'
import { CButton, CCallout, CCol, CRow } from '@coreui/react'
import { CCard, CCardBody, CCardHeader, CCardTitle, CSpinner } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faRedo, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { useLazyExecBecCheckQuery } from 'src/store/api/users'
import useQuery from 'src/hooks/useQuery'
import { Link } from 'react-router-dom'
import { CippTable } from 'src/components/tables'

const ViewBec = () => {
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const [execBecView, results] = useLazyExecBecCheckQuery()
  const { data: alerts = {}, isFetching, error, isSuccess } = results
  useEffect(() => {
    execBecView({ tenantFilter: tenantDomain, userId: userId })
  }, [execBecView, tenantDomain, userId])

  const deviceColumns = [
    {
      name: 'Device Model',
      selector: (row) => row['DeviceModel'],
    },
    {
      name: 'First Sync Time',
      selector: (row) => row['FirstSyncTime'],
    },
    {
      name: 'Device User Agent',
      selector: (row) => row['DeviceUserAgent'],
    },
  ]

  const rulesColumns = [
    {
      name: 'Creator IP',
      selector: (row) => row['ClientIP'],
    },
    {
      name: 'Rule Name',
      selector: (row) => row.Parameters[3]?.value,
    },
    {
      name: 'Created on',
      selector: (row) => row['CreationTime'],
    },
    {
      name: 'Created for',
      selector: (row) => row['UserId'],
    },
  ]

  const logonColumns = [
    {
      name: 'App',
      selector: (row) => row['AppDisplayName'],
    },
    {
      name: 'Date Time',
      selector: (row) => row['CreatedDateTime'],
    },
    {
      name: 'Error code',
      selector: (row) => row.Status?.ErrorCode,
    },
    {
      name: 'Details',
      selector: (row) => row.Status?.AdditionalDetails,
    },
  ]

  const mailboxlogonColumns = [
    {
      name: 'IP',
      selector: (row) => row['ClientIP'],
    },
    {
      name: 'User',
      selector: (row) => row['CreatedDateTime'],
    },
    {
      name: 'User Agent',
      selector: (row) => row['ClientInfoString'],
    },
    {
      name: 'Result',
      selector: (row) => row['ResultStatus'],
    },
    {
      name: 'Data',
      selector: (row) => row['CreationTime'],
    },
  ]
  const newUserColumns = [
    {
      name: 'Username',
      selector: (row) => row['ObjectId'],
    },
    {
      name: 'Date',
      selector: (row) => row['CreationTime'],
    },
    {
      name: 'By',
      selector: (row) => row['UserId'],
    },
  ]

  const passwordColumns = [
    {
      name: 'Username',
      selector: (row) => row['ObjectId'],
    },
    {
      name: 'Date',
      selector: (row) => row['CreationTime'],
    },
    {
      name: 'Operation',
      selector: (row) => row['Operation'],
    },
    {
      name: 'By',
      selector: (row) => row['UserId'],
    },
  ]

  const permissionColumns = [
    {
      name: 'Operation',
      selector: (row) => row['Operation'],
    },
    {
      name: 'Executed by',
      selector: (row) => row['UserKey'],
    },
    {
      name: 'Executed on',
      selector: (row) => row['ObjectId'],
    },
    {
      name: 'Permissions',
      selector: (row) =>
        row.Item ? row.Item.ParentFolder?.MemberRights : row.Parameters[3]?.Value,
    },
  ]

  const appColumns = [
    {
      name: 'Type',
      selector: (row) => row['Operation'],
    },
    {
      name: 'User',
      selector: (row) => row['UserId'],
    },
    {
      name: 'Application',
      selector: (row) => row['ObjectId'],
    },
    {
      name: 'Result',
      selector: (row) => row['ResultStatus'],
    },
  ]

  return (
    <div className="container overflow-hidden">
      <CRow>
        <CCol className="col-6">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Business Email Compromise Overview
                <CButton
                  size="sm"
                  onClick={() => execBecView({ tenantFilter: tenantDomain, userId: userId })}
                  disabled={isFetching}
                >
                  {!isFetching && <FontAwesomeIcon icon={faRedo} className="me-2" />}
                  Refresh
                </CButton>
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CCallout color="info">
                Loading Data: {isFetching && <CSpinner />}
                {!isFetching && error && <FontAwesomeIcon icon={faTimesCircle} />}
                {isSuccess && <FontAwesomeIcon icon={faCheckCircle} />}
              </CCallout>
              <p>
                Use this information as a guide to check if a tenant or e-mail address might have
                been compromised. All data is retrieved from the last 7 days of logs.
              </p>
              <p>
                If you need more extensive information, run the{' '}
                <Link to="https://cloudforensicator.com/">HAWK</Link> tool to investigate further.
                If you believe this user to be compromised.
              </p>
              <p>
                Hit the button below to execute the following tasks:
                <li>Block user signin</li>
                <li>Reset user password</li>
                <li>Disconnect all current sessions</li>
                <li>Disable all inbox rules for the user</li>
              </p>
              <CButton>Remediate User</CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol className="col-6">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Devices (User)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
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
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <br></br>
      <CRow>
        <CCol className="col-6">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Recently added rules (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              {' '}
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
            </CCardBody>
          </CCard>
        </CCol>
        <CCol className="col-6">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Last Logon Details (User)
              </CCardTitle>
            </CCardHeader>
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
          </CCard>
        </CCol>
      </CRow>
      <br></br>
      <CRow xs={{ gutter: 3 }}>
        <CCol className="col-12">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Newly created users (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
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
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow xs={{ gutter: 3 }}>
        <CCol className="col-12">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Password Changes (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
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
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <br></br>
      <CRow className="g-2">
        <CCol className="col-12">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Mailbox Permissions changes (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
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
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <br></br>
      <CRow className="g-2">
        <CCol className="col-12">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Application Changes (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
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
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <br></br>
      <CRow className="g-2">
        <CCol className="col-12">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Mailbox Logons (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
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
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <br></br>
    </div>
  )
}

export default ViewBec
