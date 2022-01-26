import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Form, Field } from 'react-final-form'
import { useSearchParams } from 'react-router-dom'
import { useExecDnsHelperQuery } from 'src/store/api/domains'
import { CippCodeBlock, CippOffcanvas, StatusIcon } from 'src/components/utilities'
import { CippPage, CippMasonry, CippMasonryItem } from '../../../components/layout'
import ListGroupContentCard from '../../../components/contentcards/ListGroupContentCard'
import {
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCollapse,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CHeaderNav,
  CForm,
  CFormLabel,
  CFormInput,
  CCardTitle,
  CLink,
  CListGroup,
  CListGroupItem,
  CNavItem,
  CSpinner,
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
  faServer,
  faCheckCircle,
  faCompressAlt,
  faExclamationTriangle,
  faExpandAlt,
  faTimesCircle,
  faExternalLinkAlt,
  faEllipsisV,
  faSearch,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons'

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
  const [masonrySize, setMasonrySize] = useState()

  useEffect(() => {
    if (initialDomain) {
      searchParams.set('domain', initialDomain)
    }
    // check if domain query is set
    const domainQuery = searchParams.get('domain')
    if (domainQuery) {
      setDomain(domainQuery)
    }

    if (isOffcanvas) {
      setMasonrySize('triple')
    } else {
      setMasonrySize('single')
    }
  }, [searchParams, isOffcanvas, initialDomain])

  const onSubmit = (values) => {
    setDomain(values.domain)
    setSearchParams({ domain: values.domain }, { replace: true })
  }

  return (
    <CippPage title="Individual Domain Check" tenantSelector={false}>
      <CippMasonry>
        <CippMasonryItem size={masonrySize}>
          <CCard className="content-card h-100">
            <CCardHeader>
              <CCardTitle>
                <FontAwesomeIcon icon={faSearch} className="mx-2" />
                Domain
              </CCardTitle>
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

                              <CButton type="submit" disabled={submitting} color="primary">
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
            </CCardBody>
          </CCard>
        </CippMasonryItem>
        {domain && (
          <CippMasonryItem size={masonrySize}>
            <WhoisResultCard domain={domain} />
          </CippMasonryItem>
        )}
        {domain && (
          <CippMasonryItem size={masonrySize}>
            <NSResultCard domain={domain} />
          </CippMasonryItem>
        )}
        {domain && (
          <CippMasonryItem size={masonrySize}>
            <MXResultsCard domain={domain} />
          </CippMasonryItem>
        )}
        {domain && (
          <CippMasonryItem size={masonrySize}>
            <SPFResultsCard domain={domain} />
          </CippMasonryItem>
        )}
        {domain && (
          <CippMasonryItem size={masonrySize}>
            <DMARCResultsCard domain={domain} />
          </CippMasonryItem>
        )}
        {domain && (
          <CippMasonryItem size={masonrySize}>
            <DKIMResultsCard domain={domain} />
          </CippMasonryItem>
        )}
        {domain && (
          <CippMasonryItem size={masonrySize}>
            <DNSSECResultsCard domain={domain} />
          </CippMasonryItem>
        )}
      </CippMasonry>
    </CippPage>
  )
}

IndividualDomainCheck.propTypes = domainCheckProps

const sharedProps = {
  domain: PropTypes.string,
}

function ResultsCard({ children, data, type, menuOptions = [], error, errorMessage, isFetching }) {
  const [jsonVisible, setJsonVisible] = useState()

  const validationPasses = data?.ValidationPasses || []
  const validationWarns = data?.ValidationWarns || []
  const validationFails = data?.ValidationFails || []

  let finalState = ''
  if (validationFails > 0) {
    finalState = 'Fail'
  } else if (validationFails.length === 0 && validationWarns.length > 0) {
    finalState = 'Warn'
  } else if (
    validationFails.length === 0 &&
    validationWarns.length === 0 &&
    validationPasses.length > 0
  ) {
    finalState = 'Pass'
  } else {
    finalState = 'Fail'
  }

  const jsonContent = JSON.stringify(data, null, 2)

  return (
    <>
      <CCard className="content-card h-100">
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
          {isFetching && <CSpinner />}
          {!isFetching && error && <>{errorMessage}</>}
          {!isFetching && !error && (
            <>
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
            </>
          )}
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
        {isFetching && <CSpinner />}
        {!isFetching && error && <>{errorMessage}</>}
        {!isFetching && !error && (
          <CippCodeBlock
            language="json"
            code={jsonContent}
            showLineNumbers={true}
            wrapLongLines={false}
          />
        )}
      </CippOffcanvas>
    </>
  )
}

ResultsCard.propTypes = {
  data: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  type: PropTypes.oneOf(['MX', 'SPF', 'DMARC', 'DNSSEC', 'DKIM']),
  menuOptions: PropTypes.array,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  isFetching: PropTypes.bool,
}

