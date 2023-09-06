import React, { useState, useRef } from 'react'
import { CippPage } from 'src/components/layout'
import BPAReportSchema from 'src/data/BPAReport.schema.v1'
import BPAReportUISchema from 'src/data/BPAReport.uischema.v1'
import validator from '@rjsf/validator-ajv8'
import Form from '@rjsf/bootstrap-4'
import { CippContentCard } from 'src/components/layout'
import { CRow, CCol } from '@coreui/react'
import Editor from '@monaco-editor/react'
import { useSelector } from 'react-redux'
import { CFormInput, CFormSelect, CFormSwitch } from '@coreui/react'

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
  // not working yet
  console.log(props)
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
  const [formData, setFormData] = useState(null)
  const editorRef = useRef(null)
  const currentTheme = useSelector((state) => state.app.currentTheme)
  function handleEditorChange(value, event) {
    try {
      setFormData(JSON.parse(value))
    } catch {
      setFormData({})
    }
  }
  const options = {
    wordWrap: true,
  }

  return (
    <CippPage title="BPA Report Builder" tenantSelector={true}>
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
