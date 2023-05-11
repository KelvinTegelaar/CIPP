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
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { Field, Form, FormSpy } from 'react-final-form'
import { RFFCFormInput, RFFCFormSelect } from 'src/components/forms'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown, faSearch, faCog } from '@fortawesome/free-solid-svg-icons'
import { CellTip, CippTable } from 'src/components/tables'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CippPage } from 'src/components/layout/CippPage'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { OnChange } from 'react-final-form-listeners'

const GraphExplorer = () => {
  let navigate = useNavigate()
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const applicationid = query.get('applicationid')
  const SearchNow = query.get('SearchNow')
  const [visibleA, setVisibleA] = useState(true)
  const handleSubmit = async (values) => {
    setVisibleA(false)
    Object.keys(values).filter(function (x) {
      if (values[x] === null) {
        delete values[x]
      }
      return null
    })
    const shippedValues = {
      tenantFilter: tenant.defaultDomainName,
      SearchNow: true,
      ...values,
    }
    var queryString = Object.keys(shippedValues)
      .map((key) => key + '=' + shippedValues[key])
      .join('&')

    navigate(`?${queryString}`)
  }
  const [execGraphRequest, graphrequest] = useLazyGenericGetRequestQuery()

  const columns = [
    {
      name: 'Default Domain',
      selector: (row) => row['defaultDomainName'],
      sortable: true,
      cell: (row) => CellTip(row['defaultDomainName']),
      exportSelector: 'defaultDomainName',
      minWidth: '200px',
    },
    {
      name: 'Approval link',
      selector: (row) => row['link'],
      center: true,
      cell: (row) => (
        <a href={`${row.link}`} target="_blank" className="dlink" rel="noreferrer">
          <FontAwesomeIcon icon={faCog} className="me-2" />
        </a>
      ),
    },
  ]

  if (graphrequest.isSuccess) {
    if (graphrequest.data.length === 0) {
      graphrequest.data = [{ data: 'No Data Found' }]
    }
  }

  useEffect(() => {
    execGraphRequest({
      path: 'api/execAppApproval',
      params: { applicationid },
    })
  }, [applicationid, execGraphRequest, tenant.defaultDomainName])

  const WhenFieldChanges = ({ field, set }) => (
    <Field name={set} subscription={{}}>
      {(
        // No subscription. We only use Field to get to the change function
        { input: { onChange } },
      ) => (
        <FormSpy subscription={{}}>
          {({ form }) => (
            <OnChange name={field}>
              {(value) => {
                let template = value
                onChange(template)
              }}
            </OnChange>
          )}
        </FormSpy>
      )}
    </Field>
  )

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Approval Settings
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
                    applicationid: applicationid,
                  }}
                  onSubmit={handleSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow>
                          <CCol>
                            <p>
                              This tool helps you to retrieve the approval links required for each
                              tenant. This is required to use 'Application Permissions' within these
                              tenants when GDAP is deployed.
                            </p>
                            <p>
                              The approval URL might lead to an error page with the error "Admin
                              Role not found" or not load any page at all after clicking confirm -
                              This is expected behavior.
                            </p>
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="applicationid"
                              label="Application ID:"
                              placeholder="Enter the application ID to generate the approval URLs for. This can be any application."
                            />
                          </CCol>
                          <WhenFieldChanges field="reportTemplate" set="endpoint" />
                        </CRow>
                        <CRow className="mb-3">
                          <CCol>
                            <CButton type="submit" disabled={submitting}>
                              <FontAwesomeIcon className="me-2" icon={faSearch} />
                              Query
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
      <CippPage title="Report Results" tenantSelector={false}>
        {!SearchNow && <span>Execute a search to get started.</span>}
        {graphrequest.isSuccess && SearchNow && (
          <CCard className="content-card">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <CCardTitle>Results</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CippTable
                reportName="GraphExplorer"
                columns={columns}
                data={graphrequest.data}
                isFetching={graphrequest.isFetching}
              />
            </CCardBody>
          </CCard>
        )}
      </CippPage>
    </>
  )
}

export default GraphExplorer
