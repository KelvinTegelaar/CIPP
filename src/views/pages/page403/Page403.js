import React from 'react'
import { CButton, CCol, CContainer, CRow } from '@coreui/react'
import { Helmet } from 'react-helmet'

const Page403 = () => {
  return (
    <div className="min-vh-100 d-flex flex-row align-items-center">
      <Helmet>
        <title>CIPP - 403</title>
      </Helmet>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <div className="clearfix">
              <h1 className="float-start display-3 me-4">403</h1>
              <h4 className="pt-3">Forbidden</h4>
              <p className="float-start">
                You do not have access to this page. Are you logged in under the right account?
                <br /> <br />
                {/* trigger full page reload using href */}
                <CButton href="/login">Back to login</CButton>
              </p>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Page403
