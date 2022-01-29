import React, { useEffect, useState } from 'react'
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
  CForm,
  CFormLabel,
  CFormInput,
  CCardTitle,
  CLink,
  CListGroup,
  CListGroupItem,
  CNav,
  CNavItem,
  CNavLink,
  CSpinner,
  CTabContent,
  CTabPane,
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

export default function IndividualDomainPage() {
  return (
    <CippPage title="Individual Domain Check" tenantSelector={false}>
      <IndividualDomainCheck />
    </CippPage>
  )
}

export function IndividualDomainCheck({
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
    if (domainQuery && domainQuery !== undefined) {
      setDomain(domainQuery)
    }

    if (isOffcanvas) {
      setMasonrySize('triple')
    } else {
      setMasonrySize('single')
    }
  }, [searchParams, isOffcanvas, initialDomain])

  const onSubmit = (values) => {
    if (values.domain !== undefined) {
      setDomain(values.domain)
      setSearchParams({ domain: values.domain }, { replace: true })
    }
  }

  return (
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

                            <CButton type="submit" color="primary">
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
  )
}

IndividualDomainCheck.propTypes = domainCheckProps

const sharedProps = {
  domain: PropTypes.string,
}

function DomainOffcanvasTabs({ children, jsonContent }) {
  let initialActive = 1
  if (!children) {
    initialActive = 2
  }
  const [active, setActive] = useState(initialActive)
  return (
    <>
      <CNav variant="pills" layout="fill">
        {children && (
          <CNavItem>
            <CNavLink active={active === 1} onClick={() => setActive(1)}>
              Details
            </CNavLink>
          </CNavItem>
        )}
        <CNavItem>
          <CNavLink active={active === 2} onClick={() => setActive(2)}>
            JSON
          </CNavLink>
        </CNavItem>
      </CNav>
      <CTabContent>
        {children && (
          <CTabPane visible={active === 1} className="mt-3">
            {children}
          </CTabPane>
        )}
        <CTabPane visible={active === 2} className="mt-3">
          <CippCodeBlock
            language="json"
            code={jsonContent}
            showLineNumbers={true}
            wrapLongLines={false}
          />
        </CTabPane>
      </CTabContent>
    </>
  )
}
DomainOffcanvasTabs.propTypes = {
  children: PropTypes.node,
  jsonContent: PropTypes.string,
}

function ResultsCard({
  children,
  data,
  type,
  headerClickFunction,
  error,
  errorMessage,
  isFetching,
}) {
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

  return (
    <>
      <CCard className="content-card">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <CCardTitle>
            {!isFetching && <StatusIcon type="finalstate" finalState={finalState} />}
            {type} Results
          </CCardTitle>
          <CLink className="mx-2 card-header-link" onClick={headerClickFunction}>
            <FontAwesomeIcon icon={faEllipsisV} className="me-2" />
            More
          </CLink>
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
    </>
  )
}

ResultsCard.propTypes = {
  data: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  type: PropTypes.oneOf(['MX', 'SPF', 'DMARC', 'DNSSEC', 'DKIM']),
  headerClickFunction: PropTypes.func,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  isFetching: PropTypes.bool,
}

