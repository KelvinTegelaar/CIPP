import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Box,
  Button,
  Stack,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  AlertTitle,
  Tab,
  Tabs,
} from "@mui/material";
import { ExpandMore, Search, Refresh, PlayArrow } from "@mui/icons-material";
import { CippFormComponent } from "../../../components/CippComponents/CippFormComponent";
import { Grid } from "@mui/system";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { CippTablePage } from "../../../components/CippComponents/CippTablePage";
import { ApiGetCall } from "../../../api/ApiCall";
import defaultPresets from "../../../data/ContainerLogPresets.json";

const levelOptions = [
  { label: "All Levels", value: "" },
  { label: "Debug", value: "DBG" },
  { label: "Information", value: "INF" },
  { label: "Warning", value: "WRN" },
  { label: "Error", value: "ERR" },
  { label: "Critical", value: "CRT" },
];

const timeRangeOptions = [
  { label: "Last 15 minutes", value: "15" },
  { label: "Last 30 minutes", value: "30" },
  { label: "Last 1 hour", value: "60" },
  { label: "Last 3 hours", value: "180" },
  { label: "Last 6 hours", value: "360" },
  { label: "Last 12 hours", value: "720" },
  { label: "Last 24 hours", value: "1440" },
  { label: "Custom Range", value: "custom" },
  { label: "No Time Filter", value: "" },
];

const getLevelColor = (level) => {
  switch (level) {
    case "CRT":
      return "error";
    case "ERR":
      return "error";
    case "WRN":
      return "warning";
    case "INF":
      return "info";
    case "DBG":
      return "default";
    default:
      return "default";
  }
};

const getLevelLabel = (level) => {
  switch (level) {
    case "CRT":
      return "Critical";
    case "ERR":
      return "Error";
    case "WRN":
      return "Warning";
    case "INF":
      return "Info";
    case "DBG":
      return "Debug";
    case "TRC":
      return "Trace";
    default:
      return level || "Unknown";
  }
};

