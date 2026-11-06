import { useState } from "react";
import { Alert, Box, Collapse, IconButton, Tooltip, Typography } from "@mui/material";
import { CippIcons } from "../../utils/icon-registry";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";
import { CippCodeBlock } from "./CippCodeBlock";

// Alert in the CippApiResults style: summary text with copy action and, when details are
// provided, an expand chevron revealing them in a code block.
export const CippAlertWithDetails = ({
  severity = "error",
  summary,
  details,
  copyText,
  sx,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Alert
      severity={severity}
      sx={sx}
      action={
        <>
          <CippCopyToClipBoard color="inherit" text={copyText ?? String(summary ?? "")} />
          {details && (
            <Tooltip title={showDetails ? "Hide Details" : "Show Details"}>
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setShowDetails((prev) => !prev)}
                aria-label={showDetails ? "Hide Details" : "Show Details"}
              >
                {showDetails ? <CippIcons.ExpandLess fontSize="inherit" /> : <CippIcons.ExpandMore fontSize="inherit" />}
              </IconButton>
            </Tooltip>
          )}
        </>
      }
    >
      <Box sx={{ width: "100%" }}>
        <Typography variant="body2">{summary}</Typography>
        {details && (
          <Collapse in={showDetails}>
            <Box mt={2} sx={{ width: "100%" }}>
              <CippCodeBlock
                code={typeof details === "string" ? details : JSON.stringify(details, null, 2)}
                language={typeof details === "object" ? "json" : "text"}
                showLineNumbers={false}
                type="syntax"
                readOnly={true}
              />
            </Box>
          </Collapse>
        )}
      </Box>
    </Alert>
  );
};

export default CippAlertWithDetails;
