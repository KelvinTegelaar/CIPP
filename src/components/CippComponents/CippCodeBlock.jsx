import React, { useState } from "react";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import SyntaxHighlighter from "react-syntax-highlighter";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";
import { styled } from "@mui/system"; // Correct import from @mui/system

const CodeContainer = styled("div")`
  position: relative;
  display: block;
  max-width: 100%; /* Ensure it fits within the card */
  word-wrap: break-word; /* Ensure long words are broken to wrap */
  white-space: pre-wrap; /* Allow the code block to wrap */
  word-break: break-all; /* Break long continuous strings into the next line */

  .cipp-code-copy-button {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    z-index: 1; /* Ensure the button is above the code block */
  }
`;

export const CippCodeBlock = (props) => {
  const {
    code,
    language = "javascript",
    showLineNumbers = false,
    startingLineNumber = 1,
    wrapLongLines = true,
  } = props;
  const [codeCopied, setCodeCopied] = useState(false);

  const onCodeCopied = () => {
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <CodeContainer>
      <div className="cipp-code-copy-button">
        <CippCopyToClipBoard text={code} type="button" onClick={onCodeCopied} />
      </div>
      <SyntaxHighlighter
        lineProps={{ style: { wordBreak: "break-all", whiteSpace: "pre-wrap" } }}
        language={language}
        style={atomDark}
        showLineNumbers={showLineNumbers}
        startingLineNumber={startingLineNumber}
        wrapLongLines={wrapLongLines}
      >
        {code}
      </SyntaxHighlighter>
    </CodeContainer>
  );
};
