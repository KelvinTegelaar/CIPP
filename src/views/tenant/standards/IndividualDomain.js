import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Form, Field } from 'react-final-form'
import { useSearchParams } from 'react-router-dom'
import { useLazyListDomainTestsQuery, useListDomainTestsQuery } from '../../../store/api/domains'
import StatusIcon from 'src/components/cipp/StatusIcon'
import {
  CAlert,
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CCollapse,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CRow,
  CCardTitle,
  CListGroup,
  CListGroupItem,
  CTableDataCell,
  CTableHead,
  CTableRow,
  CTable,
  CTableHeaderCell,
  CTableBody,
  CBadge,
  CTooltip,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasBody,
  COffcanvasTitle,
  CInputGroup,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faCircleNotch,
  faCompressAlt,
  faExclamationTriangle,
  faExpandAlt,
  faTimesCircle,
  faCopy,
  faExternalLinkAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'

// const required = (value) => (value ? undefined : 'Required')

const IconGreenCheck = () => <FontAwesomeIcon icon={faCheckCircle} className="text-success mx-2" />
const IconRedX = () => <FontAwesomeIcon icon={faTimesCircle} className="text-danger mx-2" />
const IconWarning = () => (
  <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning mx-2" />
)
const IconExternalLink = () => <FontAwesomeIcon icon={faExternalLinkAlt} />
const IconCopy = () => <FontAwesomeIcon icon={faCopy} />

const domainCheckProps = {
  readOnly: PropTypes.bool,
  isOffcanvas: PropTypes.bool,
  initialDomain: PropTypes.string,
}

export default function IndividualDomainCheck({
  initialDomain = '',
  readOnly = false,
  isOffcanvas = false,
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [domain, setDomain] = useState('')
  const [rowXs, setRowXs] = useState()
  const [rowXl, setRowXl] = useState()
  const [trigger, { data, isFetching, isSuccess, ...rest }] = useLazyListDomainTestsQuery()

  useEffect(() => {
    if (initialDomain) {
      searchParams.set('domain', initialDomain)
    }
    // check if domain query is set
    const domainQuery = searchParams.get('domain')
    if (domainQuery) {
      setDomain(domainQuery)
      trigger({ domain: domainQuery })
    }

    if (isOffcanvas) {
      setRowXs({ cols: 1, gutter: 3 })
      setRowXl({ cols: 1, gutter: 3 })
    } else {
      setRowXs({ cols: 1, gutter: 4 })
      setRowXl({ cols: 2, gutter: 4 })
    }
  }, [searchParams, trigger, isOffcanvas])

  const onSubmit = (values) => {
    setDomain(values.domain)
    setSearchParams({ domain: values.domain }, { replace: true })
    trigger({ domain: values.domain })
  }

  return (
    <CRow xs={rowXs} xl={rowXl} className="mb-5">
      <CCol>
        <CCard className="page-card h-100">
          <CCardHeader>
            <CCardTitle className="text-primary">Email Security Domain Checker</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <Form
              initialValues={{ domain }}
              onSubmit={onSubmit}
              render={({ handleSubmit, submitting, pristine }) => {
                return (
                  <CForm onSubmit={handleSubmit}>
                    <Field name="domain">
                      {({ input, meta }) => {
                        return (
                          <CInputGroup className="mb-3">
                            <CFormInput
                              {...input}
                              valid={!meta.error && meta.touched}
                              invalid={meta.error && meta.touched}
                              type="text"
                              id="domain"
                              disabled={readOnly}
                              placeholder="Domain Name"
                              area-describedby="domain"
                            />

                            <CButton
                              type="submit"
                              disabled={submitting || isFetching || readOnly}
                              color="primary"
                            >
                              {isFetching && (
                                <FontAwesomeIcon
                                  icon={faCircleNotch}
                                  spin
                                  size="1x"
                                  className="me-2"
                                />
                              )}
                              Check
                            </CButton>
                          </CInputGroup>
                        )
                      }}
                    </Field>
                  </CForm>
                )
              }}
            />
            <DomainCheckError domain={domain} {...rest} />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol>{isSuccess && <MXResultsCard domain={domain} />}</CCol>
      <CCol>{isSuccess && <SPFResultsCard domain={domain} />}</CCol>
      <CCol>{isSuccess && <DMARCResultsCard domain={domain} />}</CCol>
      <CCol>{isSuccess && <DNSSECResultsCard domain={domain} />}</CCol>
      <CCol>{isSuccess && <DKIMResultsCard domain={domain} />}</CCol>
    </CRow>
  )
}

IndividualDomainCheck.propTypes = domainCheckProps

/*export default IndividualDomainCheck*/

const sharedProps = {
  domain: PropTypes.string,
}

const ResultsCard = ({ children, data, type }) => {
  if (!data) {
    return null
  }

  const results = data[`${type}Results`]
  // const passCount = data[`${type}PassCount`]
  // const warnCount = data[`${type}WarnCount`]
  // const failCount = data[`${type}FailCount`]
  const finalState = data[`${type}FinalState`]
  const validationPasses = results?.ValidationPasses || []
  const validationWarns = results?.ValidationWarns || []
  const validationFails = results?.ValidationFails || []

  return (
    <CCard className="page-card h-100">
      <CCardHeader>
        <CCardTitle className="text-primary">
          <StatusIcon type="finalstate" finalState={finalState} />
          {type} Results
        </CCardTitle>
      </CCardHeader>
      <CCardBody>
        {/* records and additional information is specific to each type
         * child prop passed in adds the additional information
         * above the generic passes/fails report
         */}
        {children}
        {validationPasses.map((validation, idx) => (
          <div key={`${idx}-validation-${type}`}>
            <IconGreenCheck />
            {String(validation.replace('PASS: ', ''))}
          </div>
        ))}
        {validationWarns.map((validation, idx) => (
          <div key={`${idx}-validation-${type}`}>
            <IconWarning />
            {String(validation.replace('WARN: ', ''))}
          </div>
        ))}
        {validationFails.map((validation, idx) => (
          <div key={`${idx}-validation-${type}`}>
            <IconRedX />
            {String(validation.replace('FAIL: ', ''))}
          </div>
        ))}
      </CCardBody>
    </CCard>
  )
}

ResultsCard.propTypes = {
  data: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  type: PropTypes.oneOf(['MX', 'SPF', 'DMARC', 'DNSSEC', 'DKIM']),
}

const SPFResultsCard = ({ domain }) => {
  const { data } = useListDomainTestsQuery({ domain })
  const textareaRef = useRef(null)
  let record = data?.SPFResults?.Record

  function copyToClipboard(e) {
    textareaRef.current.select()
    document.execCommand('copy')
    //e.target.focus()
    window.getSelection().removeAllRanges()
    setCopyAlertVisible()
    window.setTimeout(() => {
      setCopyAlertVisible(false)
    }, 2000)
  }

  const textareaStyle = {
    overflow: 'hidden',
    resize: 'none',
    paddingRight: '40px',
  }

  const [copyAlertVisible, setCopyAlertVisible] = useState(false)

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = '0px'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight + 'px'
    }
  }, [record])
  return (
    <ResultsCard data={data} type="SPF">
      {record && (
        <div style={{ position: 'relative' }}>
          <CButton
            onClick={copyToClipboard}
            style={{ position: 'absolute', top: '4px', right: '4px' }}
            size="sm"
            color="light"
          >
            <IconCopy />
          </CButton>
          <CFormTextarea
            style={textareaStyle}
            ref={textareaRef}
            className="bg-secondary text-white mb-2"
            value={record}
            readOnly
          />
          <CAlert visible={copyAlertVisible} color="info">
            Copied!
          </CAlert>
        </div>
      )}
    </ResultsCard>
  )
}