const SPFResultsCard = ({ domain }) => {
  const { data, isFetching, error } = useExecDnsHelperQuery({
    domain: domain,
    action: 'ReadSpfRecord',
  })

  let record = data?.Record
  const [visible, setVisible] = useState(false)
  const headerClickFunction = () => {
    setVisible(true)
  }
  const jsonContent = JSON.stringify(data, null, 2)

  return (
    <>
      <ResultsCard
        data={data}
        type="SPF"
        isFetching={isFetching}
        headerClickFunction={headerClickFunction}
        error={error}
        errorMessage="Unable to load SPF Results"
      >
        {record && (
          <CippCodeBlock
            language="text"
            code={record}
            showLineNumbers={false}
            wrapLongLines={true}
          />
        )}
      </ResultsCard>
      <CippOffcanvas
        id="spf-offcanvas"
        visible={visible}
        placement="end"
        className="cipp-offcanvas"
        hideFunction={() => setVisible(false)}
        title="SPF Details"
      >
        {!isFetching && error && <>Unable to load SPF details</>}
        {!isFetching && !error && <DomainOffcanvasTabs jsonContent={jsonContent} />}
      </CippOffcanvas>
    </>
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
  const jsonContent = JSON.stringify(whoisReport, null, 2)

  return (
    <CCard className="content-card h-100">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <CCardTitle>
          <FontAwesomeIcon icon={faGlobe} className="mx-2" /> WHOIS Results
        </CCardTitle>
        <CLink
          href="#"
          onClick={() => {
            setVisible(true)
          }}
          className="mx-2 card-header-link"
        >
          <FontAwesomeIcon icon={faEllipsisV} className="me-2" />
          More
        </CLink>
      </CCardHeader>
      <CCardBody>
        {isFetching && <CSpinner />}
        {!isFetching && error && <>Unable to obtain WHOIS information</>}
        {!isFetching && !error && (
          <>
            <h5>Registrar</h5>
            {whoisReport?._Registrar}
            <CippOffcanvas
              title="WHOIS Details"
              id="whois-offcanvas"
              visible={visible}
              placement="end"
              className="cipp-offcanvas"
              hideFunction={() => setVisible(false)}
            >
              <DomainOffcanvasTabs jsonContent={jsonContent}>
                <CippCodeBlock language="text" code={whoisReport?._Raw} showLineNumbers={false} />
              </DomainOffcanvasTabs>
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
      errorMessage="Unable to obtain nameservers"
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

  const jsonContent = JSON.stringify(data, null, 2)

  if (!Array.isArray(records)) {
    records = [records]
  }
  const [visible, setVisible] = useState(false)
  const headerClickFunction = () => {
    setVisible(true)
  }

  return (
    <ResultsCard
      data={data}
      type="MX"
      headerClickFunction={headerClickFunction}
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
        title="MX Details"
      >
        <DomainOffcanvasTabs jsonContent={jsonContent}>
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
            {data?.MailProvider?._MxComment && (
              <CListGroupItem component="a" target="_blank" href={data?.MailProvider?._MxComment}>
                <IconExternalLink /> MX Record
              </CListGroupItem>
            )}
            {data?.MailProvider?._SpfComment && (
              <CListGroupItem component="a" target="_blank" href={data?.MailProvider?._SpfComment}>
                <IconExternalLink /> SPF Record
              </CListGroupItem>
            )}
            {data?.MailProvider?._DkimComment && (
              <CListGroupItem component="a" target="_blank" href={data?.MailProvider?._DkimComment}>
                <IconExternalLink /> DKIM Record
              </CListGroupItem>
            )}
          </CListGroup>
        </DomainOffcanvasTabs>
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
  const [visible, setVisible] = useState(false)
  const headerClickFunction = () => {
    setVisible(true)
  }
  const jsonContent = JSON.stringify(data, null, 2)

  return (
    <>
      <ResultsCard
        data={data}
        type="DMARC"
        isFetching={isFetching}
        headerClickFunction={headerClickFunction}
        error={error}
        errorMessage="Unable to load DMARC Results"
      >
        {record && (
          <CippCodeBlock
            language="text"
            code={record}
            showLineNumbers={false}
            wrapLongLines={true}
          />
        )}
      </ResultsCard>
      <CippOffcanvas
        id="dmarc-offcanvas"
        visible={visible}
        placement="end"
        className="cipp-offcanvas"
        hideFunction={() => setVisible(false)}
        title="DMARC Details"
      >
        {!isFetching && error && <>Unable to load DMARC details</>}
        {!isFetching && !error && <DomainOffcanvasTabs jsonContent={jsonContent} />}
      </CippOffcanvas>
    </>
  )
}

DMARCResultsCard.propTypes = sharedProps

function DNSSECResultsCard({ domain }) {
  const { data, isFetching, error } = useExecDnsHelperQuery({
    domain: domain,
    action: 'TestDNSSEC',
  })
  let keys = data?.Keys
  const jsonContent = JSON.stringify(data, null, 2)

  if (!Array.isArray(keys)) {
    keys = []
  }
  const [visible, setVisible] = useState(false)

  const headerClickFunction = () => {
    setVisible(true)
  }

  if (!Array.isArray(keys)) {
    keys = [keys]
  }

  return (
    <>
      <ResultsCard
        data={data}
        type="DNSSEC"
        headerClickFunction={headerClickFunction}
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
        title="DNSSEC Details"
      >
        {!isFetching && !error && (
          <DomainOffcanvasTabs jsonContent={jsonContent}>
            {keys.length >
            (
              <>
                {keys.map((key, idx) => (
                  <CippCodeBlock
                    language="text"
                    key={`${idx}-dnssec-key`}
                    code={key}
                    showLineNumbers={false}
                    wrapLongLines={true}
                  />
                ))}
              </>
            )}
          </DomainOffcanvasTabs>
        )}
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
  const jsonContent = JSON.stringify(data, null, 2)

  if (!Array.isArray(records)) {
    records = []
  }
  const [visible, setVisible] = useState(false)

  const headerClickFunction = () => {
    setVisible(true)
  }

  if (!Array.isArray(records)) {
    records = [records]
  }

  return (
    <>
      <ResultsCard
        data={data}
        type="DKIM"
        headerClickFunction={headerClickFunction}
        isFetching={isFetching}
        error={error}
        errorMessage="Unable to load DKIM Results"
      />
      {!isFetching && !error && (
        <CippOffcanvas
          id="dkim-offcanvas"
          visible={visible}
          placement="end"
          className="cipp-offcanvas"
          hideFunction={() => setVisible(false)}
          title="DKIM Details"
        >
          <DomainOffcanvasTabs jsonContent={jsonContent}>
            {records.length > 0 && (
              <>
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
              </>
            )}
          </DomainOffcanvasTabs>
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
