import React, { useEffect, useState } from 'react'
import { CButton, CCallout, CCol, CForm, CFormLabel, CRow, CSpinner, CTooltip } from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { useSelector } from 'react-redux'
import { Field, Form, FormSpy } from 'react-final-form'
import {
  Condition,
  RFFCFormInput,
  RFFCFormInputArray,
  RFFCFormSelect,
  RFFCFormSwitch,
  RFFSelectSearch,
} from 'src/components/forms'
import {
  useGenericGetRequestQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEdit, faEye } from '@fortawesome/free-solid-svg-icons'
import { CippContentCard, CippPage, CippPageList } from 'src/components/layout'
import { cellBadgeFormatter, cellDateFormatter } from 'src/components/tables'
import { CellTip } from 'src/components/tables/CellGenericFormat'
import 'react-datepicker/dist/react-datepicker.css'
import TenantListSelector from 'src/components/utilities/TenantListSelector'
import { ModalService, TenantSelector } from 'src/components/utilities'
import CippCodeOffCanvas from 'src/components/utilities/CippCodeOffcanvas'
import arrayMutators from 'final-form-arrays'

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

const AlertRules = () => {
  const currentDate = new Date()
  const [startDate, setStartDate] = useState(currentDate)
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [isArr, setisArr] = useState([])
  const [refreshState, setRefreshState] = useState(false)
  const taskName = `Scheduled Task ${currentDate.toLocaleString()}`
  const { data: availableCommands = [], isLoading: isLoadingcmd } = useGenericGetRequestQuery({
    path: 'api/ListFunctionParameters?Module=CIPPCore',
  })
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
      AdditionalProperties: values.additional,
      PostExecution: {
        Webhook: values.webhook,
        Email: values.email,
        PSA: values.psa,
      },
    }
    genericPostRequest({ path: '/api/AddScheduledItem', values: shippedValues }).then((res) => {
      setRefreshState(res.requestId)
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

  const ifvalues = [
    { value: 'New-InboxRule', label: 'A new Inbox rule is created' },
    { value: 'Set-InboxRule', label: 'A existing Inbox rule is created' },
    {
      value: 'Add member to role.',
      label: 'A user has been added to an admin role',
    },
    {
      value: 'Disable account.',
      label: 'A user account has been disabled',
    },
    {
      value: 'Enable account.',
      label: 'A user account has been enabled',
    },
    {
      value: 'Update StsRefreshTokenValidFrom Timestamp.',
      label: 'A user sessions have been revoked',
    },
    {
      value: 'Disable Strong Authentication.',
      label: 'A users MFA has been disabled',
    },
    {
      value: 'Remove Member from a role.',
      label: 'A user has been removed from a role',
    },
    {
      value: 'Reset user password.',
      label: 'A user password has been reset',
    },
    {
      value: 'UserLoggedInFromUnknownLocation',
      label: 'A user has logged in from a location ',
    },
    {
      value: 'Add service principal',
      label: 'A service prinicipal has been created',
    },
    {
      value: 'Remove service principal.',
      label: 'A service principal has been removed',
    },
    {
      value: 'ImpossibleTravel',
      label: 'A user has logged in from an impossible location (Based on IP)',
    },
    {
      value: 'badRepIP',
      label: 'A user has logged in from a known bad-reputation IP',
    },
    { value: 'customField', label: 'Custom Log Query' },
  ]
  const dovalues = [
    { value: 'cippcommand', label: 'Execute a CIPP Command' },
    { value: 'becremediate', label: 'Execute a BEC Remediate' },
    { value: 'disableuser', label: 'Disable the user in the log entry' },
    { value: 'generatelog', label: 'Generate a log entry' },
    { value: 'generatemail', label: 'Generate an email' },
    { value: 'generatePSA', label: 'Generate a PSA ticket' },
    { value: 'generateWebhook', label: 'Forward the log as webhook' },
    {
      value: 'store',
      label: 'Store the log into an external Azure Storage Account',
    },
  ]

  const [ifCount, setIfCount] = useState(1)
  const [doCount, setDoCount] = useState(1)

  const handleButtonIf = (operator) => {
    if (operator === '+') {
      if (ifCount < 3) {
        setIfCount(ifCount + 1)
      }
    } else {
      if (ifCount > 1) {
        setIfCount(ifCount - 1)
      }
    }
  }

  const handleButtonDo = (operator) => {
    if (operator === '+') {
      if (doCount < 10) {
        setDoCount(doCount + 1)
      }
    } else {
      if (doCount > 1) {
        setDoCount(doCount - 1)
      }
    }
  }

  const renderIfs = () => {
    const ifs = []
    for (let i = 0; i < ifCount; i++) {
      ifs.push(
        <>
          {i === 0 ? 'If' : 'And'}
          <CRow className="align-items-center" key={`if-${i}`}>
            <CCol>
              <RFFCFormSelect name={`ifs.${i}`} values={ifvalues} />
            </CCol>
            <CCol xs="auto">
              {ifCount > 1 && (
                <CButton
                  className="circular-button mb-3"
                  title={'-'}
                  onClick={() => handleButtonIf('-')}
                  disabled={doCount >= 10}
                >
                  <FontAwesomeIcon icon={'minus'} />
                </CButton>
              )}
            </CCol>
            <CCol xs="auto">
              <CButton
                className="circular-button mb-3"
                title={'+'}
                onClick={() => handleButtonIf('+')}
                disabled={ifCount >= 3}
              >
                <FontAwesomeIcon icon={'plus'} />
              </CButton>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol>
              <Condition when={`ifs.${i}`} is="customField">
                <RFFCFormInput type="text" name="field" label="Query" />
              </Condition>
            </CCol>
          </CRow>
        </>,
      )
    }
    return ifs
  }

  const renderDos = () => {
    const dos = []

    for (let i = 0; i < doCount; i++) {
      dos.push(
        <>
          {i === 0 ? 'Execute this' : 'And'}
          <CRow className="align-items-center mb-3" key={`do-${i}`}>
            <CCol>
              <RFFCFormSelect name={`do.${i}.execute`} values={dovalues} />
            </CCol>
            {doCount > 1 && (
              <CCol xs="auto">
                <CButton
                  className="circular-button mb-3"
                  title={'-'}
                  onClick={() => handleButtonDo('-')}
                  disabled={doCount >= 10}
                >
                  <FontAwesomeIcon icon={'minus'} />
                </CButton>
              </CCol>
            )}
            <CCol xs="auto">
              <CButton
                className="circular-button mb-3"
                title={'+'}
                onClick={() => handleButtonDo('+')}
                disabled={doCount >= 10}
              >
                <FontAwesomeIcon icon={'plus'} />
              </CButton>
            </CCol>
            <Condition when={`do.${i}.execute`} is="cippcommand">
              <CRow className="mb-3">
                <CCol>
                  <RFFSelectSearch
                    values={availableCommands.map((cmd) => ({
                      value: cmd.Function,
                      name: cmd.Function,
                    }))}
                    name={`command`}
                    placeholder={
                      isLoadingcmd ? (
                        <CSpinner size="sm" />
                      ) : (
                        'Select a command or report to execute.'
                      )
                    }
                    label="Command to execute"
                  />
                </CCol>
              </CRow>
            </Condition>
            <Condition when={`do.${i}.execute`} is="store">
              <CRow className="mb-3">
                <CCol>
                  <RFFCFormInput type="text" name="sasurl" label="Connection String" />
                </CCol>
              </CRow>
            </Condition>
          </CRow>
        </>,
      )
    }
    return dos
  }

  return (
    <CippPage title={`Add Schedule`} tenantSelector={false}>
      <>
        <CRow>
          <CCol md={4}>
            <CippContentCard title="Add Alert Rule" icon={faEdit}>
              <Form
                onSubmit={onSubmit}
                mutators={{
                  ...arrayMutators,
                }}
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
                      {renderIfs()}
                      {renderDos()}

                      <FormSpy>
                        {/* eslint-disable react/prop-types */}
                        {(props) => {
                          const selectedCommand = availableCommands.find(
                            (cmd) => cmd.Function === props.values.command?.value,
                          )
                          return (
                            <CRow className="mb-3">
                              <CCol>{selectedCommand?.Synopsis}</CCol>
                            </CRow>
                          )
                        }}
                      </FormSpy>
                      <CRow>
                        <FormSpy>
                          {/* eslint-disable react/prop-types */}
                          {(props) => {
                            const selectedCommand = availableCommands.find(
                              (cmd) => cmd.Function === props.values.command?.value,
                            )
                            let paramblock = null
                            if (selectedCommand) {
                              //if the command parameter type is boolean we use <RFFCFormCheck /> else <RFFCFormInput />.
                              const parameters = selectedCommand.Parameters
                              if (parameters.length > 0) {
                                paramblock = parameters.map((param, idx) => (
                                  <CRow key={idx} className="mb-3">
                                    <CTooltip
                                      content={
                                        param?.Description !== null
                                          ? param.Description
                                          : 'No Description'
                                      }
                                      placement="left"
                                    >
                                      <CCol>
                                        {param.Type === 'System.Boolean' ||
                                        param.Type ===
                                          'System.Management.Automation.SwitchParameter' ? (
                                          <>
                                            <label>{param.Name}</label>
                                            <RFFCFormSwitch
                                              initialValue={false}
                                              name={`parameters.${param.Name}`}
                                              label={`True`}
                                            />
                                          </>
                                        ) : (
                                          <>
                                            {param.Type === 'System.Collections.Hashtable' ? (
                                              <RFFCFormInputArray
                                                name={`parameters.${param.Name}`}
                                                label={`${param.Name}`}
                                                key={idx}
                                              />
                                            ) : (
                                              <RFFCFormInput
                                                type="text"
                                                key={idx}
                                                name={`parameters.${param.Name}`}
                                                label={`${param.Name}`}
                                              />
                                            )}
                                          </>
                                        )}
                                      </CCol>
                                    </CTooltip>
                                  </CRow>
                                ))
                              }
                            }
                            return paramblock
                          }}
                        </FormSpy>
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
              capabilities={{
                allTenants: true,
                helpContext: 'https://google.com',
              }}
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
                      modalMessage: 'Do you want to delete this job?',
                    },
                  ],
                },
                filterlist: [
                  {
                    filterName: 'Planned Jobs',
                    filter: 'Complex: TaskState eq Planned',
                  },
                  {
                    filterName: 'Completed Jobs',
                    filter: 'Complex: TaskState eq Completed',
                  },
                  {
                    filterName: 'Recurring Jobs',
                    filter: 'Complex: Recurrence gt 0',
                  },
                  {
                    filterName: 'One-time Jobs',
                    filter: 'Complex: Recurrence eq 0',
                  },
                ],
                keyField: 'id',
                columns,
                reportName: `Scheduled-Jobs`,
                path: `/api/ListScheduledItems?RefreshGuid=${refreshState}`,
              }}
            />
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default AlertRules
