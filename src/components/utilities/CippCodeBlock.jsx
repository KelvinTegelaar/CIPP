import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faClipboard } from '@fortawesome/free-regular-svg-icons'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { CippCallout } from '../layout'

function CippCodeBlock({
  code,
  language,
  showLineNumbers = true,
  startingLineNumber,
  wrapLongLines = true,
  callout = false,
  calloutColour = 'info',
  calloutCopyValue = false,
  calloutDismissible = false,
}) {
  const [codeCopied, setCodeCopied] = useState(false)

  const onCodeCopied = () => {
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  return (
    <div className="cipp-code">
      {!calloutDismissible && (
        <CopyToClipboard text={calloutCopyValue || code} onCopy={() => onCodeCopied()}>
          <CButton
            color={codeCopied ? 'success' : 'info'}
            className="cipp-code-copy-button"
            size="sm"
            variant="ghost"
          >
            {codeCopied ? (
              <FontAwesomeIcon icon={faClipboard} />
            ) : (
              <FontAwesomeIcon icon={faCopy} />
            )}
          </CButton>
        </CopyToClipboard>
      )}
      {callout && (
        <CippCallout color={calloutColour} dismissible={calloutDismissible}>
          {code}
        </CippCallout>
      )}
      {!callout && (
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
      )}
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
  callout: PropTypes.bool,
  calloutColour: PropTypes.string,
  calloutCopyValue: PropTypes.string,
  calloutDismissible: PropTypes.bool,
}
