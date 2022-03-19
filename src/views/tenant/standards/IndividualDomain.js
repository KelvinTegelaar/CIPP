import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Field } from 'react-final-form'
import { useSearchParams } from 'react-router-dom'
import { useListDomainHealthQuery } from 'src/store/api/domains'
import { CippCodeBlock, CippOffcanvas, StatusIcon } from 'src/components/utilities'
import { OffcanvasListSection } from 'src/components/utilities/CippListOffcanvas'
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
  CFormSwitch,
  CFormInput,
  CCardTitle,
  CLink,
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
  CTooltip,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faServer,
  faCog,
  faCheckCircle,
  faCompressAlt,
  faEraser,
  faExclamationTriangle,
  faExpandAlt,
  faInfoCircle,
  faTimesCircle,
  faEllipsisV,
  faSearch,
  faGlobe,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons'

const IconGreenCheck = () => <FontAwesomeIcon icon={faCheckCircle} className="text-success mx-2" />
const IconRedX = () => <FontAwesomeIcon icon={faTimesCircle} className="text-danger mx-2" />
const IconWarning = () => (
  <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning mx-2" />
)

const domainCheckProps = {
  readOnly: PropTypes.bool,
  isOffcanvas: PropTypes.bool,
  initialDomain: PropTypes.string,
}

