import { useState } from "react";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { EyeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Grid } from "@mui/system";
import tabOptions from "./tabOptions.json";

// Saved Alerts Tab Configuration
const savedAlertsColumns = ["Timestamp", "Tenant", "Title", "Actions"];
const savedAlertsApiUrl = "/api/ListAuditLogSearches";
const savedAlertsActions = [
  {
    label: "View Log",
    link: "/tenant/administration/audit-logs/log?id=[LogId]",
    color: "primary",
    icon: <EyeIcon />,
  },
];

// Log Searches Tab Configuration
const logSearchesColumns = [
  "SearchId",
  "StartTime",
  "EndTime",
  "TotalLogs",
  "MatchedLogs",
  "CippStatus",
  "Actions",
];
const logSearchesApiUrl = "/api/ListAuditLogSearches";
const logSearchesActions = [
  {
    label: "View Results",
    link: "/tenant/administration/audit-logs/search-results?searchId=[SearchId]",
    color: "primary",
    icon: <EyeIcon />,
  },
];

const Page = () => {
  const router = useRouter();
  const { tab = "saved-alerts" } = router.query;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      dateFilter: "relative",
      Time: 1,
      Interval: { label: "Days", value: "d" },
    },
  });

  const [expanded, setExpanded] = useState(false);
  const [relativeTime, setRelativeTime] = useState("1d");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const onSubmit = (data) => {
    if (data.dateFilter === "relative") {
      setRelativeTime(`${data.Time}${data.Interval.value}`);
      setStartDate(null);
      setEndDate(null);
    } else if (data.dateFilter === "startEnd") {
      setRelativeTime(null);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
    }
  };

  // Determine current tab configuration
  const isLogSearches = tab === "log-searches";
  const currentColumns = isLogSearches ? logSearchesColumns : savedAlertsColumns;
  const currentApiUrl = isLogSearches ? logSearchesApiUrl : savedAlertsApiUrl;
  const currentActions = isLogSearches ? logSearchesActions : savedAlertsActions;
  const currentTitle = isLogSearches ? "Log Searches" : "Saved Alerts";

  // API parameters based on tab
  const apiParams = isLogSearches
    ? { Type: "Searches" }
    : {
        Days: relativeTime ? parseInt(relativeTime) : 1,
        ...(startDate && { StartDate: startDate }),
        ...(endDate && { EndDate: endDate }),
      };

  const searchFilter = (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Search Options</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <form onSubmit={formControl.handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Date Filter Type */}
            <Grid size={12}>
              <CippFormComponent
                type="radio"
                row
                name="dateFilter"
                label="Date Filter Type"
                options={[
                  { label: "Relative", value: "relative" },
                  { label: "Start / End", value: "startEnd" },
                ]}
                formControl={formControl}
              />
            </Grid>

            {/* Relative Time Filter */}
            {formControl.watch("dateFilter") === "relative" && (
              <>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <CippFormComponent
                        type="number"
                        name="Time"
                        label="Last"
                        formControl={formControl}
                      />
                    </Grid>
                    <Grid size={2}>
                      <CippFormComponent
                        type="autoComplete"
                        name="Interval"
                        label="Interval"
                        multiple={false}
                        options={[
                          { label: "Hours", value: "h" },
                          { label: "Days", value: "d" },
                        ]}
                        formControl={formControl}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}

            {/* Start and End Date Filters */}
            {formControl.watch("dateFilter") === "startEnd" && (
              <>
                <Grid size={{ xs: 6, md: 3 }}>
                  <CippFormComponent
                    type="datePicker"
                    name="startDate"
                    label="Start Date"
                    dateTimeType="date"
                    formControl={formControl}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <CippFormComponent
                    type="datePicker"
                    name="endDate"
                    label="End Date"
                    dateTimeType="date"
                    formControl={formControl}
                  />
                </Grid>
              </>
            )}

            {/* Submit Button */}
            <Grid size={12}>
              <Button type="submit" variant="contained" color="primary">
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </form>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <CippTablePage
      tableFilter={!isLogSearches ? searchFilter : null}
      title={currentTitle}
      apiUrl={currentApiUrl}
      apiDataKey="Results"
      simpleColumns={currentColumns}
      queryKey={`AuditLogs-${tab}-${relativeTime}-${startDate}-${endDate}`}
      apiData={apiParams}
      actions={currentActions}
    />
  );
};

/* Comment to Developer:
 - The filter options are implemented within an Accordion for a collapsible UI.
 - DateFilter types are supported as 'Relative' and 'Start/End'.
 - Relative time is calculated based on Time and Interval inputs.
 - Form state is managed using react-hook-form for simplicity and reusability.
 - Filters are dynamically applied to the table query.
*/

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