SPFResultsCard.propTypes = sharedProps

const MXResultsCard = ({ domain }) => {
  const { data } = useListDomainTestsQuery({ domain })
  const mailProviderName = data?.MXResults?.MailProvider?.Name
  let records = data?.MXResults?.Records || []

  if (!Array.isArray(records)) {
    records = [records]
  }
  const [visible, setVisible] = useState(false)
  return (
    <ResultsCard data={data} type="MX">
      <div className="mb-2">
        <CBadge style={{ fontSize: 14 }} color="secondary">
          Mail Provider: {mailProviderName || 'Unknown'}
        </CBadge>
        <CTooltip content="Click to toggle mail provider/MX record details">
          <CBadge
            className="ms-1 btn"
            onClick={() => setVisible(true)}
            style={{ fontSize: 14 }}
            color="primary"
          >
            Details
          </CBadge>
        </CTooltip>
      </div>
      <COffcanvas
        visible={visible}
        placement="end"
        className="cipp-offcanvas"
        onHide={() => setVisible(false)}
      >
        <COffcanvasHeader>
          <h2>Mail Provider Info</h2>
          <CButton className="cipp-offcanvas-close" color="link" onClick={() => setVisible(false)}>
            <FontAwesomeIcon size="lg" icon={faTimes} color="link" />
          </CButton>
        </COffcanvasHeader>
        <COffcanvasBody>
          {records.length > 0 && (
            <div>
              <COffcanvasTitle>MX Records</COffcanvasTitle>
              <CTable striped small>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Priority</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Hostname</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {records.map((record, key) => (
                    <CTableRow key={`${key}-mx-record`}>
                      <CTableDataCell>{record?.Priority}</CTableDataCell>
                      <CTableDataCell>{record?.Hostname}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          )}
          <COffcanvasTitle>Documentation</COffcanvasTitle>
          <CListGroup>
            {data?.MXResults?.MailProvider?._MxComment && (
              <CListGroupItem
                component="a"
                target="_blank"
                href={data?.MXResults?.MailProvider?._MxComment}
              >
                <IconExternalLink /> MX Record
              </CListGroupItem>
            )}
            {data?.MXResults?.MailProvider?._SpfComment && (
              <CListGroupItem
                component="a"
                target="_blank"
                href={data?.MXResults?.MailProvider?._SpfComment}
              >
                <IconExternalLink /> SPF Record
              </CListGroupItem>
            )}
            {data?.MXResults?.MailProvider?._DkimComment && (
              <CListGroupItem
                component="a"
                target="_blank"
                href={data?.MXResults?.MailProvider?._DkimComment}
              >
                <IconExternalLink /> DKIM Record
              </CListGroupItem>
            )}
          </CListGroup>
        </COffcanvasBody>
      </COffcanvas>
    </ResultsCard>
  )
}

MXResultsCard.propTypes = sharedProps

const DMARCResultsCard = ({ domain }) => {
  const { data } = useListDomainTestsQuery({ domain })
  let record = data?.DMARCResults?.Record
  const textareaRef = useRef(null)

  function copyToClipboard(e) {
    textareaRef.current.select()
    document.execCommand('copy')
    //e.target.focus()
    window.getSelection().removeAllRanges()
    setCopyAlertVisible()
    window.setTimeout(() => {
      setCopyAlertVisible(false)
    }, 2000)
  }
  const [copyAlertVisible, setCopyAlertVisible] = useState(false)

  const textareaStyle = {
    overflow: 'hidden',
    resize: 'none',
    paddingRight: '40px',
  }

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = '0px'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight + 'px'
    }
  }, [record])

  return (
    <ResultsCard data={data} type="DMARC">
      {record && (
        <div style={{ position: 'relative' }}>
          <CButton
            onClick={copyToClipboard}
            style={{ position: 'absolute', top: '4px', right: '4px' }}
            size="sm"
            color="light"
          >
            <IconCopy />
          </CButton>
          <CFormTextarea
            style={textareaStyle}
            ref={textareaRef}
            className="bg-secondary text-white mb-2"
            value={record}
            readOnly
          />
          <CAlert visible={copyAlertVisible} color="info">
            Copied!
          </CAlert>
        </div>
      )}
    </ResultsCard>
  )
}