function ucFirst(string) {
  if (typeof string !== 'string') return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
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
  const [spfOverride, setSpfOverride] = useState('')
  const [dkimOverride, setDkimOverride] = useState('')
  const [enableHttps, setEnableHttps] = useState(false)
  const [httpsOverride, setHttpsOverride] = useState('')
  const [optionsVisible, setOptionsVisible] = useState(false)
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

    if (values.spfrecord !== spfOverride) {
      setSpfOverride(values.spfrecord)
    }
    if (values.dkimselector !== dkimOverride) {
      setDkimOverride(values.dkimselector)
    }
    if (values.subdomains !== httpsOverride) {
      setHttpsOverride(values.subdomains)
    }
  }

  const handleHttpsSwitch = (e) => {
    setEnableHttps(e.target.checked)
  }

  const handleClear = () => {
    setDomain('')
    setHttpsOverride('')
    setDkimOverride('')
    setSpfOverride('')
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
              initialValues={{
                domain,
                spfrecord: spfOverride,
                dkimselector: dkimOverride,
                subdomains: httpsOverride,
              }}
              onSubmit={onSubmit}
              render={({ handleSubmit, submitting, pristine }) => {
                return (
                  <CForm onSubmit={handleSubmit}>
                    <Field name="domain">
                      {({ input, meta }) => {
                        return (
                          <>
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
                                autoCapitalize="none"
                                autoCorrect="off"
                              />
                              <CButton type="submit" color="primary">
                                Check
                              </CButton>
                              <CTooltip content="Options">
                                <CButton
                                  size="sm"
                                  variant="outline"
                                  color="light"
                                  onClick={() => setOptionsVisible(!optionsVisible)}
                                >
                                  <FontAwesomeIcon className="mx-1" size="1x" icon={faCog} />
                                </CButton>
                              </CTooltip>
                            </CInputGroup>
                          </>
                        )
                      }}
                    </Field>

                    <CCollapse visible={optionsVisible}>
                      <h5>Options</h5>
                      <Field name="spfrecord">
                        {({ input, meta }) => {
                          return (
                            <CFormInput
                              {...input}
                              valid={!meta.error && meta.touched}
                              invalid={meta.error && meta.touched}
                              type="text"
                              id="spfrecord"
                              className="mt-1"
                              placeholder="Pre-validate SPF Record (e.g. v=spf1 ...)"
                              area-describedby="spfrecord"
                              autoCapitalize="none"
                              autoCorrect="off"
                            />
                          )
                        }}
                      </Field>
                      <Field name="dkimselector">
                        {({ input, meta }) => {
                          return (
                            <CFormInput
                              {...input}
                              valid={!meta.error && meta.touched}
                              invalid={meta.error && meta.touched}
                              type="text"
                              id="dkimselector"
                              className="mt-1"
                              placeholder="DKIM Selectors (e.g. selector1, selector2)"
                              area-describedby="dkimselector"
                              autoCapitalize="none"
                              autoCorrect="off"
                            />
                          )
                        }}
                      </Field>

                      <CFormSwitch
                        onChange={handleHttpsSwitch}
                        label="Enable HTTPS check"
                        id="enableHttpsCheck"
                        className="mt-2"
                      />

                      {enableHttps && (
                        <Field name="subdomains">
                          {({ input, meta }) => {
                            return (
                              <CFormInput
                                {...input}
                                valid={!meta.error && meta.touched}
                                invalid={meta.error && meta.touched}
                                type="text"
                                id="subdomains"
                                className="my-2"
                                placeholder="HTTPS Subdomains (Default: www)"
                                area-describedby="subdomains"
                                autoCapitalize="none"
                                autoCorrect="off"
                              />
                            )
                          }}
                        </Field>
                      )}
                      {!readOnly && (
                        <CButton
                          className="mt-2"
                          size="sm"
                          variant="outline"
                          color="danger"
                          onClick={() => handleClear()}
                        >
                          <FontAwesomeIcon className="me-2" size="1x" icon={faEraser} />
                          Clear
                        </CButton>
                      )}
                    </CCollapse>
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
      {domain && enableHttps && (
        <CippMasonryItem size={masonrySize}>
          <HttpsResultCard domain={domain} httpsOverride={httpsOverride} />
        </CippMasonryItem>
      )}
      {domain && (
        <CippMasonryItem size={masonrySize}>
          <MXResultsCard domain={domain} />
        </CippMasonryItem>
      )}
      {domain && (
        <CippMasonryItem size={masonrySize}>
          <SPFResultsCard domain={domain} spfOverride={spfOverride} />
        </CippMasonryItem>
      )}
      {domain && (
        <CippMasonryItem size={masonrySize}>
          <DMARCResultsCard domain={domain} />
        </CippMasonryItem>
      )}
      {domain && (
        <CippMasonryItem size={masonrySize}>
          <DKIMResultsCard domain={domain} dkimOverride={dkimOverride} />
        </CippMasonryItem>
      )}
      {domain && (
        <CippMasonryItem size={masonrySize}>
          <DNSSECResultsCard domain={domain} />
        </CippMasonryItem>
      )}
      {domain && (
        <CippMasonryItem size={masonrySize}>
          <MtaStsResultCard domain={domain} />
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

function ValidationListContent({ data }) {
  let validationPasses = data?.ValidationPasses || []
  let validationWarns = data?.ValidationWarns || []
  let validationFails = data?.ValidationFails || []

  return (
    <div>
      {validationPasses.map((validation, idx) => (
        <div key={`${idx}-validation`}>
          <IconGreenCheck />
          {validation}
        </div>
      ))}
      {validationWarns.map((validation, idx) => (
        <div key={`${idx}-validation`}>
          <IconWarning />
          {validation}
        </div>
      ))}
      {validationFails.map((validation, idx) => (
        <div key={`${idx}-validation`}>
          <IconRedX />
          {validation}
        </div>
      ))}
    </div>
  )
}
ValidationListContent.propTypes = {
  data: PropTypes.object,
}

function ResultsCard({
  children,
  data,
  type,
  headerClickFunction,
  providerInfo,
  error,
  errorMessage,
  isFetching,
}) {
  let validationPasses = data?.ValidationPasses || []
  let validationWarns = data?.ValidationWarns || []
  let validationFails = data?.ValidationFails || []

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
          <span>
            {providerInfo && (
              <CTooltip content={`${providerInfo.Name} ${type} documentation`}>
                <CLink
                  className="mx-2 card-header-link"
                  href={providerInfo._MxComment}
                  target="_blank"
                >
                  <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
                </CLink>
              </CTooltip>
            )}
            <CLink className="mx-2 card-header-link" onClick={headerClickFunction}>
              <FontAwesomeIcon icon={faEllipsisV} className="me-2" />
              More
            </CLink>
          </span>
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
                  {validation}
                </div>
              ))}
              {validationWarns.map((validation, idx) => (
                <div key={`${idx}-validation-${type}`}>
                  <IconWarning />
                  {validation}
                </div>
              ))}
              {validationFails.map((validation, idx) => (
                <div key={`${idx}-validation-${type}`}>
                  <IconRedX />
                  {validation}
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
  type: PropTypes.oneOf(['HTTPS', 'MX', 'SPF', 'DMARC', 'DNSSEC', 'DKIM', 'MTA-STS']),
  headerClickFunction: PropTypes.func,
  providerInfo: PropTypes.object,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  isFetching: PropTypes.bool,
}

const SPFResultsCard = ({ domain, spfOverride }) => {
  const { data, isFetching, error } = useListDomainHealthQuery({
    Domain: domain,
    Action: 'ReadSpfRecord',
    Record: spfOverride,
  })

  const { data: doc } = useListDomainHealthQuery({
    Domain: domain,
    Action: 'ReadMXRecord',
  })

  let record = data?.Record
  const [visible, setVisible] = useState(false)
  const headerClickFunction = () => {
    setVisible(true)
  }
  const jsonContent = JSON.stringify(data, null, 2)

  let ipAddresses = []
  let recommendations = []
  data?.IPAddresses.map((ip, key) =>
    ipAddresses.push({
      heading: '',
      content: ip,
    }),
  )

  data?.Recommendations.map((rec, key) =>
    recommendations.push({
      heading: '',
      content: (
        <>
          <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-info" /> {rec.Message}
        </>
      ),
    }),
  )

  let includes = []
  data?.RecordList.map((include, key) =>
    includes.push({
      heading: include.Domain,
      content:
        include.LookupCount < 4 ? (
          include.LookupCount + 1
        ) : (
          <span className="text-warning">{include.LookupCount + 1}</span>
        ),
    }),
  )

  if (includes.length > 0) {
    includes.unshift({
      heading: 'Domain',
      content: 'Lookups',
    })
  }

  return (
    <>
      <ResultsCard
        data={data}
        type="SPF"
        isFetching={isFetching}
        headerClickFunction={headerClickFunction}
        error={error}
        providerInfo={doc?.MailProvider}
        errorMessage="Unable to load SPF Results"
      >
        {record && (
          <>
            <CippCodeBlock
              language="text"
              code={record}
              showLineNumbers={false}
              wrapLongLines={true}
            />
          </>
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
        {!isFetching && !error && (
          <DomainOffcanvasTabs jsonContent={jsonContent}>
            {record && (
              <>
                <h4 className="my-3">Record</h4>
                <CippCodeBlock
                  language="text"
                  code={record}
                  showLineNumbers={false}
                  wrapLongLines={true}
                />
              </>
            )}
            {recommendations.length > 0 && (
              <>
                <OffcanvasListSection title="Recommendations" items={recommendations} />
                {data?.RecommendedRecord && data?.RecommendedRecord !== data?.Record && (
                  <>
                    <h4 className="my-3">Recommended Record</h4>
                    <CippCodeBlock
                      language="text"
                      code={data?.RecommendedRecord}
                      showLineNumbers={false}
                      wrapLongLines={true}
                    />
                  </>
                )}
              </>
            )}
            {includes.length > 0 && <OffcanvasListSection title="Includes" items={includes} />}
            {ipAddresses.length > 0 && (
              <OffcanvasListSection title="IP Addresses" items={ipAddresses} />
            )}
          </DomainOffcanvasTabs>
        )}
      </CippOffcanvas>
    </>
  )
}
SPFResultsCard.propTypes = {
  spfOverride: PropTypes.string,
  ...sharedProps,
}
function WhoisResultCard({ domain }) {
  const [visible, setVisible] = useState(false)
  const {
    data: whoisReport,
    isFetching,
    error,
  } = useListDomainHealthQuery({ Domain: domain, Action: 'ReadWhoisRecord' })
  const jsonContent = JSON.stringify(whoisReport, null, 2)

  let whoisContent = []
  if (whoisReport !== undefined) {
    for (const [key, value] of Object.entries(whoisReport)) {
      if (!key.match(/^_/)) {
        whoisContent.push({
          heading: key,
          content: value,
        })
      }
    }
  }

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
            {(whoisReport?._Registrar && (
              <>
                <h5>Registrar</h5>
                {whoisReport?._Registrar}
              </>
            )) || <>No WHOIS results available</>}
            <CippOffcanvas
              title="WHOIS Details"
              id="whois-offcanvas"
              visible={visible}
              placement="end"
              className="cipp-offcanvas"
              hideFunction={() => setVisible(false)}
            >
              <DomainOffcanvasTabs jsonContent={jsonContent}>
                {whoisContent.length > 0 && (
                  <OffcanvasListSection title="Properties" items={whoisContent} />
                )}
                <h4 className="mt-4">Raw Report</h4>
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
  } = useListDomainHealthQuery({ Domain: domain, Action: 'ReadNSRecord' })

  const content = []
  if (nsReport?.Records.length > 0) {
    nsReport?.Records.map((ns, index) =>
      content.push({
        body: ns,
      }),
    )
  } else {
    content.push({
      body: 'No nameservers listed',
    })
  }
  return (
    <ListGroupContentCard
      title="Nameservers"
      content={content}
      isFetching={isFetching}
      error={error}
      icon={faServer}
      errorMessage="Unable to obtain nameservers"
    />
  )
}
NSResultCard.propTypes = sharedProps

const HttpsResultCard = ({ domain, httpsOverride }) => {
  const { data, isFetching, error } = useListDomainHealthQuery({
    Domain: domain,
    Action: 'TestHttpsCertificate',
    Subdomains: httpsOverride,
  })
  let tests = data?.Tests || []

  const jsonContent = JSON.stringify(data, null, 2)

  const [visible, setVisible] = useState(false)
  const headerClickFunction = () => {
    setVisible(true)
  }

  return (
    <ResultsCard
      data={data}
      type="HTTPS"
      headerClickFunction={headerClickFunction}
      isFetching={isFetching}
      error={error}
      errorMessage="Unable to load HTTPS Results"
    >
      <CippOffcanvas
        id="https-offcanvas"
        visible={visible}
        placement="end"
        className="cipp-offcanvas"
        hideFunction={() => setVisible(false)}
        title="HTTPS Details"
      >
        <DomainOffcanvasTabs jsonContent={jsonContent}>
          {tests.length > 0 && (
            <>
              <COffcanvasTitle>HTTPS Certificates</COffcanvasTitle>
              <CTable striped small>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Hostname</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Expires</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {tests.map((test, key) => (
                    <CTableRow key={`${key}-hostname`}>
                      <CTableDataCell>{test?.Hostname}</CTableDataCell>
                      <CTableDataCell>{test?.Certificate.NotAfter}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              <h5>Validation Details</h5>
              {tests.map((test, key) => (
                <ValidationListContent data={test} key={key} />
              ))}
            </>
          )}
        </DomainOffcanvasTabs>
      </CippOffcanvas>
    </ResultsCard>
  )
}

HttpsResultCard.propTypes = { httpsOverride: PropTypes.string, ...sharedProps }

const MtaStsResultCard = ({ domain }) => {
  const { data, isFetching, error } = useListDomainHealthQuery({
    Domain: domain,
    Action: 'TestMtaSts',
  })

  const jsonContent = JSON.stringify(data, null, 2)

  const [visible, setVisible] = useState(false)
  const headerClickFunction = () => {
    setVisible(true)
  }
  let stsProperties = []
  if (data?.StsPolicy.Version !== '') {
    stsProperties.push({ heading: 'Version', content: data?.StsPolicy.Version })
  }
  if (data?.StsPolicy.Mode !== '') {
    stsProperties.push({ heading: 'Mode', content: data?.StsPolicy.Mode })
  }
  data?.StsPolicy.Mx.map((prop, index) =>
    stsProperties.push({
      heading: 'MX',
      content: prop,
    }),
  )
  if (data?.StsPolicy.MaxAge !== '') {
    stsProperties.push({ heading: 'Max Age', content: data?.StsPolicy.MaxAge })
  }
  return (
    <ResultsCard
      data={data}
      type="MTA-STS"
      headerClickFunction={headerClickFunction}
      isFetching={isFetching}
      error={error}
      errorMessage="Unable to load MTA-STS Results"
    >
      {!isFetching && !error && (
        <CippOffcanvas
          id="mtasts-offcanvas"
          visible={visible}
          placement="end"
          className="cipp-offcanvas"
          hideFunction={() => setVisible(false)}
          title="MTA-STS Details"
        >
          <DomainOffcanvasTabs jsonContent={jsonContent}>
            <h4>MTA-STS Record</h4>
            {data.StsRecord.Record !== '' && (
              <CippCodeBlock
                language="text"
                code={data.StsRecord.Record}
                showLineNumbers={false}
                wrapLongLines={true}
              />
            )}
            <ValidationListContent data={data.StsRecord} />

            <OffcanvasListSection title="MTA-STS Policy" items={stsProperties} />
            <ValidationListContent data={data?.StsPolicy} />

            <h4 className="mt-4">TLSRPT Record</h4>
            {data.TlsRptRecord.Record !== '' && (
              <CippCodeBlock
                language="text"
                code={data.TlsRptRecord.Record}
                showLineNumbers={false}
                wrapLongLines={true}
              />
            )}
            <ValidationListContent data={data.TlsRptRecord} />
          </DomainOffcanvasTabs>
        </CippOffcanvas>
      )}
    </ResultsCard>
  )
}

MtaStsResultCard.propTypes = sharedProps

const MXResultsCard = ({ domain }) => {
  const { data, isFetching, error } = useListDomainHealthQuery({
    Domain: domain,
    Action: 'ReadMXRecord',
  })
  const mailProviderName = data?.MailProvider?.Name
  let records = data?.Records || []

  const jsonContent = JSON.stringify(data, null, 2)

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
      providerInfo={data?.MailProvider}
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
              <h4>Records</h4>
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
        </DomainOffcanvasTabs>
      </CippOffcanvas>
    </ResultsCard>
  )
}

MXResultsCard.propTypes = sharedProps

function DMARCResultsCard({ domain }) {
  const { data, isFetching, error } = useListDomainHealthQuery({
    Domain: domain,
    Action: 'ReadDmarcPolicy',
  })
  let record = data?.Record
  const [visible, setVisible] = useState(false)
  const headerClickFunction = () => {
    setVisible(true)
  }
  const jsonContent = JSON.stringify(data, null, 2)

  let dkimAlignment = 'Unknown'
  if (data?.DkimAlignment === 's') {
    dkimAlignment = 'Strict'
  } else if (data?.DkimAlignment === 'r') {
    dkimAlignment = 'Relaxed'
  }

  let spfAlignment = 'Unknown'
  if (data?.SpfAlignment === 's') {
    spfAlignment = 'Strict'
  } else if (data?.SpfAlignment === 'r') {
    spfAlignment = 'Relaxed'
  }

  let reportFormat = 'Unknown'
  if (data?.ReportFormat === 'afrf') {
    reportFormat = 'Authentication Failure'
  }

  let reportIntervalDays = data?.ReportInterval / 86400

  let policyDetails = []
  let reportingEmails = []
  let forensicEmails = []

  if (data?.Version !== '') {
    policyDetails.push({ heading: 'Version', content: data?.Version })
    policyDetails.push({ heading: 'Policy', content: ucFirst(data?.Policy) })
    policyDetails.push({ heading: 'Subdomain Policy', content: ucFirst(data?.SubdomainPolicy) })
    policyDetails.push({ heading: 'Percent', content: `${data?.Percent}%` })
    policyDetails.push({ heading: 'DKIM Alignment', content: dkimAlignment })
    policyDetails.push({ heading: 'SPF Alignment', content: spfAlignment })
    policyDetails.push({ heading: 'Report Interval', content: `${reportIntervalDays} day(s)` })
    policyDetails.push({ heading: 'Report Format', content: reportFormat })

    data?.ReportingEmails.map((email, key) =>
      reportingEmails.push({
        heading: '',
        content: email,
      }),
    )

    data?.ForensicEmails.map((email, key) =>
      forensicEmails.push({
        heading: '',
        content: email,
      }),
    )
  }
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
        {!isFetching && !error && (
          <DomainOffcanvasTabs jsonContent={jsonContent}>
            {record && (
              <>
                <h4>Record</h4>
                <CippCodeBlock
                  language="text"
                  code={record}
                  showLineNumbers={false}
                  wrapLongLines={true}
                />
                {policyDetails.length > 0 && (
                  <OffcanvasListSection title="Policy Details" items={policyDetails} />
                )}
                {reportingEmails.length > 0 && (
                  <OffcanvasListSection title="Reporting Emails" items={reportingEmails} />
                )}
                {forensicEmails.length > 0 && (
                  <OffcanvasListSection title="Forensic Emails" items={forensicEmails} />
                )}
              </>
            )}
          </DomainOffcanvasTabs>
        )}
      </CippOffcanvas>
    </>
  )
}

DMARCResultsCard.propTypes = sharedProps

function DNSSECResultsCard({ domain }) {
  const { data, isFetching, error } = useListDomainHealthQuery({
    Domain: domain,
    Action: 'TestDNSSEC',
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

function DKIMResultsCard({ domain, dkimOverride }) {
  const { data, isFetching, error } = useListDomainHealthQuery({
    Domain: domain,
    Action: 'ReadDkimRecord',
    Selector: dkimOverride,
  })
  const [visible, setVisible] = useState(false)
  const { data: doc } = useListDomainHealthQuery({
    Domain: domain,
    Action: 'ReadMXRecord',
  })

  let records = data?.Records
  const jsonContent = JSON.stringify(data, null, 2)

  if (!Array.isArray(records)) {
    records = []
  }

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
        providerInfo={doc?.MailProvider}
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
                    <h4>Selector - {record?.Selector}</h4>
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
DKIMResultsCard.propTypes = { dkimOverride: PropTypes.string, ...sharedProps }

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
