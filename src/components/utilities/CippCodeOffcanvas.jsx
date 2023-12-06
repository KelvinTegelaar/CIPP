import React, { useState } from 'react'
import { CButton, CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import { CippOffcanvas } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'

import { Editor } from '@monaco-editor/react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

function CippCodeOffCanvas({
  row,
  state: visible,
  hideFunction,
  type,
  title = 'Template JSON',
  hideButton = false,
}) {
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
        title={title}
        addedClass="offcanvas-large"
        placement="end"
        visible={visible}
        id={row.id}
        hideFunction={hideFunction}
      >
        <Editor
          className="mb-3"
          defaultLanguage="json"
          value={JSON.stringify(row, null, 2)}
          theme={currentTheme === 'cyberdrain' ? 'vs-light' : 'vs-dark'}
          height="800px"
          onChange={handleEditorChange}
          options={{
            wordWrap: true,
          }}
        />
        <CRow className="mb-3">
          <CCol>
            {!hideButton && (
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
            )}
          </CCol>
        </CRow>
        {templateDetails.isSuccess && !templateDetails.isFetching && (
          <CCallout color="success">{templateDetails.data.Results}</CCallout>
        )}
      </CippOffcanvas>
    </>
  )
}

CippCodeOffCanvas.propTypes = {
  row: PropTypes.object,
  state: PropTypes.bool,
  hideFunction: PropTypes.func,
  type: PropTypes.string,
  title: PropTypes.string,
  hideButton: PropTypes.bool,
}

export default CippCodeOffCanvas
