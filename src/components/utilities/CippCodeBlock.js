import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faClipboard } from '@fortawesome/free-regular-svg-icons'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

function CippCodeBlock({ code, language, showLineNumbers, startingLineNumber, wrapLongLines }) {
  const [codeCopied, setCodeCopied] = useState(false)

  const onCodeCopied = () => {
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  return (
    <div className="cipp-code">
      <CopyToClipboard text={code} onCopy={() => onCodeCopied()}>
        <CButton
          color={codeCopied ? 'success' : 'info'}
          className="cipp-code-copy-button"
          size="sm"
          variant="ghost"
        >
          {codeCopied ? <FontAwesomeIcon icon={faClipboard} /> : <FontAwesomeIcon icon={faCopy} />}
        </CButton>
      </CopyToClipboard>

      <SyntaxHighlighter
        language={language}
        showLineNumbers={showLineNumbers}
        startingLineNumber={startingLineNumber}
        wrapLongLines={wrapLongLines}
        wrapLines={wrapLongLines}
        style={atomOneDark}
        className="cipp-code-block"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default CippCodeBlock

CippCodeBlock.propTypes = {
  code: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  showLineNumbers: PropTypes.bool,
  startingLineNumber: PropTypes.number,
  wrapLongLines: PropTypes.bool,
}
