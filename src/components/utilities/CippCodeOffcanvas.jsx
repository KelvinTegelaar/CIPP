import React, { useState, useEffect } from 'react'
import { CButton, CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import { CippOffcanvas } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'

import { Editor } from '@monaco-editor/react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CopyToClipboard from 'react-copy-to-clipboard'

function CippCodeOffCanvas({
  row,
  state: visible,
  hideFunction,
  type,
  title = 'Template JSON',
  hideButton = false,
  path = `/api/ExecEditTemplate?type=${type}`,
}) {
  const [SaveTemplate, templateDetails] = useLazyGenericPostRequestQuery()
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const [templateData, setFormData] = useState(row)
  const [invalidJSON, setInvalid] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleEditorChange(value, event) {
    try {
      setFormData(JSON.parse(value))
      setInvalid(false)
    } catch {
      setInvalid(true)
    }
  }

  useEffect(() => {
    setCopied(false)
  }, [setCopied, templateData])

  return (
    <>
      <CippOffcanvas
        title={title}
        addedClass="offcanvas-large"
        placement="end"
        visible={visible}
        id={crypto.randomUUID()}
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
              <>
                <CButton
                  disabled={invalidJSON}
                  onClick={() =>
                    SaveTemplate({
                      path: path,
                      method: 'POST',
                      values: templateData,
                    })
                  }
                  className="me-2"
                >
                  {templateDetails.isFetching ? (
                    <CSpinner size="sm" className="me-2" />
                  ) : (
                    <FontAwesomeIcon icon="save" className="me-2" />
                  )}
                  Save changes
                </CButton>
                <CopyToClipboard text={JSON.stringify(row, null, 2)} onCopy={() => setCopied(true)}>
                  <CButton disabled={invalidJSON}>
                    <FontAwesomeIcon icon={copied ? 'check' : 'clipboard'} className="me-2" /> Copy
                    to Clipboard
                  </CButton>
                </CopyToClipboard>
              </>
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
  row: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  state: PropTypes.bool,
  hideFunction: PropTypes.func,
  type: PropTypes.string,
  title: PropTypes.string,
  hideButton: PropTypes.bool,
  path: PropTypes.string,
}

export default CippCodeOffCanvas