const SPFResultsCard = ({ domain }) => {
  const { data, isFetching, error } = useExecDnsHelperQuery({
    domain: domain,
    action: 'ReadSpfRecord',
  })

  const textareaRef = useRef(null)
  let record = data?.Record

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = '0px'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight + 'px'
    }
  }, [record])
  return (
    <ResultsCard
      data={data}
      type="SPF"
      isFetching={isFetching}
      error={error}
      errorMessage="Unable to load SPF Results"
    >
      {record && (
        <CippCodeBlock language="text" code={record} showLineNumbers={false} wrapLongLines={true} />
      )}
    </ResultsCard>
  )
}
SPFResultsCard.propTypes = sharedProps

function WhoisResultCard({ domain }) {
  const [visible, setVisible] = useState(false)
  const {
    data: whoisReport,
    isFetching,
    error,
  } = useExecDnsHelperQuery({ domain: domain, action: 'ReadWhoisRecord' })

  const menuOptions = [
    {
      title: 'Show Details',
      clickFunction: () => {
        setVisible(true)
      },
    },
  ]
  return (
    <CCard className="content-card h-100">
      <CCardHeader>
        <CCardTitle>
          <CHeaderNav className="justify-content-between">
            <CNavItem>
              <FontAwesomeIcon icon={faGlobe} className="mx-2" /> WHOIS Results
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
              </CDropdownMenu>
            </CDropdown>
          </CHeaderNav>
        </CCardTitle>
      </CCardHeader>
      <CCardBody>
        {isFetching && <CSpinner />}
        {!isFetching && error && <>Unable to obtain WHOIS information</>}
        {!isFetching && !error && (
          <>
            <h5>Registrar</h5>
            {whoisReport?._Registrar}
            <CippOffcanvas
              title="WHOIS Info"
              id="whois-offcanvas"
              visible={visible}
              placement="end"
              className="cipp-offcanvas"
              hideFunction={() => setVisible(false)}
            >
              <CippCodeBlock language="text" code={whoisReport?._Raw} />
            </CippOffcanvas>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}
WhoisResultCard.propTypes = sharedProps

function NSResultCard({ domain }) {
  const {
    data: nsReport,
    isFetching,
    error,
  } = useExecDnsHelperQuery({ domain: domain, action: 'ReadNSRecord' })
  const content = []
  nsReport?.Records.map((ns, index) =>
    content.push({
      body: ns,
    }),
  )
  const title = (
    <>
      <FontAwesomeIcon icon={faServer} className="mx-2" />
      Nameservers
    </>
  )

  return (
    <ListGroupContentCard
      title={title}
      content={content}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch nameservers"
    />
  )
}
NSResultCard.propTypes = sharedProps

const MXResultsCard = ({ domain }) => {
  const { data, isFetching, error } = useExecDnsHelperQuery({
    domain: domain,
    action: 'ReadMXRecord',
  })
  const mailProviderName = data?.MailProvider?.Name
  let records = data?.Records || []

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
    <ResultsCard
      data={data}
      type="MX"
      menuOptions={menuOptions}
      isFetching={isFetching}
      error={error}
      errorMessage="Unable to load MX Results"
    >
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

function DMARCResultsCard({ domain }) {
  const { data, isFetching, error } = useExecDnsHelperQuery({
    domain: domain,
    action: 'ReadDmarcPolicy',
  })
  let record = data?.Record

  return (
    <ResultsCard
      data={data}
      type="DMARC"
      isFetching={isFetching}
      error={error}
      errorMessage="Unable to load DMARC Results"
    >
      {record && (
        <CippCodeBlock language="text" code={record} showLineNumbers={false} wrapLongLines={true} />
      )}
    </ResultsCard>
  )
}

DMARCResultsCard.propTypes = sharedProps

function DNSSECResultsCard({ domain }) {
  const { data, isFetching, error } = useExecDnsHelperQuery({
    domain: domain,
    action: 'TestDNSSEC',
  })
  let keys = data?.Keys

  if (!Array.isArray(keys)) {
    keys = []
  }
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
      <ResultsCard
        data={data}
        type="DNSSEC"
        menuOptions={menuOptions}
        isFetching={isFetching}
        error={error}
        errorMessage="Unable to load DNSSEC Results"
      />
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

function DKIMResultsCard({ domain }) {
  const { data, isFetching, error } = useExecDnsHelperQuery({
    domain: domain,
    action: 'ReadDkimRecord',
  })
  let records = data?.Records
  if (!Array.isArray(records)) {
    records = []
  }
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
      <ResultsCard
        data={data}
        type="DKIM"
        menuOptions={menuOptions}
        isFetching={isFetching}
        error={error}
        errorMessage="Unable to load DKIM Results"
      />
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

function DomainCheckError(props) {
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
