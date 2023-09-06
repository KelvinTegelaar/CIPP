import React, { useState } from 'react'
import { CButton, CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import { CippOffcanvas } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'

import { Editor } from '@monaco-editor/react'
import { useSelector } from 'react-redux'

function CippCodeOffCanvas({ row, state, hideFunction, type }) {
  const [SaveTemplate, templateDetails] = useLazyGenericPostRequestQuery()
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const [templateData, setFormData] = useState(row)
  const [invalidJSON, setInvalid] = useState(false)

  function handleEditorChange(value, event) {
    try {
      setFormData(JSON.parse(value))
      setInvalid(false)
    } catch {
      setInvalid(true)
    }
  }
  return (
    <>
      <CippOffcanvas
        title="Template JSON"
        addedClass="offcanvas-large"
        placement="end"
        visible={state}
        id={row.id}
        hideFunction={hideFunction}
      >
        <Editor
          className="mb-3"
          defaultLanguage="json"
          value={JSON.stringify(row, null, 2)}
          theme={currentTheme == 'cyberdrain' ? 'vs-light' : 'vs-dark'}
          height="800px"
          onChange={handleEditorChange}
          options={{
            wordWrap: true,
          }}
        />
        <CRow className="mb-3">
          <CCol>
            <CButton
              disabled={invalidJSON}
              onClick={() =>
                SaveTemplate({
                  path: `/api/ExecEditTemplate?type=${type}`,
                  method: 'POST',
                  values: templateData,
                })
              }
            >
              Save changes {templateDetails.isFetching && <CSpinner size="sm" />}
            </CButton>
          </CCol>
        </CRow>
        {templateDetails.isSuccess && !templateDetails.isFetching && (
          <CCallout color="success">{templateDetails.data.Results}</CCallout>
        )}
      </CippOffcanvas>
    </>
  )
}

export default CippCodeOffCanvas
