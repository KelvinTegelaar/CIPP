import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Form, Field } from 'react-final-form'
import { useSearchParams } from 'react-router-dom'
import { useLazyListDomainTestsQuery, useListDomainTestsQuery } from 'src/store/api/domains'
import { CippCodeBlock, CippOffcanvas, StatusIcon } from 'src/components/utilities'
import {
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CCollapse,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CHeaderNav,
  CForm,
  CFormLabel,
  CFormInput,
  CRow,
  CCardTitle,
  CLink,
  CListGroup,
  CListGroupItem,
  CNavItem,
  CTableDataCell,
  CTableHead,
  CTableRow,
  CTable,
  CTableHeaderCell,
  CTableBody,
  CBadge,
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
  faExternalLinkAlt,
  faEllipsisV,
} from '@fortawesome/free-solid-svg-icons'

// const required = (value) => (value ? undefined : 'Required')

const IconGreenCheck = () => <FontAwesomeIcon icon={faCheckCircle} className="text-success mx-2" />
const IconRedX = () => <FontAwesomeIcon icon={faTimesCircle} className="text-danger mx-2" />
const IconWarning = () => (
  <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning mx-2" />
)
const IconExternalLink = () => <FontAwesomeIcon icon={faExternalLinkAlt} className="me-2" />

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
  }, [searchParams, trigger, isOffcanvas, initialDomain])

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
            <CCardTitle>Email Security Domain Checker</CCardTitle>
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
                              disabled={submitting || isFetching}
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

const ResultsCard = ({ children, data, type, menuOptions = [] }) => {
  const [jsonVisible, setJsonVisible] = useState()
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

  const jsonContent = JSON.stringify(results, null, 2)

  return (
    <>
      <CCard className="page-card h-100">
        <CCardHeader>
          <CCardTitle>
            <CHeaderNav className="justify-content-between">
              <CNavItem>
                <StatusIcon type="finalstate" finalState={finalState} />
                {type} Results
              </CNavItem>
              <CDropdown variant="nav-item">
                <CDropdownToggle placement="end" className="py-0" caret={false}>
                  <FontAwesomeIcon icon={faEllipsisV} className="me-2" />
                  More
                </CDropdownToggle>
                <CDropdownMenu className="py-0" placement="bottom-end">
                  {menuOptions.map((option, idx) => (
                    <CLink
                      className="dropdown-item"
                      key={`${idx}-menu-option`}
                      href="#"
                      onClick={option.clickFunction}
                    >
                      {option.title}
                    </CLink>
                  ))}
                  <CLink className="dropdown-item" href="#" onClick={() => setJsonVisible(true)}>
                    Show JSON
                  </CLink>
                </CDropdownMenu>
              </CDropdown>
            </CHeaderNav>
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
      <CippOffcanvas
        id="json-offcanvas"
        visible={jsonVisible}
        placement="end"
        className="cipp-offcanvas"
        hideFunction={() => setJsonVisible(false)}
        title="JSON"
      >
        <CippCodeBlock
          language="json"
          code={jsonContent}
          showLineNumbers={true}
          wrapLongLines={false}
        />
      </CippOffcanvas>
    </>
  )
}

ResultsCard.propTypes = {
  data: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  type: PropTypes.oneOf(['MX', 'SPF', 'DMARC', 'DNSSEC', 'DKIM']),
  menuOptions: PropTypes.array,
}

const SPFResultsCard = ({ domain }) => {
  const { data } = useListDomainTestsQuery({ domain })
  const textareaRef = useRef(null)
  let record = data?.SPFResults?.Record

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
        <CippCodeBlock language="text" code={record} showLineNumbers={false} wrapLongLines={true} />
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

  const menuOptions = [
    {
      title: 'Show Details',
      clickFunction: () => {
        setVisible(true)
      },
    },
  ]

  return (
    <ResultsCard data={data} type="MX" menuOptions={menuOptions}>
      <CBadge style={{ fontSize: 14 }} color="info" className="mb-2">
        Mail Provider: {mailProviderName || 'Unknown'}
      </CBadge>
      <CippOffcanvas
        id="mx-provider-offcanvas"
        visible={visible}
        placement="end"
        className="cipp-offcanvas"
        hideFunction={() => setVisible(false)}
        title="Mail Provider Info"
      >
        {records.length > 0 && (
          <>
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
          </>
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
      </CippOffcanvas>
    </ResultsCard>
  )
}

MXResultsCard.propTypes = sharedProps

const DMARCResultsCard = ({ domain }) => {
  const { data } = useListDomainTestsQuery({ domain })
  let record = data?.DMARCResults?.Record

  return (
    <ResultsCard data={data} type="DMARC">
      {record && (
        <CippCodeBlock language="text" code={record} showLineNumbers={false} wrapLongLines={true} />
      )}
    </ResultsCard>
  )
}

DMARCResultsCard.propTypes = sharedProps

const DNSSECResultsCard = ({ domain }) => {
  const { data } = useListDomainTestsQuery({ domain })
  let keys = data?.DNSSECResults?.Keys
  const [visible, setVisible] = useState(false)

  let menuOptions = []
  if (keys.length > 0) {
    menuOptions = [
      {
        title: 'Show Details',
        clickFunction: () => {
          setVisible(true)
        },
      },
    ]
  }

  if (!Array.isArray(keys)) {
    keys = [keys]
  }

  return (
    <>
      <ResultsCard data={data} type="DNSSEC" menuOptions={menuOptions} />
      <CippOffcanvas
        id="dnssec-offcanvas"
        visible={visible}
        placement="end"
        className="cipp-offcanvas"
        hideFunction={() => setVisible(false)}
        title="DNSSEC Records"
      >
        {keys.map((key, idx) => (
          <CippCodeBlock
            language="text"
            key={`${idx}-dnssec-key`}
            code={key}
            showLineNumbers={false}
            wrapLongLines={true}
          />
        ))}
      </CippOffcanvas>
    </>
  )
}

DNSSECResultsCard.propTypes = sharedProps

const DKIMResultsCard = ({ domain }) => {
  const { data } = useListDomainTestsQuery({ domain })
  let records = data?.DKIMResults?.Records
  const [visible, setVisible] = useState(false)

  let menuOptions = []
  if (records.length > 0) {
    menuOptions = [
      {
        title: 'Show Details',
        clickFunction: () => {
          setVisible(true)
        },
      },
    ]
  }

  if (!Array.isArray(records)) {
    records = [records]
  }

  return (
    <>
      <ResultsCard data={data} type="DKIM" menuOptions={menuOptions} />
      {records.length > 0 && (
        <CippOffcanvas
          id="dkim-offcanvas"
          visible={visible}
          placement="end"
          className="cipp-offcanvas"
          hideFunction={() => setVisible(false)}
          title="DKIM Records"
        >
          {records.map((record, idx) => (
            <div key={`${idx}-dkim-record`}>
              <CFormLabel>{record?.Selector}._domainkey</CFormLabel>
              {record?.Record && (
                <CippCodeBlock
                  language="text"
                  key={`${idx}-dnssec-key`}
                  code={record?.Record}
                  showLineNumbers={false}
                  wrapLongLines={true}
                />
              )}
            </div>
          ))}
        </CippOffcanvas>
      )}
    </>
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
