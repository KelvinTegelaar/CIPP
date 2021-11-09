import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react'
import * as icon from '@coreui/icons'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCardText,
  CRow,
  CCol,
  CSpinner,
  CCardImage,
  CCardTitle,
  CButton,
} from '@coreui/react'

import { loadVersion } from '../../store/modules/version'

const Home = () => {
  const dispatch = useDispatch()
  const versions = useSelector((state) => state.version.versions)

  useEffect(() => {
    async function load() {
      dispatch(loadVersion())
    }

    load()
  }, [])

  return (
    <div>
      <h3>Dashboard</h3>
      <CRow xs={{ cols: 1, gutter: 4 }} md={{ cols: 2 }}>
        <CCol xs>
          <CCard>
            <CCardImage orientation="top" src="img/data-report.svg" />
            <CCardBody className="text-center">
              <CCardTitle>New User</CCardTitle>
              <CCardText>
                Ready to make a new user for any managed tenant? Click below to jump to the wizard.
              </CCardText>
              <CButton color="primary" className="mt-2">
                Add user
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard
            color={versions.OutOfDateCIPP ? 'danger' : ''}
            textColor={'black'}
            className="mb-3"
            style={{ maxWidth: '18rem' }}
          >
            <CCardHeader>
              CIPP Version
              {versions.OutOfDateCIPP ? (
                <CIcon icon={icon.cilXCircle} />
              ) : (
                <CIcon icon={icon.cilCheckCircle} size="lg" />
              )}
            </CCardHeader>
            <CCardBody>
              Remote: {!versions.loading ? versions.RemoteCIPPVersion : <CSpinner size="sm" />}
              <br />
              Local: {!versions.loading ? versions.LocalCIPPVersion : <CSpinner size="sm" />}
            </CCardBody>
          </CCard>
          <CCard
            color={versions.OutOfDateCIPPAPI ? 'danger' : ''}
            textColor={'black'}
            className="mb-3"
            style={{ maxWidth: '18rem' }}
          >
            <CCardHeader>
              CIPP API Version
              {versions.OutOfDateCIPPAPI ? (
                <CIcon icon={icon.cilXCircle} />
              ) : (
                <CIcon icon={icon.cilCheckCircle} size="lg" />
              )}
            </CCardHeader>
            <CCardBody>
              Remote: {!versions.loading ? versions.RemoteCIPPAPIVersion : <CSpinner size="sm" />}
              <br />
              Local: {!versions.loading ? versions.LocalCIPPAPIVersion : <CSpinner size="sm" />}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Home
