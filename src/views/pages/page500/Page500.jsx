import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import PropTypes from 'prop-types'

const Page500 = ({ errorcode, issue }) => {
  return (
    <CCard className="page-card">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <CCardTitle>An error has occurred!</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol md={6}>
            An error has appeared while trying to load your data. For troubleshooting, the error
            information can be found in the table below.
            <br /> <br /> This type of error is usually indicative an application issue. To
            troubleshoot this issue check if your API is running and reachable, or use below error
            to troubleshoot
          </CCol>
          <br /> <br />
          <CRow>
            <CCol>
              <CTable striped small>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Error</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Error Location</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow>
                    <CTableDataCell>{errorcode}</CTableDataCell>
                    <CTableDataCell>{issue}</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </CCol>
          </CRow>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

Page500.propTypes = {
  errorcode: PropTypes.string,
  issue: PropTypes.string,
}

export default Page500