DMARCResultsCard.propTypes = sharedProps

const DNSSECResultsCard = ({ domain }) => {
  const { data } = useListDomainTestsQuery({ domain })
  let keys = data?.DNSSECResults?.Keys
  const [visible, setVisible] = useState(false)

  if (!Array.isArray(keys)) {
    keys = [keys]
  }

  return (
    <ResultsCard data={data} type="DNSSEC">
      {keys.length > 0 && (
        <div className="mb-2">
          <CTooltip content="Click to toggle DNSSEC records">
            <CBadge
              className="btn"
              onClick={() => setVisible(!visible)}
              style={{ fontSize: 14 }}
              color="primary"
            >
              {(visible && 'Hide') || 'Show'} Records
            </CBadge>
          </CTooltip>
        </div>
      )}
      <CCollapse visible={visible} className="mb-2">
        {keys.map((key, idx) => (
          <CFormTextarea
            className="bg-secondary text-white mb-2"
            key={`${idx}-dnssec-key`}
            value={key}
            readOnly
          ></CFormTextarea>
        ))}
      </CCollapse>
    </ResultsCard>
  )
}

DNSSECResultsCard.propTypes = sharedProps

const DKIMResultsCard = ({ domain }) => {
  const { data } = useListDomainTestsQuery({ domain })
  let records = data?.DKIMResults?.Records
  const [visible, setVisible] = useState(false)
  if (!Array.isArray(records)) {
    records = [records]
  }

  return (
    <ResultsCard data={data} type="DKIM">
      {records.length > 0 && (
        <div className="mb-2">
          <CTooltip content="Click to toggle DKIM records">
            <CBadge
              className="btn"
              onClick={() => setVisible(!visible)}
              style={{ fontSize: 14 }}
              color="primary"
            >
              {(visible && 'Hide') || 'Show'} Records
            </CBadge>
          </CTooltip>
        </div>
      )}
      <CCollapse visible={visible} className="mb-2">
        {records.map((record, idx) => (
          <div key={`${idx}-dkim-record`}>
            <CFormLabel>{record?.Selector}._domainkey</CFormLabel>
            <CFormTextarea
              className="bg-secondary text-white mb-2"
              value={record?.Record}
              readOnly
            ></CFormTextarea>
          </div>
        ))}
      </CCollapse>
    </ResultsCard>
  )
}

DKIMResultsCard.propTypes = sharedProps

const DomainCheckError = (props) => {
  const [expanded, setExpanded] = useState(false)

  const { isError, domain, error } = props

  if (!isError) {
    return null
  }

  return (
    isError && (
      <CCallout color="danger">
        <div className="d-flex justify-content-between">
          <div>
            Unable to load domain check for <b>{domain}</b>
            <br />
            {error?.message}
          </div>
          <FontAwesomeIcon
            size="2x"
            style={{ padding: '3px' }}
            icon={expanded ? faCompressAlt : faExpandAlt}
            onClick={() => setExpanded(!expanded)}
          />
        </div>
        <CCollapse visible={expanded}>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </CCollapse>
      </CCallout>
    )
  )
}

DomainCheckError.propTypes = {
  error: PropTypes.object,
  isError: PropTypes.bool,
  domain: PropTypes.string,
}
