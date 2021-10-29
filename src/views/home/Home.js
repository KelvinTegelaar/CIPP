import React, { lazy, useEffect, useState } from 'react'
import CIcon from '@coreui/icons-react'
import * as icon from '@coreui/icons'
import axios from 'axios'
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

const Home = () => {
  const [remoteCipp, setremoteCipp] = useState()
  const [localCipp, setLocalCipp] = useState()
  const [remoteCippApi, setRemoteCippApi] = useState()
  const [localCippApi, setLocalCippApi] = useState()
  useEffect(() => {
    const RemoteURLCIPP =
      'https://raw.githubusercontent.com/KelvinTegelaar/CIPP/master/version_latest.txt'
    const LocalURLCIPP = '/version_latest.txt'
    const RemoteURLCIPPAPI =
      'https://raw.githubusercontent.com/KelvinTegelaar/CIPP-API/master/version_latest.txt'
    const LocalURLCIPPAPI = '/api/GetVersion'
    axios
      .all([
        axios.get(RemoteURLCIPP),
        axios.get(LocalURLCIPP),
        axios.get(RemoteURLCIPPAPI),
        axios.get(LocalURLCIPPAPI),
      ])
      .then((response) => {
        setremoteCipp(response[0].data)
        setLocalCipp(response[1].data)
        setRemoteCippApi(response[2].data)
        setLocalCippApi(response[3].data)
      })
  })

  return (
    <>
      <h3>Dashboard</h3>
      <CRow xs={{ cols: 1, gutter: 4 }} md={{ cols: 2 }}>
        <CCol xs>
          <CCard>
            <CCardImage orientation="top" src="img/data-report.svg" />
            <CCardBody>
              <CCardTitle>New User</CCardTitle>
              <CCardText className="text-center">
                Ready to make a new user for any managed tenant? click below to jump to the wizard.
                <br />
                <CButton color="primary" className="mt-2">
                  Add user
                </CButton>
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard
            color={remoteCipp && (remoteCipp === localCipp ? '' : 'danger')}
            textColor={'black'}
            className="mb-3"
            style={{ maxWidth: '18rem' }}
          >
            <CCardHeader>
              CIPP Version
              {remoteCipp && remoteCipp === localCipp ? (
                <CIcon icon={icon.cilCheckCircle} size="lg" />
              ) : (
                <CIcon icon={icon.cilXCircle} />
              )}
            </CCardHeader>
            <CCardBody>
              <CCardText>
                Remote: {remoteCipp ? remoteCipp : <CSpinner size="sm" />}
                <br />
                Local: {localCipp ? localCipp : <CSpinner size="sm" />}
              </CCardText>
            </CCardBody>
          </CCard>
          <CCard
            color={remoteCippApi && (remoteCippApi === localCippApi ? '' : 'danger')}
            textColor={'black'}
            className="mb-3"
            style={{ maxWidth: '18rem' }}
          >
            <CCardHeader>
              CIPP API Version
              {remoteCippApi && remoteCippApi === localCippApi ? (
                <CIcon icon={icon.cilCheckCircle} size="lg" />
              ) : (
                <CIcon icon={icon.cilXCircle} />
              )}
            </CCardHeader>
            <CCardBody>
              <CCardText>
                Remote: {remoteCippApi ? remoteCippApi : <CSpinner size="sm" />}
                <br />
                Local: {localCippApi ? localCippApi : <CSpinner size="sm" />}
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Home
