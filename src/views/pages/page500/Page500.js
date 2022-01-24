import React from 'react'
import { CButton, CCol, CContainer, CRow } from '@coreui/react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { FastSwitcher } from 'src/components/utilities'

const Page500 = () => {
  return (
    <div className="min-vh-100 d-flex flex-row align-items-center">
      <Helmet>
        <title>CIPP - 500</title>
      </Helmet>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <span className="clearfix">
              <h1 className="float-start display-3 me-4">500</h1>
              <h4 className="pt-3">Houston, we have a problem!</h4>
              <p className="float-start">
                The page you are looking for is temporarily unavailable.
                <br /> <br />
                <Link to="/">
                  <CButton>Back to home</CButton>
                </Link>
              </p>
            </span>
            <FastSwitcher />
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Page500
