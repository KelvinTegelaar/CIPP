import React, { useEffect, useRef } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCardText,
  CCardTitle,
  CCol,
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CRow,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes, faExclamation } from '@fortawesome/free-solid-svg-icons'
import { CippTable } from 'src/components/tables'
import { CippPage } from 'src/components/layout/CippPage'
import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useSelector } from 'react-redux'
import Skeleton from 'react-loading-skeleton'
import standards from 'src/data/standards'
import { useNavigate } from 'react-router-dom'
import { ModalService } from 'src/components/utilities'
import { CellTip, cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { CippCallout } from 'src/components/layout'

const SecureScore = () => {
  const textRef = useRef()
  const selectRef = useRef()
  const currentTenant = useSelector((state) => state.app.currentTenant)
  const [viewMode, setViewMode] = React.useState(false)
  const [translateData, setTranslatedData] = React.useState([])
  const [translateState, setTranslateSuccess] = React.useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [refreshCode, setRefresh] = React.useState(null)
  const {
    data: securescore = [],
    isFetching,
    isSuccess,
  } = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest?refresh=' + refreshCode,
    params: {
      tenantFilter: currentTenant.defaultDomainName,
      Endpoint: 'security/secureScores',
      $top: 1,
      NoPagination: true,
    },
  })

  const {
    data: securescoreTranslation = [],
    isSuccess: isSuccessTranslation,
    isFetching: isFetchingTranslation,
  } = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest?refresh=' + refreshCode,
    params: {
      tenantFilter: currentTenant.defaultDomainName,
      Endpoint: 'security/secureScoreControlProfiles',
      $top: 999,
      NoPagination: true,
    },
  })

  useEffect(() => {
    if (isSuccess) {
      setTranslatedData(securescore.Results[0])
      setTranslateSuccess(true)
    }
  }, [isSuccess, securescore.Results])

  useEffect(() => {
    if (isSuccess && isSuccessTranslation) {
      const updatedControlScores = translateData.controlScores.map((control) => {
        const translation = securescoreTranslation.Results?.find(
          (controlTranslation) => controlTranslation.id === control.controlName,
        )
        const remediation = standards.find((standard) => standard.tag.includes(control.controlName))
        return {
          ...control,
          title: translation?.title,
          threats: translation?.threats,
          complianceInformation: translation?.complianceInformation,
          actionUrl: remediation
            ? '/tenant/standards/list-applied-standards'
            : translation?.actionUrl,
          remediation: remediation
            ? `1. Enable the CIPP Standard: ${remediation.label}`
            : translation?.remediation,
          remediationImpact: translation?.remediationImpact,
          implementationCost: translation?.implementationCost,
          tier: translation?.tier,
          userImpact: translation?.userImpact,
          vendorInformation: translation?.vendorInformation,
          controlStateUpdates: translation?.controlStateUpdates[0]
            ? translation.controlStateUpdates
            : [],
        }
      })

      updatedControlScores.sort((a, b) => {
        return b['scoreInPercentage'] - a['scoreInPercentage']
      })
      setTranslatedData((prevData) => ({
        ...prevData,
        controlScores: updatedControlScores,
      }))
    }
  }, [isSuccess, isSuccessTranslation, securescoreTranslation.Results, refreshCode])
  const navigate = useNavigate()

  const openRemediation = (url) => {
    if (url.startsWith('https')) {
      window.open(url, '_blank')
    } else {
      navigate(url)
    }
  }
  const openResolution = (control) => {
    ModalService.confirm({
      key: control,
      body: (
        <div style={{ overflow: 'visible' }}>
          <div className="mb-3">
            <CFormInput
              label="Reason for marking as resolved (Mandatory)"
              ref={textRef}
              type="text"
            />
          </div>
          <div className="mb-3">
            <CFormSelect
              ref={selectRef}
              options={[
                {
                  value: 'ThirdParty',
                  label: 'Resolved by Third Party (Mark as completed, receive points)',
                },
                {
                  value: 'Ignored',
                  label: 'Ignored / Risk Accepted (Mark as completed, do not receive points)',
                },
                {
                  value: 'Default',
                  label: 'Mark as default (Receive points if Microsoft detects as completed)',
                },
              ]}
              label="Resolution Type"
            />
          </div>
        </div>
      ),
      title: 'Confirm',
      onConfirm: () =>
        genericPostRequest({
          path: '/api/ExecUpdateSecureScore',
          values: {
            controlName: control.controlName,
            resolutionType: selectRef.current.value,
            reason: textRef.current.value,
            tenantFilter: currentTenant.defaultDomainName,
            vendorinformation: control.vendorInformation,
          },
        }).then(() => {
          setRefresh(Math.random())
        }),
    })
  }

  const columns = [
    {
      name: 'Task Title',
      selector: (row) => row['title'],
      sortable: true,
      cell: (row) => CellTip(row['title']),
      exportSelector: 'title',
    },
    {
      name: 'Percentage Complete',
      selector: (row) => row['scoreInPercentage'],
      sortable: true,
      cell: (row) => CellTip(row['scoreInPercentage']),
      exportSelector: 'scoreInPercentage',
    },
    {
      name: 'Remediation',
      selector: (row) => row['actionUrl'],
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'actionUrl',
    },
  ]

  return (
    <>
      {postResults.isFetching && <Skeleton />}
      {postResults.isSuccess && (
        <CippCallout dismissible title="Success" color="success">
          {postResults.data.Results}
        </CippCallout>
      )}
      {postResults.isError && (
        <CippCallout dismissible title="Error" color="danger">
          {postResults.error.message}
        </CippCallout>
      )}
      <CRow>
        <CCol xs={3} className="mb-3">
          <CCard className="content-card h-100">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <CCardTitle>Overview mode</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CCardText>
                <CFormSwitch label="Table View" onChange={() => setViewMode(!viewMode)} />
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={3} className="mb-3">
          <CCard className="content-card h-100">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <CCardTitle>Current Score</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CCardText>
                {isFetching && <Skeleton />}
                {translateState && (
                  <>
                    <h3>
                      {Math.round(
                        (translateData?.currentScore / translateData?.maxScore) * 100 * 10,
                      ) / 10}
                      %
                    </h3>
                    <small className="text-medium-emphasis">
                      {translateData?.currentScore} of {translateData?.maxScore} points
                    </small>
                  </>
                )}
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={3} className="mb-3">
          <CCard className="content-card h-100">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <CCardTitle>Compared Score (Similiar sized business)</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CCardText>
                {isFetching && <Skeleton />}
                {translateState && (
                  <>
                    <h3>
                      {
                        //calculate percentage, round to 1 dec.
                        Math.round(
                          (translateData?.averageComparativeScores[1]?.averageScore /
                            translateData?.maxScore) *
                            100 *
                            10,
                        ) / 10
                      }
                      %
                    </h3>
                    <small className="text-medium-emphasis">
                      {translateData?.averageComparativeScores[1]?.averageScore} of{' '}
                      {translateData?.maxScore} points
                    </small>
                  </>
                )}
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={3} className="mb-3">
          <CCard className="content-card h-100">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <CCardTitle>Compared Score (All businesses)</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CCardText>
                {isFetching && <Skeleton />}
                {translateState && (
                  <>
                    <h3>
                      {
                        //calculate percentage, round to 1 dec.
                        Math.round(
                          (translateData?.averageComparativeScores[0]?.averageScore /
                            translateData?.maxScore) *
                            100 *
                            10,
                        ) / 10
                      }
                      %
                    </h3>
                    <small className="text-medium-emphasis">
                      {translateData?.averageComparativeScores[0]?.averageScore} of{' '}
                      {translateData?.maxScore} points
                    </small>
                  </>
                )}
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CippPage title="Report Results" tenantSelector={false}>
        {viewMode && translateData.controlScores.length > 1 && isSuccess && isSuccessTranslation && (
          <CCard className="content-card">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <CCardTitle>Best Practice Report</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CippTable
                reportName="SecureScore"
                dynamicColumns={false}
                columns={columns}
                data={translateData.controlScores}
                isFetching={isFetching}
              />
            </CCardBody>
          </CCard>
        )}
        {translateState &&
          !viewMode &&
          translateData.controlScores.length > 1 &&
          isSuccess &&
          isSuccessTranslation && (
            <>
              <CRow>
                {translateData?.controlScores?.map((info, idx) => (
                  <CCol md={12} xl={4} className="mb-3" key={`${info.name}-${idx}`}>
                    <CCard className="h-100">
                      <CCardHeader>
                        <CCardTitle>{info.title}</CCardTitle>
                      </CCardHeader>
                      <CCardBody>
                        <CCardText>
                          <CBadge color={info.scoreInPercentage === 100 ? 'info' : 'danger'}>
                            <FontAwesomeIcon
                              icon={info.scoreInPercentage === 100 ? faCheck : faTimes}
                              size="lg"
                              className="me-1"
                            />
                            {info.scoreInPercentage === 100
                              ? `100% ${
                                  info.controlStateUpdates?.length > 0 &&
                                  info.controlStateUpdates[0].state !== 'Default'
                                    ? `(${info?.controlStateUpdates[0]?.state})`
                                    : ''
                                }`
                              : `${info.scoreInPercentage}% ${
                                  info.controlStateUpdates?.length > 0 &&
                                  info.controlStateUpdates[0].state !== 'Default'
                                    ? `(${info?.controlStateUpdates[0]?.state})`
                                    : ''
                                }
                            `}
                          </CBadge>
                        </CCardText>

                        <CCardText>
                          <h5>Description</h5>
                          <small className="text-medium-emphasis">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: `${info.description} ${info.implementationStatus}`,
                              }}
                            />
                          </small>
                        </CCardText>
                        {info.scoreInPercentage !== 100 && (
                          <CCardText>
                            <h5>Remediation Recommendation</h5>
                            <small className="mb-3 text-medium-emphasis">
                              {
                                <div
                                  className="mb-3"
                                  dangerouslySetInnerHTML={{ __html: info.remediation }}
                                />
                              }
                            </small>
                          </CCardText>
                        )}
                        <CCardText>
                          {info.threats?.length > 0 && (
                            <>
                              <h5>Threats</h5>
                              {info.threats?.map((threat, idx) => (
                                <CBadge color="info" key={`${threat}-${idx}`} className="me-3">
                                  {threat}
                                </CBadge>
                              ))}
                            </>
                          )}
                        </CCardText>
                        <CCardText>
                          {info.complianceInformation > 0 && (
                            <>
                              <h5>Compliance Frameworks</h5>
                              {info.complianceInformation?.map((framework, idx) => (
                                <CBadge color="info" key={`${framework}-${idx}`} className="me-3">
                                  {framework.certificationName} -{' '}
                                  {framework.certificationControls[0]?.name}
                                </CBadge>
                              ))}
                            </>
                          )}
                        </CCardText>
                      </CCardBody>
                      <CCardFooter>
                        <CButton
                          disabled={info.scoreInPercentage === 100}
                          onClick={() => openRemediation(info.actionUrl)}
                          className="me-3"
                        >
                          Remediate
                        </CButton>
                        <CButton onClick={() => openResolution(info)} className="me-3">
                          Change Status
                        </CButton>
                      </CCardFooter>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            </>
          )}
      </CippPage>
    </>
  )
}

export default SecureScore
