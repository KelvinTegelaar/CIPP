import React from 'react'
import PropTypes from 'prop-types'
import { CopyBlock, atomOneDark } from 'react-code-blocks'

function CippCodeBlock({ code, language, showLineNumbers, startingLineNumber, wrapLongLines }) {
  return (
    <CopyBlock
      text={code}
      language={language}
      showLineNumbers={showLineNumbers}
      startingLineNumber={startingLineNumber}
      wrapLongLines={wrapLongLines}
      theme={atomOneDark}
      copied={true}
      codeBlock
    />
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
