import React, { useState } from 'react'
import { CButton, CCallout, CCol, CForm, CRow, CSpinner, CTooltip } from '@coreui/react'
import { useSelector } from 'react-redux'
import { Field, Form } from 'react-final-form'
import { RFFCFormSwitch } from 'src/components/forms'
import {
  useGenericGetRequestQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEdit, faEye } from '@fortawesome/free-solid-svg-icons'
import { CippPage, CippPageList } from 'src/components/layout'
import 'react-datepicker/dist/react-datepicker.css'
import { ModalService, TenantSelector } from 'src/components/utilities'
import arrayMutators from 'final-form-arrays'
import { useListConditionalAccessPoliciesQuery } from 'src/store/api/tenants'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'
import { CellTip, cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { cellBadgeFormatter, cellDateFormatter } from 'src/components/tables'

const CreateBackup = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [refreshState, setRefreshState] = useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const onSubmit = (values) => {
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    const unixTime = Math.floor(startDate.getTime() / 1000) - 45
    const shippedValues = {
      TenantFilter: tenantDomain,
      Name: `CIPP Backup ${tenantDomain}`,
      Command: { value: `New-CIPPBackup` },
      Parameters: { backupType: 'Scheduled', ScheduledBackupValues: { ...values } },
      ScheduledTime: unixTime,
      Recurrence: { value: '1d' },
    }
    genericPostRequest({
      path: '/api/AddScheduledItem?hidden=true&DisallowDuplicateName=true',
      values: shippedValues,
    }).then((res) => {
      setRefreshState(res.requestId)
    })
  }
  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const handleDeleteSchedule = (apiurl, message) => {
      ModalService.confirm({
        title: 'Confirm',
        body: <div>{message}</div>,
        onConfirm: () =>
          ExecuteGetRequest({ path: apiurl }).then((res) => {
            setRefreshState(res.requestId)
          }),
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
      })
    }
    let jsonResults
    try {
      jsonResults = JSON.parse(row.Results)
    } catch (error) {
      jsonResults = row.Results
    }

    return (
      <>
        <CTooltip content="Delete task">
          <CButton
            onClick={() =>
              handleDeleteSchedule(
                `/api/RemoveScheduledItem?&ID=${row.RowKey}`,
                'Do you want to delete this job?',
              )
            }
            size="sm"
            variant="ghost"
            color="danger"
          >
            <FontAwesomeIcon icon={'trash'} href="" />
          </CButton>
        </CTooltip>
      </>
    )
  }
  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      cell: (row) => CellTip(row['Tenant']),
      exportSelector: 'Tenant',
    },
    {
      name: 'Task State',
      selector: (row) => row['TaskState'],
      sortable: true,
      cell: cellBadgeFormatter(),
      exportSelector: 'TaskState',
    },
    {
      name: 'Last executed time',
      selector: (row) => row['ExecutedTime'],
      sortable: true,
      cell: cellDateFormatter({ format: 'relative' }),
      exportSelector: 'ExecutedTime',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '100px',
    },
  ]

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest',
    params: {
      TenantFilter: tenantDomain,
      Endpoint: 'users',
      $select: 'id,displayName,userPrincipalName,accountEnabled',
      $count: true,
      $top: 999,
      $orderby: 'displayName',
    },
  })

  const {
    data: caPolicies = [],
    isFetching: caIsFetching,
    error: caError,
  } = useListConditionalAccessPoliciesQuery({ domain: tenantDomain })

  return (
    <CippPage title={`Add Backup Schedule`} tenantSelector={false}>
      <>
        <CRow>
          <CCol md={4}>
            <CippButtonCard
              CardButton={
                <CButton type="submit" form="addTask">
                  Create Backup Schedule
                  {postResults.isFetching && (
                    <FontAwesomeIcon icon={faCircleNotch} spin className="ms-2" size="1x" />
                  )}
                </CButton>
              }
              title="Add backup Schedule"
              icon={faEdit}
            >
              <Form
                onSubmit={onSubmit}
                mutators={{
                  ...arrayMutators,
                }}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm id="addTask" onSubmit={handleSubmit}>
                      <p>
                        Backups are stored in CIPPs storage and can be restored using the CIPP
                        Restore Backup Wizard. Backups run daily or on demand by clicking the backup
                        now button.
                      </p>
                      <CRow className="mb-3">
                        <CCol>
                          <label>Tenant</label>
                          <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
                        </CCol>
                      </CRow>
                      <CRow>
                        <hr />
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <h3 className="underline mb-4">Identity</h3>
                          <RFFCFormSwitch name="users" label="User List" />
                          <RFFCFormSwitch name="groups" label="Groups" />
                          <h3 className="underline mb-4">Conditional Access</h3>
                          <RFFCFormSwitch name="ca" label="Conditional Access Configuration" />
                          <h3 className="underline mb-4">Intune</h3>
                          <RFFCFormSwitch
                            name="intuneconfig"
                            label="Intune Configuration Policies"
                          />
                          <RFFCFormSwitch
                            name="intunecompliance"
                            label="Intune Compliance Policies"
                          />
                          <RFFCFormSwitch
                            name="intuneprotection"
                            label="Intune Protection Policies"
                          />
                          <h3 className="underline mb-4">Email Security</h3>
                          <RFFCFormSwitch name="antispam" label="Anti-Spam Policies" />
                          <RFFCFormSwitch name="antiphishing" label="Anti-Phishing Policies" />
                          <h3 className="underline mb-4">CIPP</h3>
                          <RFFCFormSwitch
                            name="CippWebhookAlerts"
                            label="Webhook Alerts Configuration"
                          />
                          <RFFCFormSwitch
                            name="CippScriptedAlerts"
                            label="Scripted Alerts Configuration"
                          />
                          <RFFCFormSwitch name="CippStandards" label="Standards Configuration" />
                        </CCol>
                      </CRow>
                      {postResults.isSuccess && (
                        <CCallout color="success">
                          <li>{postResults.data.Results}</li>
                        </CCallout>
                      )}
                      {getResults.isFetching && (
                        <CCallout color="info">
                          <CSpinner>Loading</CSpinner>
                        </CCallout>
                      )}
                      {getResults.isSuccess && (
                        <CCallout color="info">{getResults.data?.Results}</CCallout>
                      )}
                      {getResults.isError && (
                        <CCallout color="danger">
                          Could not connect to API: {getResults.error.message}
                        </CCallout>
                      )}
                    </CForm>
                  )
                }}
              />
            </CippButtonCard>
          </CCol>

          <CCol md={8}>
            <CippPageList
              key={refreshState}
              capabilities={{
                allTenants: true,
                helpContext: 'https://google.com',
              }}
              title="Backup Tasks"
              tenantSelector={false}
              datatable={{
                tableProps: {
                  selectableRows: true,
                  actionsList: [
                    {
                      label: 'Delete task',
                      modal: true,
                      modalUrl: `/api/RemoveScheduledItem?&ID=!RowKey`,
                      modalMessage: 'Do you want to delete this job?',
                    },
                  ],
                },
                keyField: 'id',
                columns,
                reportName: `Scheduled-Jobs`,
                path: `/api/ListScheduledItems?RefreshGuid=${refreshState}&showHidden=true&Type=New-CIPPBackup`,
              }}
            />
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default CreateBackup
