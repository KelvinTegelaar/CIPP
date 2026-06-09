import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Alert,
  useTheme,
} from "@mui/material";
import { diffLines } from "diff";

export const CippScriptDiff = ({ oldScript, newScript, oldLabel = "Old", newLabel = "New" }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const diffResult = useMemo(() => {
    if (!oldScript || !newScript) return [];
    return diffLines(oldScript, newScript);
  }, [oldScript, newScript]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let unchanged = 0;

    diffResult.forEach((part) => {
      const lineCount = part.value.split("\n").filter((line) => line.length > 0).length;
      if (part.added) {
        added += lineCount;
      } else if (part.removed) {
        removed += lineCount;
      } else {
        unchanged += lineCount;
      }
    });

    return { added, removed, unchanged };
  }, [diffResult]);

  if (!oldScript || !newScript) {
    return (
      <Alert severity="warning">
        <Typography variant="body2">Unable to compare - one or both scripts are empty.</Typography>
      </Alert>
    );
  }

  if (oldScript === newScript) {
    return (
      <Alert severity="info">
        <Typography variant="body2">No differences found - scripts are identical.</Typography>
      </Alert>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Comparing:
        </Typography>
        <Chip label={oldLabel} size="small" variant="outlined" />
        <Typography variant="body2" color="text.secondary">
          →
        </Typography>
        <Chip label={newLabel} size="small" variant="outlined" color="primary" />
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {stats.added > 0 && (
          <Chip
            label={`+${stats.added} lines added`}
            size="small"
            color="success"
            variant="outlined"
          />
        )}
        {stats.removed > 0 && (
          <Chip
            label={`-${stats.removed} lines removed`}
            size="small"
            color="error"
            variant="outlined"
          />
        )}
        {stats.unchanged > 0 && (
          <Chip
            label={`${stats.unchanged} lines unchanged`}
            size="small"
            variant="outlined"
          />
        )}
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          overflow: "auto",
          maxHeight: "600px",
        }}
      >
        <Box
          component="pre"
          sx={{
            margin: 0,
            padding: 2,
            fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
            fontSize: "0.875rem",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {diffResult.map((part, index) => {
            let bgcolor = "transparent";
            let color = "inherit";
            let borderLeft = "3px solid transparent";
            let prefix = " ";

            if (part.added) {
              bgcolor = isDarkMode ? "#1a4d2e" : "#e6ffed";
              color = isDarkMode ? "#7ee087" : "#22863a";
              borderLeft = isDarkMode ? "3px solid #34d058" : "3px solid #34d058";
              prefix = "+";
            } else if (part.removed) {
              bgcolor = isDarkMode ? "#4d1a1a" : "#ffeef0";
              color = isDarkMode ? "#ff8181" : "#cb2431";
              borderLeft = isDarkMode ? "3px solid #d73a49" : "3px solid #d73a49";
              prefix = "-";
            }

            // Split into lines and add prefix
            const lines = part.value.split("\n");
            const displayValue = lines
              .map((line, i) => {
                // Don't add prefix to empty last line
                if (i === lines.length - 1 && line === "") return "";
                return prefix + " " + line;
              })
              .join("\n");

            return (
              <Box
                key={index}
                component="span"
                sx={{
                  display: "block",
                  bgcolor,
                  color,
                  borderLeft,
                  paddingLeft: 1,
                  marginLeft: -2,
                  marginRight: -2,
                  paddingRight: 2,
                }}
              >
                {displayValue}
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};
