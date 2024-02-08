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
import { CippContentCard, CippPage, CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables/CellGenericFormat'
import 'react-datepicker/dist/react-datepicker.css'
import { CippActionsOffcanvas, ModalService, TenantSelector } from 'src/components/utilities'
import CippCodeOffCanvas from 'src/components/utilities/CippCodeOffcanvas'
import arrayMutators from 'final-form-arrays'
const alertsList = [
  { name: 'MFAAlertUsers', label: 'Alert on users without any form of MFA' },
  { name: 'MFAAdmins', label: 'Alert on admins without any form of MFA' },
  {
    name: 'NoCAConfig',
    label:
      'Alert on tenants without a Conditional Access policy, while having Conditional Access licensing available.',
  },
  { name: 'AdminPassword', label: 'Alert on changed admin Passwords' },
  { name: 'QuotaUsed', label: 'Alert on 90% mailbox quota used' },
  { name: 'SharePointQuota', label: 'Alert on 90% SharePoint quota used' },
  { name: 'ExpiringLicenses', label: 'Alert on licenses expiring in 30 days' },
  { name: 'SecDefaultsUpsell', label: 'Alert on Security Defaults automatic enablement' },
  {
    name: 'DefenderStatus',
    label: 'Alert if Defender is not running (Tenant must be on-boarded in Lighthouse)',
  },
  {
    name: 'DefenderMalware',
    label: 'Alert on Defender Malware found  (Tenant must be on-boarded in Lighthouse)',
  },
  { name: 'UnusedLicenses', label: 'Alert on unused licenses' },
  { name: 'OverusedLicenses', label: 'Alert on overused licenses' },
  { name: 'AppSecretExpiry', label: 'Alert on expiring application secrets' },
  { name: 'ApnCertExpiry', label: 'Alert on expiring APN certificates' },
  { name: 'VppTokenExpiry', label: 'Alert on expiring VPP tokens' },
  { name: 'DepTokenExpiry', label: 'Alert on expiring DEP tokens' },
]

const ListClassicAlerts = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const [ocVisible, setOCVisible] = useState(false)

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
      jsonResults = JSON.parse(row)
    } catch (error) {
      jsonResults = row
    }

    return (
      <>
        <CTooltip content="View Set Alerts">
          <CButton size="sm" color="success" variant="ghost" onClick={() => setOCVisible(true)}>
            <FontAwesomeIcon icon={'eye'} href="" />
          </CButton>
        </CTooltip>
        <CTooltip content="Delete task">
          <CButton
            onClick={() =>
              handleDeleteSchedule(
                `/api/RemoveQueuedAlert?&ID=${row.tenantId}`,
                'Do you want to delete the queued alert?',
              )
            }
            size="sm"
            variant="ghost"
            color="danger"
          >
            <FontAwesomeIcon icon={'trash'} href="" />
          </CButton>
        </CTooltip>
        <CippActionsOffcanvas
          title="User Information"
          extendedInfo={Object.keys(row).map((key) => ({
            label: key,
            value:
              typeof row[key] === 'boolean' ? (
                row[key] ? (
                  <FontAwesomeIcon icon={'check'} />
                ) : (
                  <FontAwesomeIcon icon={'times'} />
                )
              ) : (
                row[key]
              ),
          }))}
          placement="end"
          visible={ocVisible}
          id={row.id}
          hideFunction={() => setOCVisible(false)}
        />
      </>
    )
  }

  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [refreshState, setRefreshState] = useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    Object.keys(values).filter(function (x) {
      if (values[x] === null) {
        delete values[x]
      }
      return null
    })
    values['tenantFilter'] = tenantDomain
    values['SetAlerts'] = true
    genericPostRequest({ path: '/api/AddAlert', values: values }).then((res) => {
      setRefreshState(res.requestId)
    })
  }
  const { data: currentlySelectedAlerts = [], isLoading: isLoadingCurrentAlerts } =
    useGenericGetRequestQuery({
      path: `api/ListAlertsQueue?TenantFilter=${tenantDomain}&RefreshGuid=${refreshState}`,
    })

  const columns = [
    {
      name: 'Tenant Name',
      selector: (row) => row['tenantName'],
      sortable: true,
      cell: (row) => CellTip(row['tenantName']),
      exportSelector: 'tenantName',
    },
    {
      name: 'Tenant ID',
      selector: (row) => row['tenantId'],
      sortable: true,
      cell: (row) => CellTip(row['tenantId']),
      exportSelector: 'tenantId',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
    },
  ]
  const initialValues = currentlySelectedAlerts.filter((x) => x.tenantName === tenantDomain)[0]
  const allTenantsAlert = currentlySelectedAlerts.find(
    (tenant) => tenant.tenantName === 'AllTenants',
  )
  function getLabel(item) {
    if (typeof allTenantsAlert === 'object' && allTenantsAlert !== null) {
      if (allTenantsAlert[`${item}`]) {
        return `* Enabled via All Tenants`
      }
    }
    return ''
  }

  return (
    <CippPage title={`Add Schedule`} tenantSelector={false}>
      <>
        <CRow>
          <CCol md={4}>
            <CippContentCard title="Add Classic Alert" icon={faEdit}>
              <Form
                onSubmit={onSubmit}
                mutators={{
                  ...arrayMutators,
                }}
                initialValues={{ ...initialValues }}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <p>
                        Classic Alerts are sent every 15 minutes, with a maximum of 1 unique alert
                        per 24 hours. These alerts do not use the Alert Rules Engine.
                      </p>
                      {isLoadingCurrentAlerts && <CSpinner />}
                      <CRow className="mb-3">
                        <CCol>
                          <label>Tenant</label>
                          <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
                        </CCol>
                      </CRow>
                      <CRow>
                        <hr />
                        {alertsList.map((alert, index) => (
                          <CCol key={alert.name} md="6">
                            <RFFCFormSwitch
                              name={alert.name}
                              label={alert.label}
                              sublabel={getLabel(alert.name)}
                            />
                          </CCol>
                        ))}
                      </CRow>
                      <CRow>
                        <CCol md={6}>
                          <CButton type="submit" disabled={submitting}>
                            Set Alerts
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
            </CippContentCard>
          </CCol>
          <CCol md={8}>
            <CippPageList
              key={refreshState}
              capabilities={{
                allTenants: true,
                helpContext: 'https://google.com',
              }}
              title="Alerts List"
              tenantSelector={false}
              datatable={{
                tableProps: {
                  selectableRows: true,
                  actionsList: [
                    {
                      label: 'Delete task',
                      modal: true,
                      modalUrl: `/api/RemoveQueuedAlert?&ID=!tenantId`,
                      modalMessage: 'Do you want to delete this job?',
                    },
                  ],
                },
                columns,
                reportName: `Scheduled-Jobs`,
                path: `/api/ListAlertsQueue?RefreshGuid=${refreshState}`,
              }}
            />
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default ListClassicAlerts
