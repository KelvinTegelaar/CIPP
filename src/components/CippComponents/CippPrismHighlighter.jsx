// Isolated leaf so react-syntax-highlighter (+ the prism theme) is code-split out of the common
// bundle and only downloaded when a syntax block actually renders. Imported via next/dynamic.
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function CippPrismHighlighter({ code, ...props }) {
  return (
    <SyntaxHighlighter style={atomDark} {...props}>
      {code}
    </SyntaxHighlighter>
  );
}
