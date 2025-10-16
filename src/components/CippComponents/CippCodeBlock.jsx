import { useState } from "react";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import SyntaxHighlighter from "react-syntax-highlighter";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";
import { styled } from "@mui/system"; // Correct import from @mui/system
import { Editor } from "@monaco-editor/react";
import { useSettings } from "../../hooks/use-settings";

const CodeContainer = styled("div")`
  position: relative;
  display: block;
  max-width: 100%; /* Ensure it fits within the card */
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: break-all;
  padding-bottom: 1rem;
  .cipp-code-copy-button {
    position: absolute;
    right: 1rem; /* Moved further left to avoid Monaco scrollbar */
    top: 0.5rem;
    z-index: 1; /* Ensure the button is above the code block */
  }
`;

export const CippCodeBlock = (props) => {
  const {
    code,
    language = "json",
    showLineNumbers = false,
    startingLineNumber = 1,
    wrapLongLines = true,
    type = "syntax",
    editorHeight = "500px",
    ...other
  } = props;
  const [codeCopied, setCodeCopied] = useState(false);

  const onCodeCopied = () => {
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };
  const currentTheme = useSettings()?.currentTheme?.value;
  return (
    <CodeContainer>
      <div className="cipp-code-copy-button">
        <CippCopyToClipBoard text={code} type="button" onClick={onCodeCopied} />
      </div>
      {type === "editor" && (
        <Editor
          defaultLanguage={language}
          defaultValue={code}
          theme={currentTheme === "dark" ? "vs-dark" : "vs-light"}
          height={editorHeight}
          options={{
            wordWrap: true,
            lineNumbers: showLineNumbers ? "on" : "off",
            minimap: { enabled: showLineNumbers },
          }}
          {...other}
        />
      )}
      {type === "syntax" && (
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
      )}
    </CodeContainer>
  );
};
