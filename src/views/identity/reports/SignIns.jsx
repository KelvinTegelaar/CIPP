import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CCollapse,
  CForm,
  CLink,
  CRow,
} from '@coreui/react'
import { faChevronDown, faChevronRight, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { Form } from 'react-final-form'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RFFCFormCheck, RFFCFormInput } from 'src/components/forms'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'
import useQuery from 'src/hooks/useQuery'
const reverseSort = (rowA, rowB) => {
  const a = rowA.createdDateTime.toLowerCase()
  const b = rowB.createdDateTime.toLowerCase()

  if (a > b) {
    return -1
  }

  if (b > a) {
    return 1
  }

  return 0
}

const columns = [
  {
    name: 'Date',
    selector: (row) => row['createdDateTime'],
    sortable: true,
    exportSelector: 'createdDateTime',
    sortFunction: reverseSort,
  },
  {
    name: 'User Principal Name',
    selector: (row) => row['userPrincipalName'],
    sortable: true,
    exportSelector: 'userPrincipalName',
  },
  {
    name: 'Application Name',
    selector: (row) => row['clientAppUsed'],
    sortable: true,
    exportSelector: 'clientAppUsed',
  },
  {
    name: 'Authentication Requirements',
    selector: (row) => row['authenticationRequirement'],
    sortable: true,
    exportSelector: 'authenticationRequirement',
  },
  {
    name: 'Failure Reason',
    selector: (row) => row.errorCode,
    sortable: true,
    exportSelector: 'errorCode',
    cell: (row) => {
      return (
        <CLink
          target="_blank"
          href={`https://login.microsoftonline.com/error?code=${row.errorCode}`}
        >
          {row.status?.errorCode}
        </CLink>
      )
    },
  },
  {
    name: 'Additional Details',
    selector: (row) => row.additionalDetails,
    sortable: true,
    exportSelector: 'additionalDetails',
    cell: (row) => CellTip(row['additionalDetails']),
  },
  {
    name: 'Location',
    selector: (row) => row.locationcipp,
    sortable: true,
    exportSelector: 'locationcipp',
    cell: (row) => CellTip(row['locationcipp']),
  },
]

const SignInsReport = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  let navigate = useNavigate()
  let query = useQuery()
  const filter = query.get('filter')
  const DateFilter = query.get('DateFilter')
  const searchparams = query.toString()
  const [visibleA, setVisibleA] = useState(true)

  const handleSubmit = async (values) => {
    Object.keys(values).filter(function (x) {
      if (values[x] === null) {
        delete values[x]
      }
      return null
    })
    const shippedValues = {
      SearchNow: true,
      ...values,
    }
    var queryString = Object.keys(shippedValues)
      .map((key) => key + '=' + shippedValues[key])
      .join('&')

    navigate(`?${queryString}`)
  }

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Sign In log Settings
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
                    filter: filter,
                    DateFilter: DateFilter,
                  }}
                  onSubmit={handleSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="filter"
                              label="Custom Filter"
                              placeholder="createdDateTime gt 2022-10-01 and (status/errorCode eq 50126)"
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <RFFCFormCheck label="Failed Logons Only" name="failedLogonsOnly" />
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CCol>
                            <CButton type="submit" disabled={submitting}>
                              <FontAwesomeIcon icon={faSearch} className="me-2" />
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
        title="Sign Ins Report"
        capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
        datatable={{
          columns: columns,
          path: `/api/ListSignIns?${searchparams}`,
          reportName: `${tenant?.defaultDomainName}-SignIns-Report`,
          params: { TenantFilter: tenant?.defaultDomainName },
        }}
      />
    </>
  )
}

export default SignInsReport
