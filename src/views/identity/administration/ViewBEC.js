import React, { useEffect } from 'react'
import { CButton, CCallout, CCol, CRow } from '@coreui/react'
import { CCard, CCardBody, CCardHeader, CCardTitle, CSpinner } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faRedo, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { useLazyExecBecCheckQuery } from 'src/store/api/users'
import useQuery from 'src/hooks/useQuery'
import { Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'

const ViewBec = () => {
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const [execBecView, results] = useLazyExecBecCheckQuery()
  const { data: alerts = {}, isFetching, error, isSuccess } = results
  useEffect(() => {
    execBecView({ tenantFilter: tenantDomain, userId: userId })
  }, [execBecView, tenantDomain, userId])

  return (
    <>
      <CRow className="gy-5">
        <CCol className="col-6">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Alerts List
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
                been compromised.All this data is retrieved from the last 7 days of logs.
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
              <DataTable
                keyField="ID"
                //columns={columns}
                data={alerts?.SuspectUserDevices}
                striped
                responsive
                bordered={false}
                condensed
                wrapperClasses="table-responsive"
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol className="col-6">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Recently added rules (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>Devices Table Here</CCardBody>
          </CCard>
        </CCol>
        <CCol className="col-6">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Last Logon Details (User)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>Devices Table Here</CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol className="col-12">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Newly created users (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>Devices Table Here</CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol className="col-12">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Password Changes (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>Devices Table Here</CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol className="col-12">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Mailbox Permissions changes (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>Devices Table Here</CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol className="col-12">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Application Changes (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>Devices Table Here</CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol className="col-12">
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Mailbox Logons (Tenant)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>Devices Table Here</CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default ViewBec
