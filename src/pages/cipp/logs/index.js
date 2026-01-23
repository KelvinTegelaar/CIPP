import { useState } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import {
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  SvgIcon,
  Stack,
  Alert,
  Box,
} from "@mui/material";
import { Grid } from "@mui/system";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm } from "react-hook-form";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { EyeIcon } from "@heroicons/react/24/outline";

const simpleColumns = [
  "DateTime",
  "Tenant",
  "User",
  "Message",
  "API",
  "Severity",
  "AppId",
  "IP",
  "LogData",
];

const apiUrl = "/api/Listlogs";
const pageTitle = "Logbook Results";

const actions = [
  {
    label: "View Log Entry",
    link: "/cipp/logs/logentry?logentry=[RowKey]&dateFilter=[DateFilter]",
    icon: <EyeIcon />,
    color: "primary",
  },
];

const Page = () => {
  const formControl = useForm({
    defaultValues: {
      startDate: null,
      endDate: null,
      username: "",
      severity: [],
    },
  });

  const [expanded, setExpanded] = useState(false); // State for Accordion
  const [filterEnabled, setFilterEnabled] = useState(false); // State for filter toggle
  const [startDate, setStartDate] = useState(null); // State for start date filter
  const [endDate, setEndDate] = useState(null); // State for end date filter
  const [username, setUsername] = useState(null); // State for username filter
  const [severity, setSeverity] = useState(null); // State for severity filter

  // Watch date fields to show warning for large date ranges
  const watchStartDate = formControl.watch("startDate");
  const watchEndDate = formControl.watch("endDate");

  // Component to display warning for large date ranges
  const DateRangeWarning = () => {
    if (!watchStartDate || !watchEndDate) return null;

    const startDateMs = new Date(watchStartDate * 1000);
    const endDateMs = new Date(watchEndDate * 1000);
    const daysDifference = (endDateMs - startDateMs) / (1000 * 60 * 60 * 24);

    if (daysDifference > 10) {
      return (
        <Grid size={7}>
          <Alert severity="warning">
            You have selected a date range of {Math.ceil(daysDifference)} days. Large date ranges
            may cause timeouts or errors due to the amount of data being processed. Consider
            narrowing your date range if you encounter issues.
          </Alert>
        </Grid>
      );
    }

    return null;
  };

  const onSubmit = (data) => {
    // Check if any filter is applied
    const hasFilter =
      data.startDate !== null ||
      data.endDate !== null ||
      data.username !== null ||
      data.severity?.length > 0;
    setFilterEnabled(hasFilter);

    // Format start date if available
    setStartDate(
      data.startDate
        ? new Date(data.startDate * 1000).toISOString().split("T")[0].replace(/-/g, "")
        : null,
    );

    // Format end date if available
    setEndDate(
      data.endDate
        ? new Date(data.endDate * 1000).toISOString().split("T")[0].replace(/-/g, "")
        : null,
    );

    // Set username filter if available
    setUsername(data.username || null);

    // Set severity filter if available (convert array to comma-separated string)
    setSeverity(
      data.severity && data.severity.length > 0
        ? data.severity.map((item) => item.value).join(",")
        : null,
    );

    // Close the accordion after applying filters
    setExpanded(false);
  };

  const clearFilters = () => {
    formControl.reset({
      startDate: null,
      endDate: null,
      username: "",
      severity: [],
    });
    setFilterEnabled(false);
    setStartDate(null);
    setEndDate(null);
    setUsername(null);
    setSeverity(null);
    setExpanded(false); // Close the accordion when clearing filters
  };

  return (
    <CippTablePage
      tableFilter={
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SvgIcon>
                <FunnelIcon />
              </SvgIcon>
              <Typography variant="h6">
                Logbook Filters
                {filterEnabled ? (
                  <span style={{ fontSize: "0.8em", marginLeft: "10px", fontWeight: "normal" }}>
                    (
                    {startDate || endDate ? (
                      <>
                        {startDate
                          ? new Date(
                              startDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") + "T00:00:00",
                            ).toLocaleDateString()
                          : new Date().toLocaleDateString()}
                        {startDate && endDate ? " - " : ""}
                        {endDate
                          ? new Date(
                              endDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") + "T00:00:00",
                            ).toLocaleDateString()
                          : ""}
                      </>
                    ) : null}
                    {username && (startDate || endDate) && " | "}
                    {username && <>User: {username}</>}
                    {severity && (username || startDate || endDate) && " | "}
                    {severity && <>Severity: {severity.replace(/,/g, ", ")}</>})
                  </span>
                ) : (
                  <span style={{ fontSize: "0.8em", marginLeft: "10px", fontWeight: "normal" }}>
                    (Today: {new Date().toLocaleDateString()})
                  </span>
                )}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <form onSubmit={formControl.handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                {/* Date Filter */}
                <Grid size={{ sm: 7, xs: 12 }}>
                  <Alert severity="info">
                    Use the filters below to narrow down your logbook results. You can filter by
                    date range, username, and severity levels. By default, the logbook shows the
                    current day based on UTC time. Your local time is{" "}
                    {new Date().getTimezoneOffset() / -60} hours offset from UTC.
                  </Alert>
                </Grid>
                <Grid size={{ sm: 7, xs: 12 }}>
                  <Stack direction="row" spacing={2}>
                    <Box flexGrow={1}>
                      <CippFormComponent
                        type="datePicker"
                        name="startDate"
                        label="Select Start Date"
                        dateTimeType="date"
                        formControl={formControl}
                      />
                    </Box>
                    <Box flexGrow={1}>
                      <CippFormComponent
                        type="datePicker"
                        name="endDate"
                        label="Select End Date"
                        dateTimeType="date"
                        formControl={formControl}
                        validators={{
                          validate: (value) => {
                            const startDate = formControl.getValues("startDate");
                            if (value && !startDate) {
                              return "Start date must be set when using an end date";
                            }
                            if (
                              startDate &&
                              value &&
                              new Date(value * 1000) < new Date(startDate * 1000)
                            ) {
                              return "End date must be after start date";
                            }
                            return true;
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                </Grid>

                {/* Date Range Warning Alert */}
                <DateRangeWarning />

                {/* Username Filter */}
                <Grid size={{ sm: 7, xs: 12 }}>
                  <CippFormComponent
                    type="textField"
                    name="username"
                    label="Filter by Username"
                    formControl={formControl}
                    placeholder="Enter username to filter logs"
                    fullWidth
                  />
                </Grid>

                {/* Severity Filter */}
                <Grid size={{ sm: 7, xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    name="severity"
                    label="Filter by Severity"
                    formControl={formControl}
                    multiple={true}
                    options={[
                      { value: "Info", label: "Info" },
                      { value: "Warn", label: "Warning" },
                      { value: "Error", label: "Error" },
                      { value: "Critical", label: "Critical" },
                      { value: "Alert", label: "Alert" },
                      { value: "Debug", label: "Debug" },
                    ]}
                    placeholder="Select severity levels"
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={
                        <SvgIcon>
                          <FunnelIcon />
                        </SvgIcon>
                      }
                    >
                      Apply Filters
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={
                        <SvgIcon>
                          <XMarkIcon />
                        </SvgIcon>
                      }
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </AccordionDetails>
        </Accordion>
      }
      title={pageTitle}
      apiUrl={apiUrl}
      simpleColumns={simpleColumns}
      queryKey={`Listlogs-${startDate}-${endDate}-${username}-${severity}-${filterEnabled}`}
      tenantInTitle={false}
      apiData={{
        StartDate: startDate, // Pass start date filter from state
        EndDate: endDate, // Pass end date filter from state
        User: username, // Pass username filter from state
        Severity: severity, // Pass severity filter from state
        Filter: filterEnabled, // Pass filter toggle state
      }}
      actions={actions}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
