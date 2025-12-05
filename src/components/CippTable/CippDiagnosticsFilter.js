import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  TextField,
  Stack,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { ExpandMore, Search } from "@mui/icons-material";

const CippDiagnosticsFilter = ({ onSubmitFilter }) => {
  const [expanded, setExpanded] = useState(true);
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      query: "",
    },
  });

  const { handleSubmit, register, watch } = formControl;

  const queryValue = watch("query");

  const onSubmit = (values) => {
    if (values.query && values.query.trim()) {
      onSubmitFilter(values);
    }
  };

  const handleClear = () => {
    formControl.reset({ query: "" });
    onSubmitFilter({ query: "" });
  };

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">Query</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <Alert severity="info">
            <AlertTitle>Requirements</AlertTitle>
            <Typography variant="body2">
              • Application Insights must be deployed for your CIPP environment
              <br />• The Function App's managed identity must have <strong>Reader</strong>{" "}
              permissions on the Application Insights resource
              <br />• Queries are executed using Kusto Query Language (KQL)
            </Typography>
          </Alert>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                {...register("query")}
                label="KQL Query"
                multiline
                rows={8}
                fullWidth
                placeholder={`Enter your KQL query here, for example:\n\ntraces\n| where timestamp > ago(1h)\n| where severityLevel >= 2\n| project timestamp, message, severityLevel\n| order by timestamp desc`}
                variant="outlined"
                helperText="Enter a valid Kusto Query Language (KQL) query to execute against Application Insights"
              />

              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Search />}
                  disabled={!queryValue || !queryValue.trim()}
                >
                  Execute Query
                </Button>
                <Button variant="outlined" onClick={handleClear}>
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default CippDiagnosticsFilter;
