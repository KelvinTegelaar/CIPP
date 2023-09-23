import React, { useEffect, useState } from 'react'
import { CButton, CCallout, CCol, CForm, CFormLabel, CRow, CSpinner, CTooltip } from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { useDispatch, useSelector } from 'react-redux'
import { Field, Form } from 'react-final-form'
import {
  Condition,
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormSwitch,
  RFFCFormTextarea,
  RFFSelectSearch,
} from 'src/components/forms'
import countryList from 'src/data/countryList'

import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEdit, faEye } from '@fortawesome/free-solid-svg-icons'
import { CippContentCard, CippPage, CippPageList } from 'src/components/layout'
import { password } from 'src/validators'
import {
  CellDate,
  CellDelegatedPrivilege,
  cellBadgeFormatter,
  cellBooleanFormatter,
  cellDateFormatter,
} from 'src/components/tables'
import { CellTip, cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import TenantListSelector from 'src/components/utilities/TenantListSelector'
import { ModalService, TenantSelector } from 'src/components/utilities'
import CippCodeOffCanvas from 'src/components/utilities/CippCodeOffcanvas'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const [ocVisible, setOCVisible] = useState(false)

  const handleDeleteSchedule = (apiurl, message) => {
    ModalService.confirm({
      title: 'Confirm',
      body: <div>{message}</div>,
      onConfirm: () => ExecuteGetRequest({ path: apiurl }),
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
      <CTooltip content="View Results">
        <CButton size="sm" color="success" variant="ghost" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={'eye'} href="" />
        </CButton>
      </CTooltip>
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
      <CippCodeOffCanvas
        hideButton
        title="Results"
        row={jsonResults}
        state={ocVisible}
        type="TemplateResults"
        hideFunction={() => setOCVisible(false)}
      />
    </>
  )
}

const Scheduler = () => {
  const currentDate = new Date()
  const [startDate, setStartDate] = useState(currentDate)
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [refreshState, setRefreshState] = useState(false)
  const taskName = `Scheduled Task ${currentDate.toLocaleString()}`

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    const unixTime = Math.floor(startDate.getTime() / 1000)
    const shippedValues = {
      TenantFilter: tenantDomain,
      Name: values.taskName,
      Command: values.command,
      Parameters: values.parameters,
      ScheduledTime: unixTime,
      Recurrence: values.Recurrence,
      PostExecution: {
        Webhook: values.webhook,
        Email: values.email,
        PSA: values.psa,
      },
    }
    genericPostRequest({ path: '/api/AddScheduledItem', values: shippedValues }).then((res) => {
      setRefreshState(res.requestId)
      console.log(res.requestId)
    })
  }

  const columns = [
    {
      name: 'Name',
      selector: (row) => row['Name'],
      sortable: true,
      cell: (row) => CellTip(row['Name']),
      exportSelector: 'Name',
    },
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
      name: 'Command',
      selector: (row) => row['Command'],
      sortable: true,
      cell: (row) => CellTip(row['Command']),
      exportSelector: 'Command',
    },
    {
      name: 'Parameters',
      selector: (row) => row['Parameters'],
      sortable: true,
      cell: (row) => CellTip(row['Parameters']),
      exportSelector: 'Parameters',
    },
    {
      name: 'Scheduled Time',
      selector: (row) => row['ScheduledTime'],
      sortable: true,
      cell: cellDateFormatter({ format: 'relative' }),
      exportSelector: 'ScheduledTime',
    },
    {
      name: 'Last executed time',
      selector: (row) => row['ExecutedTime'],
      sortable: true,
      cell: cellDateFormatter({ format: 'relative' }),
      exportSelector: 'ExecutedTime',
    },
    {
      name: 'Recurrence',
      selector: (row) => row['Recurrence'],
      sortable: true,
      cell: (row) => CellTip(row['Recurrence']),
      exportSelector: 'Recurrence',
    },
    {
      name: 'Sending to',
      selector: (row) => row['PostExecution'],
      sortable: true,
      cell: (row) => CellTip(row['PostExecution']),
      exportSelector: 'PostExecution',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
    },
  ]
  return (
    <CippPage title={`Add Schedule`} tenantSelector={false}>
      <>
        <CRow>
          <CCol md={4}>
            <CippContentCard title="Add Task" icon={faEdit}>
              <Form
                onSubmit={onSubmit}
                initialValues={{ taskName }}
                initialValuesEqual={() => true}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <CRow className="mb-3">
                        <CCol>
                          <label>Tenant</label>
                          <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <RFFCFormInput
                            type="text"
                            name="taskName"
                            label="Task Name"
                            firstValue={`Task ${currentDate.toLocaleString()}`}
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <label>Scheduled Date</label>
                          <DatePicker
                            className="form-control mb-3"
                            selected={startDate}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="Pp"
                            onChange={(date) => setStartDate(date)}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            values={[
                              { value: '0', name: 'Only once' },
                              { value: '1', name: 'Every 1 day' },
                              { value: '7', name: 'Every 7 days' },
                              { value: '30', name: 'Every 30 days' },
                              { value: '365', name: 'Every 365 days' },
                            ]}
                            name="Recurrence"
                            placeholder="Select a recurrence"
                            label="Recurrence"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            values={[
                              {
                                value: 'Get-CIPPLicenseOverview',
                                name: 'Get-CIPPLicenseOverview',
                              },
                            ]}
                            name="command"
                            placeholder="Select a command or report to execute."
                            label="Command to execute"
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <RFFCFormInput type="text" name="parameters" label="Parameters" />
                        </CCol>
                      </CRow>

                      <CRow className="mb-3">
                        <CCol>
                          <label>Send results to</label>
                          <RFFCFormSwitch name="webhook" label="Webhook" />
                          <RFFCFormSwitch name="email" label="E-mail" />
                          <RFFCFormSwitch name="psa" label="PSA" />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CButton type="submit" disabled={submitting}>
                            Add Schedule
                            {postResults.isFetching && (
                              <FontAwesomeIcon
                                icon={faCircleNotch}
                                spin
                                className="ms-2"
                                size="1x"
                              />
                            )}
                          </CButton>
                        </CCol>
                      </CRow>
                      {postResults.isSuccess && (
                        <CCallout color="success">
                          <li>{postResults.data.Results}</li>
                        </CCallout>
                      )}
                    </CForm>
                  )
                }}
              />
            </CippContentCard>
          </CCol>
          <CCol md={8}>
            <CippPageList
              key={refreshState}
              capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
              title="Scheduled Tasks"
              tenantSelector={false}
              datatable={{
                tableProps: {
                  selectableRows: true,
                  actionsList: [
                    {
                      label: 'Delete task',
                      modal: true,
                      modalUrl: `/api/RemoveScheduledItem?&ID=!RowKey`,
                      modalMessage: 'Are you sure you want to exclude these tenants?',
                    },
                  ],
                },
                filterlist: [
                  { filterName: 'Excluded Tenants', filter: '"Excluded":true' },
                  { filterName: 'Included Tenants', filter: '"Excluded":false' },
                ],
                keyField: 'id',
                columns,
                reportName: `Tenants-List`,
                path: `/api/ListScheduledItems?RefreshGuid=${refreshState}`,
              }}
            />
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default Scheduler
