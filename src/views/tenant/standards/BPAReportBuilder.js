import React, { useState, useRef } from 'react'
import { CippPage } from 'src/components/layout'
import BPAReportSchema from 'src/data/BPAReport.schema.v1'
import BPAReportUISchema from 'src/data/BPAReport.uischema.v1'
import validator from '@rjsf/validator-ajv8'
import Form from '@rjsf/core'
import { CippContentCard } from 'src/components/layout'
import { CRow, CCol } from '@coreui/react'
import Editor from '@monaco-editor/react'
import { useSelector } from 'react-redux'

const BPAReportBuilder = () => {
  const [formData, setFormData] = useState(null)
  const editorRef = useRef(null)
  const currentTheme = useSelector((state) => state.app.currentTheme)
  function handleEditorChange(value, event) {
    setFormData(JSON.parse(value))
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
            />
          </CippContentCard>
        </CCol>
        <CCol md={12} lg={6}>
          <CippContentCard title="JSON Editor">
            <Editor
              defaultLanguage="json"
              value={JSON.stringify(formData, null, 2)}
              onChange={handleEditorChange}
              schema={BPAReportSchema}
              validator={validator}
              theme={currentTheme == 'cyberdrain' ? 'vs-light' : 'vs-dark'}
              height="700px"
            />
          </CippContentCard>
        </CCol>
      </CRow>
    </CippPage>
  )
}

export default BPAReportBuilder
