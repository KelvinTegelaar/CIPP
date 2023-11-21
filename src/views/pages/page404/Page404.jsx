import React from 'react'
import { CButton, CCol, CContainer, CRow } from '@coreui/react'
import { FastSwitcher } from 'src/components/utilities'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const Page404 = () => {
  return (
    <div className="min-vh-100 d-flex flex-row align-items-center">
      <Helmet>
        <title>CIPP - 404</title>
      </Helmet>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <div className="clearfix">
              <h1 className="float-start display-3 me-4">404</h1>
              <h4 className="pt-3">Oops! You might be lost.</h4>
              <p className="float-start">
                The page you are looking for was not found.
                <br /> <br />
                <Link to="/">
                  <CButton>Back to home</CButton>
                </Link>
              </p>
            </div>
            <FastSwitcher />
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Page404
