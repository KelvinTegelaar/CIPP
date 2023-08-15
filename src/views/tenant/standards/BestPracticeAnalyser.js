import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CCollapse,
  CForm,
  CRow,
  CSpinner,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { Field, Form, FormSpy } from 'react-final-form'
import { RFFCFormInput, RFFCFormSelect } from 'src/components/forms'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronRight,
  faChevronDown,
  faSearch,
  faExclamationTriangle,
  faCheck,
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
const RefreshAction = () => {
  const [execBestPracticeAnalyser, { isLoading, isSuccess, error }] =
    useExecBestPracticeAnalyserMutation()

  const showModal = () =>
    ModalService.confirm({
      body: (
        <div>
          Are you sure you want to force the Best Practice Analysis to run? This will slow down
          normal usage considerably. <br />
          <i>Please note: this runs at 3:00 AM UTC automatically every day.</i>
        </div>
      ),
      onConfirm: () => execBestPracticeAnalyser(),
    })

  return (
    <CButton onClick={showModal} size="sm" className="m-1">
      {isLoading && <CSpinner size="sm" />}
      {error && <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />}
      {isSuccess && <FontAwesomeIcon icon={faCheck} className="pe-1" />}
      Force Refresh All Data
    </CButton>
  )
}
const BestPracticeAnalyser = () => {
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
    const shippedValues = {
      SearchNow: true,
      Report: values.reportTemplate,
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
        exportSelector: col.value,
        cell: cellSelector, // Use the determined cell selector
      })
    })

    QueryColumns.set = true
  }

  useEffect(() => {
    execGraphRequest({
      path: 'api/listBPA',
      params: {
        tenantFilter: tenant.defaultDomainName,
        Report: Report,
        SearchNow: SearchNow,
      },
    })
  }, [Report, execGraphRequest, tenant.defaultDomainName, query])

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Report Settings
                <CButton size="sm" variant="ghost" onClick={() => setVisibleA(!visibleA)}>
                  <FontAwesomeIcon icon={visibleA ? faChevronDown : faChevronRight} />
                </CButton>
              </CCardTitle>
            </CCardHeader>
            <CCollapse visible={visibleA}>
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
            </CCollapse>
          </CCard>
        </CCol>
      </CRow>
      <hr />
      <CRow>
        <CCol>
          <CippPage title="Report Results" tenantSelector={false}>
            {graphrequest.isUninitialized && <span>Choose a BPA Report to get started.</span>}
            {graphrequest.isFetching && <CSpinner />}
            {graphrequest.isSuccess && QueryColumns.set && (
              <CCard className="content-card">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <CCardTitle>Best Practice Report</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <CippTable
                    reportName="BestPracticeAnalyser"
                    dynamicColumns={false}
                    columns={QueryColumns.data}
                    data={graphrequest.data.Data}
                    isFetching={graphrequest.isFetching}
                    tableProps={{
                      actions: [<RefreshAction key="refresh-action-button" />],
                    }}
                  />
                </CCardBody>
              </CCard>
            )}
          </CippPage>
        </CCol>
      </CRow>
    </>
  )
}

export default BestPracticeAnalyser
