import { useState } from "react";
import dynamic from "next/dynamic";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";
import { styled } from "@mui/system"; // Correct import from @mui/system
import { useSettings } from "../../hooks/use-settings";

// Heavy, client-only editors loaded on demand so monaco-editor (~5MB) and react-syntax-highlighter
// stay out of the common bundle — they only download when a code block actually renders.
const Editor = dynamic(() => import("@monaco-editor/react").then((m) => m.Editor), {
  ssr: false,
  loading: () => null,
});
const CippPrismHighlighter = dynamic(() => import("./CippPrismHighlighter"), {
  ssr: false,
  loading: () => null,
});

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
    readOnly = false,
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
          language={language}
          value={code}
          theme={currentTheme === "dark" ? "vs-dark" : "vs-light"}
          height={editorHeight}
          options={{
            wordWrap: true,
            lineNumbers: showLineNumbers ? "on" : "off",
            minimap: { enabled: showLineNumbers },
            readOnly: readOnly,
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            suggestOnTriggerCharacters: true,
          }}
          {...other}
        />
      )}
      {type === "syntax" && (
        <CippPrismHighlighter
          lineProps={{ style: { wordBreak: "break-all", whiteSpace: "pre-wrap" } }}
          language={language}
          showLineNumbers={showLineNumbers}
          startingLineNumber={startingLineNumber}
          wrapLongLines={wrapLongLines}
          code={code}
        />
      )}
    </CodeContainer>
  );
};
