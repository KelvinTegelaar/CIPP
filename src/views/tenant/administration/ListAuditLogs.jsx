import React, { useEffect } from 'react'
import { CippPageList } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { cellDateFormatter } from 'src/components/tables'
import { useSelector } from 'react-redux'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CCollapse,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CLink,
  CRow,
  CTooltip,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Condition, RFFCFormInput, RFFCFormRadioList } from 'src/components/forms'
import { Field, Form } from 'react-final-form'
import { useSearchParams } from 'react-router-dom'
import { CippCodeBlock, CippOffcanvas } from 'src/components/utilities'

const ListAuditLogs = () => {
  // get query parameters
  const [searchParams, setSearchParams] = useSearchParams()
  const logId = searchParams.get('LogId')
  const [interval, setInterval] = React.useState('d')
  const [time, setTime] = React.useState(1)
  const [relativeTime, setRelativeTime] = React.useState('1d')
  const [startDate, setStartDate] = React.useState(null)
  const [endDate, setEndDate] = React.useState(null)
  const [visibleA, setVisibleA] = React.useState(true)
  const [tenantColumnSet, setTenantColumn] = React.useState(false)
  const tenant = useSelector((state) => state.app.currentTenant)

  useEffect(() => {
    if (tenant.defaultDomainName === 'AllTenants') {
      setTenantColumn(false)
    }
    if (tenant.defaultDomainName !== 'AllTenants') {
      setTenantColumn(true)
    }
  }, [tenant.defaultDomainName, tenantColumnSet])

  const handleSearch = (values) => {
    if (values.dateFilter === 'relative') {
      setRelativeTime(`${values.Time}${values.Interval}`)
      setStartDate(null)
      setEndDate(null)
    } else if (values.dateFilter === 'startEnd') {
      setRelativeTime(null)
      setStartDate(values.startDate)
      setEndDate(values.endDate)
    }
    setVisibleA(false)
  }

  const Actions = (row) => {
    const [visible, setVisible] = React.useState(false)
    return (
      <>
        <CLink variant="ghost" color="primary" className="me-2" onClick={() => setVisible(true)}>
          <CTooltip content="View">
            <FontAwesomeIcon icon="eye" />
          </CTooltip>
        </CLink>
        <CippOffcanvas
          title={row?.Data?.Title ?? 'Log Details'}
          hideFunction={() => setVisible(false)}
          visible={visible}
          addedClass="offcanvas-large"
          placement="end"
        >
          <CCard>
            <CCardHeader>
              <CCardTitle>
                <h3>Log Details</h3>
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              {row?.Data?.ActionText && (
                <CRow className="mb-3">
                  <CCol>
                    <CButton
                      color="primary"
                      className="me-2"
                      href={row?.Data?.ActionUrl}
                      target="_blank"
                    >
                      <FontAwesomeIcon icon="external-link-alt" className="me-2" />
                      {row?.Data?.ActionText}
                    </CButton>
                  </CCol>
                </CRow>
              )}
              <CRow>
                <CCol>
                  <h4>Raw Log</h4>
                  <CippCodeBlock
                    language="json"
                    code={JSON.stringify(row?.Data, null, 2)}
                    showLineNumbers={false}
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CippOffcanvas>
      </>
    )
  }

  const columns = [
    {
      name: 'Timestamp',
      selector: (row) => row['Timestamp'],
      sortable: true,
      exportSelector: 'Timestamp',
      cell: cellDateFormatter({ format: 'short' }),
      maxWidth: '200px',
    },
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      exportSelector: 'Tenant',
      omit: !tenantColumnSet,
      cell: cellGenericFormatter(),
      maxWidth: '150px',
    },
    {
      name: 'Title',
      selector: (row) => row['Title'],
      exportSelector: 'Title',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Actions',
      cell: Actions,
      maxWidth: '100px',
    },
  ]
  return (
    <div>
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Search Options
                <CButton
                  size="sm"
                  variant="ghost"
                  className="stretched-link"
                  onClick={() => setVisibleA(!visibleA)}
                >
                  <FontAwesomeIcon icon={visibleA ? 'chevron-down' : 'chevron-right'} />
                </CButton>
              </CCardTitle>
            </CCardHeader>
          </CCard>
          <CCollapse visible={visibleA}>
            <CCard className="options-card">
              <CCardHeader></CCardHeader>
              <CCardBody>
                <Form
                  onSubmit={handleSearch}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow>
                          <CCol>
                            <CFormLabel>Date Filter Type</CFormLabel>
                            <div>
                              <RFFCFormRadioList
                                name={`dateFilter`}
                                button={{ color: 'primary' }}
                                buttonClassName="me-1"
                                options={[
                                  {
                                    label: 'Relative',
                                    value: `relative`,
                                    defaultChecked: true,
                                  },
                                  {
                                    label: 'Start / End',
                                    value: `startEnd`,
                                  },
                                ]}
                                inline={true}
                              />
                            </div>
                          </CCol>
                        </CRow>
                        <hr />
                        <Condition when="dateFilter" is="relative">
                          <CRow>
                            <CCol xl="3">
                              <CFormLabel>Relative Time</CFormLabel>
                              <CInputGroup>
                                <CInputGroupText as="label" htmlFor="Time">
                                  Last
                                </CInputGroupText>
                                <Field name="Time" id="Time">
                                  {({ input, meta }) => <CFormInput {...input} defaultValue={1} />}
                                </Field>
                                <Field name="Interval">
                                  {({ input, meta }) => (
                                    <CFormSelect {...input}>
                                      <option value="m">Minutes</option>
                                      <option value="h">Hours</option>
                                      <option value="d" selected>
                                        Days
                                      </option>
                                    </CFormSelect>
                                  )}
                                </Field>
                              </CInputGroup>
                            </CCol>
                          </CRow>
                        </Condition>
                        <Condition when="dateFilter" is="startEnd">
                          <CRow>
                            <CCol>
                              <RFFCFormInput name="startDate" label="Start Date" type="date" />
                            </CCol>
                            <CCol>
                              <RFFCFormInput name="endDate" label="End Date" type="date" />
                            </CCol>
                          </CRow>
                        </Condition>
                        <CRow className="my-3">
                          <CCol>
                            <CButton type="submit">
                              <FontAwesomeIcon icon="search" className="me-2" />
                              Search
                            </CButton>
                          </CCol>
                        </CRow>
                      </CForm>
                    )
                  }}
                />
              </CCardBody>
            </CCard>
          </CCollapse>
        </CCol>
      </CRow>
      <hr />
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Audit Logs"
        tenantSelector={false}
        datatable={{
          keyField: 'id',
          columns,
          reportName: `Audit-Logs`,
          path: '/api/ListAuditLogs',
          params: {
            TenantFilter: tenant.defaultDomainName,
            RelativeTime: relativeTime,
            StartDate: startDate,
            EndDate: endDate,
            LogId: logId,
          },
          tableProps: {
            selectableRows: true,
            keyField: 'RowKey',
          },
        }}
      />
    </div>
  )
}

export default ListAuditLogs
