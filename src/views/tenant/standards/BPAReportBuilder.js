import React, { useState, useEffect, useRef } from 'react'
import { CippPage } from 'src/components/layout'
import BPAReportSchema from 'src/data/BPAReport.schema.v1'
import BPAReportUISchema from 'src/data/BPAReport.uischema.v1'
import validator from '@rjsf/validator-ajv8'
import Form from '@rjsf/bootstrap-4'
import { CippContentCard } from 'src/components/layout'
import Editor from '@monaco-editor/react'
import { useSelector } from 'react-redux'
import useQuery from 'src/hooks/useQuery'
import {
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardTitle,
  CButton,
  CCollapse,
  CCardBody,
  CForm,
  CSpinner,
  CFormLabel,
  CTooltip,
} from '@coreui/react'
import { useGenericGetRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CopyToClipboard from 'react-copy-to-clipboard'

const CippTextWidget = (props) => {
  return (
    <CFormInput
      type="text"
      value={props.value}
      required={props.required}
      onChange={(event) => props.onChange(event.target.value)}
    />
  )
}
const CippSelectWidget = (props) => {
  const options = props?.options.length > 0 ? props.options : props.options.enumOptions
  return (
    <CFormSelect
      value={props.value}
      required={props.required}
      onChange={(event) => props.onChange(event.target.value)}
    >
      {options.map(({ label, value }, idx) => (
        <option key={`${idx}-${value}`} value={value}>
          {label}
        </option>
      ))}
    </CFormSelect>
  )
}

const CippCheckboxWidget = (props) => {
  return (
    <CFormSwitch
      disabled={props.disabled}
      id={props.name}
      label={props.label}
      checked={props.value}
      onChange={(event) => {
        props.onChange(event.target.checked)
      }}
    />
  )
}
const CippWidgets = {
  TextWidget: CippTextWidget,
  SelectWidget: CippSelectWidget,
  CheckboxWidget: CippCheckboxWidget,
}

const BPAReportBuilder = () => {
  let query = useQuery()
  const [refreshValue, setRefreshValue] = useState('')
  const Report = query.get('Report')
  const [filename, setFilename] = useState()
  const [visibleA, setVisibleA] = useState(true)
  const { data: templates = [], isLoading: templatesfetch } = useGenericGetRequestQuery({
    path: 'api/listBPATemplates?RawJson=true&Refresh=' + refreshValue,
  })
  const [formData, setFormData] = useState(null)
  const editorRef = useRef(null)
  const currentTheme = useSelector((state) => state.app.currentTheme)

  function handleRefresh() {
    setRefreshValue((Math.random() + 1).toString(36).substring(7))
  }

  function handleEditorChange(value, event) {
    try {
      setFormData(JSON.parse(value))
    } catch {
      setFormData({})
    }
  }
  const handleSubmit = async (event) => {
    event.preventDefault()
    var reportTemplate = event.target.form[0].value
    setVisibleA(false)
    if (reportTemplate !== 'New') {
      var template = templates.filter(function (tpl) {
        return tpl.name == reportTemplate
      })
      setFormData(template[0])
    } else {
      setFormData({})
    }
  }
  useEffect(() => {
    var reportName = formData?.name ? formData?.name?.replace(/[\W]/g, '') : 'NewReport'
    var newfilename = reportName + '.BPATemplate.json'
    setFilename(newfilename)
  }, [filename, formData])

  const handlePublish = async (event) => {
    event.preventDefault()
    const data = new FormData(event.target)
    const ghuser = data.get('GitHubUser')
    const reportfilename = data.get('ReportFilename')
    const report = JSON.stringify(formData, null, 2)
    const url =
      'https://github.com/' + ghuser + '/CIPP-API/new/master/Config?filename=' + reportfilename
    window.open(url, '_blank')
  }

  const options = {
    wordWrap: true,
  }

  return (
    <CippPage title="BPA Report Builder" tenantSelector={true}>
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Report Settings
                <CButton
                  size="sm"
                  variant="ghost"
                  className="stretched-link"
                  onClick={() => setVisibleA(!visibleA)}
                >
                  <FontAwesomeIcon icon={visibleA ? 'chevron-down' : 'chevron-right'} />
                </CButton>
              </CCardTitle>
            </CCardHeader>
          </CCard>
          <CCollapse visible={visibleA}>
            <CCard className="options-card">
              <CCardHeader></CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol xs={12} lg={6}>
                    <CForm>
                      <CRow>
                        <CCol>
                          <CFormLabel>Load Existing Report</CFormLabel>
                          <CFormSelect
                            name="reportTemplate"
                            label="Select a report"
                            placeholder={templatesfetch ? 'Loading...' : 'Select a report'}
                          >
                            <option key="new" value="New">
                              New Report
                            </option>
                            {templates.map((template, idx) => (
                              <option key={`${idx}`} value={template.name}>
                                {template.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        {templatesfetch && <CSpinner />}
                      </CRow>
                      <CRow className="my-3">
                        <CCol>
                          <CButton type="submit" onClick={handleSubmit}>
                            <FontAwesomeIcon className="me-2" icon="download" />
                            Load Report
                          </CButton>
                          <CButton type="button" className="ms-2" onClick={handleRefresh}>
                            <FontAwesomeIcon icon="sync" />
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCol>
                  <CCol>
                    <CForm onSubmit={handlePublish}>
                      <CRow>
                        <CCol>
                          <CFormLabel>GitHub Username/Org Name</CFormLabel>
                          <CFormInput name="GitHubUser" required />
                          <CFormLabel>Report Filename</CFormLabel>
                          <CFormInput name="ReportFilename" value={filename} />
                        </CCol>
                      </CRow>
                      <CRow className="my-3">
                        <CTooltip
                          placement="left"
                          content="Click here to create a new BPA template in GitHub, the report will be copied to the clipboard"
                        >
                          <CCol>
                            <CopyToClipboard text={JSON.stringify(formData, null, 2)}>
                              <CButton type="submit">
                                <FontAwesomeIcon className="me-2" icon="upload" />
                                Publish
                              </CButton>
                            </CopyToClipboard>
                          </CCol>
                        </CTooltip>
                      </CRow>
                    </CForm>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCollapse>
        </CCol>
      </CRow>
      <hr />
      <CRow>
        <CCol md={12} lg={6}>
          <CippContentCard>
            <Form
              schema={BPAReportSchema}
              uiSchema={BPAReportUISchema}
              validator={validator}
              liveValidate={true}
              formData={formData}
              onChange={(e) => setFormData(e.formData)}
              enable={true}
              showErrorList="none"
              omitExtraData={true}
              liveOmit={true}
              widgets={CippWidgets}
            />
          </CippContentCard>
        </CCol>
        <CCol md={12} lg={6}>
          <CippContentCard title="JSON Editor">
            <Editor
              defaultLanguage="json"
              value={JSON.stringify(formData, null, 2)}
              onChange={handleEditorChange}
              theme={currentTheme == 'cyberdrain' ? 'vs-light' : 'vs-dark'}
              height="700px"
              options={options}
            />
          </CippContentCard>
        </CCol>
      </CRow>
    </CippPage>
  )
}

export default BPAReportBuilder
