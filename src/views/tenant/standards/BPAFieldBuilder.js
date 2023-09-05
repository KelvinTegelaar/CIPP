import React, { useState, useRef } from 'react'
import { CippPage } from 'src/components/layout'
import BPAFieldSchema from 'src/data/BPAField.schema.v1'
import BPAFieldUISchema from 'src/data/BPAField.uischema.v1'
import validator from '@rjsf/validator-ajv8'
import Form from '@rjsf/core'
import { CippContentCard } from 'src/components/layout'
import { CRow, CCol, CButton } from '@coreui/react'
import Editor from '@monaco-editor/react'
import { useSelector } from 'react-redux'

const BPAFieldBuilder = () => {
  const [formData, setFormData] = useState(null)
  const editorRef = useRef(null)
  const currentTheme = useSelector((state) => state.app.currentTheme)
  function handleEditorChange(value, event) {
    setFormData(JSON.parse(value))
  }

  return (
    <CippPage title="BPA Builder" tenantSelector={true}>
      <CRow>
        <CCol md={12} lg={6}>
          <CippContentCard>
            <Form
              schema={BPAFieldSchema}
              uiSchema={BPAFieldUISchema}
              validator={validator}
              liveValidate={true}
              formData={formData}
              onChange={(e) => setFormData(e.formData)}
              enable={true}
              showErrorList="bottom"
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
              schema={BPAFieldSchema}
              validator={validator}
              theme={currentTheme == 'cyberdrain' ? 'vs-light' : 'vs-dark'}
            />
          </CippContentCard>
        </CCol>
      </CRow>
    </CippPage>
  )
}

export default BPAFieldBuilder
