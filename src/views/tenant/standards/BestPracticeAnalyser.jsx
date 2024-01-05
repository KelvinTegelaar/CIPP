import React, { useEffect, useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardText,
  CCardTitle,
  CCol,
  CCollapse,
  CForm,
  CRow,
  CSpinner,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import PropTypes from 'prop-types'
import { Field, Form, FormSpy } from 'react-final-form'
import { RFFCFormInput, RFFCFormSelect } from 'src/components/forms'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronRight,
  faChevronDown,
  faSearch,
  faExclamationTriangle,
  faCheck,
  faCross,
  faTimes,
  faSync,
  faExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { CippTable, cellBooleanFormatter } from 'src/components/tables'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CippPage } from 'src/components/layout/CippPage'
import { useGenericGetRequestQuery, useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { OnChange } from 'react-final-form-listeners'
import { queryString } from 'src/helpers'
import { CellTip, cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { useExecBestPracticeAnalyserMutation } from 'src/store/api/reports'
import { ModalService } from 'src/components/utilities'
import { cellTableFormatter } from 'src/components/tables/CellTable'

const RefreshAction = ({ singleTenant = false, refreshFunction = null }) => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [execBestPracticeAnalyser, { isLoading, isSuccess, error }] =
    useLazyGenericGetRequestQuery()
  var params = {}
  if (singleTenant) {
    params['TenantFilter'] = tenantDomain
  }
  const showModal = () =>
    ModalService.confirm({
      body: (
        <div>
          Are you sure you want to force the Best Practice Analysis to run? This will slow down
          normal usage considerably. <br />
          <i>Please note: this runs at 3:00 AM UTC automatically every day.</i>
        </div>
      ),
      onConfirm: () =>
        execBestPracticeAnalyser({
          path: 'api/BestPracticeAnalyser_OrchestrationStarter',
          params: params,
        }),
    })

  return (
    <>
      <CButton onClick={showModal} size="sm" className="m-1">
        {isLoading && <CSpinner size="sm" />}
        {error && <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />}
        {isSuccess && <FontAwesomeIcon icon={faCheck} className="pe-1" />}
        {(singleTenant && 'Refresh Tenant Data') || 'Force Refresh All Data'}
      </CButton>
      {refreshFunction !== null && (
        <CButton
          onClick={() => {
            refreshFunction((Math.random() + 1).toString(36).substring(7))
          }}
          className="m-1"
          size="sm"
        >
          <FontAwesomeIcon icon={faSync} />
        </CButton>
      )}
    </>
  )
}
RefreshAction.propTypes = {
  singleTenant: PropTypes.bool,
  refreshFunction: PropTypes.func,
}

const getsubcolumns = (data) => {
  const flatObj = data && data.length > 0 ? data : [{ data: 'No Data Found' }]
  const QueryColumns = []
  if (flatObj[0]) {
    Object.keys(flatObj[0]).map((key) => {
      QueryColumns.push({
        name: key,
        selector: (row) => row[key], // Accessing the property using the key
        sortable: true,
        exportSelector: key,
        cell: cellGenericFormatter(),
      })
    })
  }
  return QueryColumns
}
const getNestedValue = (obj, path) => {
  if (!path) return undefined
  return path.split('.').reduce((acc, part) => {
    // Check for an array marker
    const match = part.match(/(.*?)\[(\d+)\]/)
    if (match) {
      const propName = match[1]
      const index = parseInt(match[2], 10)
      return acc[propName] ? acc[propName][index] : undefined
    }
    // If no array marker, simply return the property value
    return acc ? acc[part] : undefined
  }, obj)
}
const BestPracticeAnalyser = () => {
  const [reportTemplate, setReportTemplate] = useState('CIPP Best Practices v1.0 - Table view')
  const [refreshValue, setRefreshValue] = useState('')
  const { data: templates = [], isLoading: templatesfetch } = useGenericGetRequestQuery({
    path: 'api/listBPATemplates',
  })
  let navigate = useNavigate()
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const Report = query.get('Report')
  const SearchNow = query.get('SearchNow')
  const [visibleA, setVisibleA] = useState(true)
  const handleSubmit = async (values) => {
    setVisibleA(false)
    setReportTemplate(values.reportTemplate)
    const shippedValues = {
      SearchNow: true,
      Report: reportTemplate,
      tenantFilter: tenant.customerId,
      random: (Math.random() + 1).toString(36).substring(7),
    }
    var queryString = Object.keys(shippedValues)
      .map((key) => key + '=' + shippedValues[key])
      .join('&')

    navigate(`?${queryString}`)
  }
  const [execGraphRequest, graphrequest] = useLazyGenericGetRequestQuery()
  const QueryColumns = {
    set: false,
    data: [
      {
        name: 'Tenant',
        selector: (row) => row['Tenant'],
        sortable: true,
        exportSelector: 'Tenant',
        cell: (row) => CellTip(row['Tenant']),
      },
    ],
  }

  if (graphrequest.isSuccess) {
    if (graphrequest.data.length === 0) {
      graphrequest.data = [{ data: 'No Data Found' }]
    }
    const flatObj = graphrequest.data.Columns ? graphrequest.data.Columns : []

    flatObj.map((col) => {
      // Determine the cell selector based on the 'formatter' property
      let cellSelector
      if (col.formatter) {
        switch (col.formatter) {
          case 'bool':
            cellSelector = cellBooleanFormatter()
            break
          case 'reverseBool':
            cellSelector = cellBooleanFormatter({ reverse: true })
            break
          case 'warnBool':
            cellSelector = cellBooleanFormatter({ warning: true })
            break
          case 'table':
            cellSelector = cellTableFormatter(col.value)
            break
          default:
            cellSelector = cellGenericFormatter()
            break
        }
      } else {
        cellSelector = cellGenericFormatter()
      }

      QueryColumns.data.push({
        name: col.name,
        selector: (row) => getNestedValue(row, col.value),
        sortable: true,
        exportSelector: col.value.split('.').join('/'),
        cell: cellSelector, // Use the determined cell selector
      })
    })

    QueryColumns.set = true
  }

  useEffect(() => {
    execGraphRequest({
      path: 'api/listBPA',
      params: {
        tenantFilter: tenant.customerId,
        Report: reportTemplate,
        SearchNow: SearchNow,
        refresh: refreshValue,
      },
    })
  }, [
    Report,
    execGraphRequest,
    tenant.defaultDomainName,
    query,
    refreshValue,
    reportTemplate,
    tenant.customerId,
    SearchNow,
  ])

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Report Settings
                <CButton
                  size="sm"
                  variant="ghost"
                  className="stretched-link"
                  onClick={() => setVisibleA(!visibleA)}
                >
                  <FontAwesomeIcon icon={visibleA ? faChevronDown : faChevronRight} />
                </CButton>
              </CCardTitle>
            </CCardHeader>
          </CCard>
          <CCollapse visible={visibleA}>
            <CCard className="options-card">
              <CCardHeader></CCardHeader>
              <CCardBody>
                <Form
                  initialValues={{
                    tenantFilter: tenant.defaultDomainName,
                    Report: Report,
                  }}
                  onSubmit={handleSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow>
                          <CCol>
                            <RFFCFormSelect
                              name="reportTemplate"
                              label="Select a report"
                              placeholder={templatesfetch ? 'Loading...' : 'Select a report'}
                              values={templates.map((template) => ({
                                label: template.Name,
                                value: template.Name,
                              }))}
                            />
                          </CCol>
                          {templatesfetch && <CSpinner />}
                        </CRow>
                        <CRow></CRow>
                        <CRow className="mb-3">
                          <CCol>
                            <CButton type="submit" disabled={submitting}>
                              <FontAwesomeIcon className="me-2" icon={faSearch} />
                              Retrieve Report
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
      <CRow>
        <CCol>
          <CippPage title="Report Results" tenantSelector={false}>
            {graphrequest.isUninitialized && <span>Choose a BPA Report to get started.</span>}
            {graphrequest.isFetching && <CSpinner />}
            {graphrequest.isSuccess && QueryColumns.set && graphrequest.data.Style == 'Table' && (
              <CCard className="content-card">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <CCardTitle>Best Practice Report</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <CippTable
                    key={QueryColumns.data}
                    reportName="BestPracticeAnalyser"
                    dynamicColumns={false}
                    columns={QueryColumns.data}
                    data={graphrequest.data.Data}
                    isFetching={graphrequest.isFetching}
                    tableProps={{
                      actions: [
                        <RefreshAction
                          key="refresh-action-button"
                          refreshFunction={setRefreshValue}
                        />,
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            )}
            {graphrequest.isSuccess && QueryColumns.set && graphrequest.data.Style == 'Tenant' && (
              <>
                <CRow>
                  <div width="30px" className="mb-3">
                    <RefreshAction
                      key="refresh-action-button"
                      singleTenant={true}
                      refreshFunction={setRefreshValue}
                    />
                  </div>
                  {graphrequest.data.Columns.map((info, idx) => (
                    <CCol md={12} xl={4} className="mb-3" key={`${info.name}-${idx}`}>
                      <CCard className="h-100">
                        <CCardHeader>
                          <CCardTitle>{info.name}</CCardTitle>
                        </CCardHeader>
                        <CCardBody>
                          <CCardText>
                            {info.formatter === 'bool' && (
                              <CBadge
                                color={graphrequest.data.Data[info.value] ? 'info' : 'danger'}
                              >
                                <FontAwesomeIcon
                                  icon={graphrequest.data.Data[info.value] ? faCheck : faTimes}
                                  size="lg"
                                  className="me-1"
                                />
                                {graphrequest.data.Data[info.value] ? 'Yes' : 'No'}
                              </CBadge>
                            )}
                            {info.formatter === 'reverseBool' && (
                              <CBadge
                                color={graphrequest.data.Data[info.value] ? 'danger' : 'info'}
                              >
                                <FontAwesomeIcon
                                  icon={graphrequest.data.Data[info.value] ? faTimes : faCheck}
                                  size="lg"
                                  className="me-1"
                                />
                                {graphrequest.data.Data[info.value] ? 'No' : 'Yes'}
                              </CBadge>
                            )}
                            {info.formatter === 'warnBool' && (
                              <CBadge
                                color={graphrequest.data.Data[info.value] ? 'info' : 'warning'}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    graphrequest.data.Data[info.value] ? faCheck : faExclamation
                                  }
                                  size="lg"
                                  className="me-1"
                                />
                                {graphrequest.data.Data[info.value] ? 'Yes' : 'No'}
                              </CBadge>
                            )}

                            {info.formatter === 'table' && (
                              <CippTable
                                key={QueryColumns.data}
                                reportName="BestPracticeAnalyser"
                                dynamicColumns={false}
                                columns={getsubcolumns(graphrequest.data.Data[info.value])}
                                data={graphrequest.data.Data[info.value]}
                                isFetching={graphrequest.isFetching}
                              />
                            )}

                            {info.formatter === 'number' && (
                              <p className="fs-1 text-center">
                                {getNestedValue(graphrequest.data.Data, info.value)}
                              </p>
                            )}
                          </CCardText>
                          <CCardText>
                            <small className="text-medium-emphasis">{info.desc}</small>
                          </CCardText>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
                </CRow>
              </>
            )}
          </CippPage>
        </CCol>
      </CRow>
    </>
  )
}

export default BestPracticeAnalyser