const ContainerLogsFilter = ({ onSubmitFilter }) => {
  const [expanded, setExpanded] = useState(true);
  const [tabValue, setTabValue] = useState(0); // 0 = Query, 1 = Guided
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Query mode form
  const queryForm = useForm({
    mode: "onChange",
    defaultValues: {
      queryPreset: null,
      query: 'where Timestamp > ago(1h)\n| take 500\n| sort by Timestamp desc',
    },
  });

  const queryValue = useWatch({ control: queryForm.control, name: "query" });
  const queryPreset = useWatch({ control: queryForm.control, name: "queryPreset" });

  // Guided mode form
  const guidedForm = useForm({
    mode: "onChange",
    defaultValues: {
      timeRange: "60",
      level: "",
      search: "",
      exclude: "",
      regex: "",
      file: "",
      tail: "500",
      searchAll: false,
      sortDesc: true,
      fromDate: "",
      toDate: "",
    },
  });

  const timeRange = useWatch({ control: guidedForm.control, name: "timeRange" });

  // Preset options (built-in only — no API save/load for container log presets)
  const presetOptions = useMemo(
    () =>
      defaultPresets.map((preset) => ({
        label: preset.name,
        value: preset.id,
        query: preset.query,
        isBuiltin: true,
      })),
    []
  );

  // Load preset when selected
  useEffect(() => {
    if (queryPreset) {
      const preset = Array.isArray(queryPreset) ? queryPreset[0] : queryPreset;
      if (preset?.query) {
        queryForm.setValue("query", preset.query);
        setSelectedPreset(preset);
        queryForm.setValue("queryPreset", null);
      }
    }
  }, [queryPreset, queryForm]);

  const fileListQuery = ApiGetCall({
    url: "/api/ListContainerLogs",
    data: { Action: "ListFiles" },
    queryKey: "ContainerLogFiles",
  });

  const fileOptions = useMemo(() => {
    const opts = [{ label: "Current Log", value: "" }];
    if (fileListQuery.isSuccess && fileListQuery.data?.Results) {
      fileListQuery.data.Results.forEach((f) => {
        if (!f.IsCurrent) {
          opts.push({
            label: `${f.Name} (${f.SizeFormatted})`,
            value: f.Name,
          });
        }
      });
    }
    return opts;
  }, [fileListQuery.isSuccess, fileListQuery.data]);

  // Submit query mode
  const handleQuerySubmit = queryForm.handleSubmit((values) => {
    if (values.query && values.query.trim()) {
      onSubmitFilter({
        Action: "Query",
        Query: values.query.trim(),
      });
      setExpanded(false);
    }
  });

  // Submit guided mode
  const handleGuidedSubmit = guidedForm.handleSubmit((values) => {
    const params = {
      Action: values.searchAll ? "SearchAll" : "ReadLog",
      Tail: values.tail || "500",
    };

    if (values.sortDesc) params.SortDesc = "true";

    // Level filter
    const levelVal = Array.isArray(values.level) ? values.level[0]?.value : values.level;
    if (levelVal) params.Level = levelVal;

    // Search text
    if (values.search) params.Search = values.search;

    // Exclude text
    if (values.exclude) params.Exclude = values.exclude;

    // Regex pattern
    if (values.regex) params.Regex = values.regex;

    // File selection
    const fileVal = Array.isArray(values.file) ? values.file[0]?.value : values.file;
    if (fileVal && !values.searchAll) params.File = fileVal;

    // Time range
    const rangeVal = Array.isArray(values.timeRange)
      ? values.timeRange[0]?.value
      : values.timeRange;
    if (rangeVal === "custom") {
      if (values.fromDate) params.From = new Date(values.fromDate).toISOString();
      if (values.toDate) params.To = new Date(values.toDate).toISOString();
    } else if (rangeVal && rangeVal !== "") {
      const minutes = parseInt(rangeVal, 10);
      if (!isNaN(minutes)) {
        params.From = new Date(Date.now() - minutes * 60 * 1000).toISOString();
      }
    }

    onSubmitFilter(params);
    setExpanded(false);
  });

  const handleClear = () => {
    if (tabValue === 0) {
      queryForm.reset();
      setSelectedPreset(null);
    } else {
      guidedForm.reset();
    }
    onSubmitFilter(null);
    setExpanded(true);
  };

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">Log Query</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Query Editor" />
            <Tab label="Guided Filter" />
          </Tabs>

          {/* ── Tab 0: Query Editor ── */}
          {tabValue === 0 && (
            <Box component="form" onSubmit={handleQuerySubmit}>
              <Stack spacing={2}>
                <Alert severity="info">
                  <AlertTitle>Query Syntax</AlertTitle>
                  <Typography variant="body2">
                    Use a KQL-inspired pipe syntax to filter container logs. Separate clauses with{" "}
                    <code>|</code>. Supported operators:
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                    <code>where Level == &quot;ERR&quot;</code> &mdash; exact level
                    <br />
                    <code>where Level in (&quot;ERR&quot;, &quot;CRT&quot;)</code> &mdash; multiple
                    levels
                    <br />
                    <code>where Level != &quot;DBG&quot;</code> &mdash; exclude level
                    <br />
                    <code>where Message contains &quot;text&quot;</code> &mdash; search
                    <br />
                    <code>where Message !contains &quot;text&quot;</code> &mdash; exclude
                    <br />
                    <code>where Message matches regex &quot;err|fail&quot;</code> &mdash; regex
                    <br />
                    <code>where Timestamp &gt; ago(1h)</code> &mdash; relative time (s/m/h/d/w)
                    <br />
                    <code>where Timestamp between (ago(2h) .. ago(1h))</code> &mdash; range
                    <br />
                    <code>take 500</code> &mdash; limit results
                    <br />
                    <code>sort by Timestamp desc</code> &mdash; newest first
                    <br />
                    <code>search all files</code> &mdash; include rotated logs
                  </Typography>
                </Alert>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <CippFormComponent
                      type="autoComplete"
                      name="queryPreset"
                      label="Load Preset"
                      formControl={queryForm}
                      options={presetOptions}
                      multiple={false}
                    />
                  </Grid>
                </Grid>

                <CippFormComponent
                  type="textField"
                  name="query"
                  label="Log Query"
                  formControl={queryForm}
                  multiline
                  rows={6}
                  placeholder={`where Level in ("ERR", "CRT")\n| where Timestamp > ago(1h)\n| take 500\n| sort by Timestamp desc`}
                  sx={{
                    "& textarea": {
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                    },
                  }}
                />

                <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<PlayArrow />}
                    disabled={!queryValue || !queryValue.trim()}
                  >
                    Run Query
                  </Button>
                  <Button variant="outlined" onClick={handleClear}>
                    Clear
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* ── Tab 1: Guided Filter ── */}
          {tabValue === 1 && (
            <Box component="form" onSubmit={handleGuidedSubmit}>
              <Stack spacing={2}>
                <Alert severity="info">
                  Search the local container log files directly. Logs are rotated by size and
                  retained on disk. Use &ldquo;Search All Files&rdquo; to search across rotated log
                  files.
                </Alert>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <CippFormComponent
                      type="autoComplete"
                      name="timeRange"
                      label="Time Range"
                      formControl={guidedForm}
                      options={timeRangeOptions}
                      multiple={false}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <CippFormComponent
                      type="autoComplete"
                      name="level"
                      label="Log Level"
                      formControl={guidedForm}
                      options={levelOptions}
                      multiple={false}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <CippFormComponent
                      type="textField"
                      name="search"
                      label="Search Text"
                      formControl={guidedForm}
                      placeholder="Filter by text content"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <CippFormComponent
                      type="textField"
                      name="tail"
                      label="Max Lines"
                      formControl={guidedForm}
                      placeholder="500"
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CippFormComponent
                      type="textField"
                      name="exclude"
                      label="Exclude Text"
                      formControl={guidedForm}
                      placeholder="Exclude lines containing this text"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CippFormComponent
                      type="textField"
                      name="regex"
                      label="Regex Pattern"
                      formControl={guidedForm}
                      placeholder="e.g. error|timeout"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CippFormComponent
                      type="switch"
                      name="sortDesc"
                      label="Newest First"
                      formControl={guidedForm}
                    />
                  </Grid>
                </Grid>

                {(Array.isArray(timeRange) ? timeRange[0]?.value : timeRange) === "custom" && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <CippFormComponent
                        type="textField"
                        name="fromDate"
                        label="From (UTC)"
                        formControl={guidedForm}
                        placeholder="YYYY-MM-DD HH:mm"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <CippFormComponent
                        type="textField"
                        name="toDate"
                        label="To (UTC)"
                        formControl={guidedForm}
                        placeholder="YYYY-MM-DD HH:mm"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                )}

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CippFormComponent
                      type="autoComplete"
                      name="file"
                      label="Log File"
                      formControl={guidedForm}
                      options={fileOptions}
                      multiple={false}
                      isFetching={fileListQuery.isFetching}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CippFormComponent
                      type="switch"
                      name="searchAll"
                      label="Search All Files (including rotated)"
                      formControl={guidedForm}
                    />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={2}>
                  <Button type="submit" variant="contained" startIcon={<Search />}>
                    Search Logs
                  </Button>
                  <Button variant="outlined" onClick={handleClear}>
                    Clear
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const Page = () => {
  const [apiFilter, setApiFilter] = useState(null);
  const queryKey = JSON.stringify(apiFilter);

  return (
    <CippTablePage
      tableFilter={
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <ContainerLogsFilter onSubmitFilter={setApiFilter} />
          </Grid>
        </Grid>
      }
      clearOnError={true}
      offCanvas={{
        size: "lg",
        children: (row) => {
          const levelColor = getLevelColor(row.Level);
          return (
            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Chip
                      label={getLevelLabel(row.Level)}
                      color={levelColor}
                      size="medium"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {row.Timestamp}
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Message
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="body1"
                      component="pre"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        m: 0,
                      }}
                    >
                      {row.Message}
                    </Typography>
                  </Box>
                </Box>
                {row.Raw && row.Raw !== row.Message && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Raw Log Line
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "background.default",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="body1"
                        component="pre"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.75rem",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          m: 0,
                        }}
                      >
                        {row.Raw}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
          );
        },
      }}
      title="Container Logs"
      tenantInTitle={false}
      apiDataKey="Results"
      apiUrl={apiFilter ? "/api/ListContainerLogs" : "/api/ListEmptyResults"}
      apiData={apiFilter}
      queryKey={queryKey}
      simpleColumns={["Timestamp", "Level", "Message"]}
      actions={[]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
