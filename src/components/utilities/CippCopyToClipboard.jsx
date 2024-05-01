import { faClipboard, faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { CButton } from '@coreui/react'
function CippCopyToClipboard({ text }) {
  const [codeCopied, setCodeCopied] = useState(false)

  const onCodeCopied = () => {
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }
  return (
    <CopyToClipboard text={text} onCopy={() => onCodeCopied()}>
      <CButton
        color={codeCopied ? 'success' : 'info'}
        className="cipp-code-copy-button"
        size="sm"
        variant="ghost"
      >
        {codeCopied ? <FontAwesomeIcon icon={faClipboard} /> : <FontAwesomeIcon icon={faCopy} />}
      </CButton>
    </CopyToClipboard>
  )
}

export default CippCopyToClipboard
