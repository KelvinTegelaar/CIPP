import { useState } from "react";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import {
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm } from "react-hook-form";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Grid } from "@mui/system";
import tabOptions from "./tabOptions.json";

// Saved Logs Configuration
const savedLogsColumns = ["Timestamp", "Tenant", "Title", "Actions"];
const savedLogsApiUrl = "/api/ListAuditLogs";
const savedLogsActions = [
  {
    label: "View Log",
    link: "/tenant/administration/audit-logs/log?id=[LogId]",
    color: "primary",
    icon: <EyeIcon />,
  },
];

const Page = () => {
  const router = useRouter();

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      dateFilter: "relative",
      Time: 7,
      Interval: { label: "Days", value: "d" },
    },
  });

  const [expanded, setExpanded] = useState(false);
  const [relativeTime, setRelativeTime] = useState("7d");
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

  // API parameters for saved logs
  const apiParams = {
    RelativeTime: relativeTime ? relativeTime : "7d",
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
                    <Grid size={{ xs: 2 }}>
                      <CippFormComponent
                        fullWidth
                        type="number"
                        name="Time"
                        label="Last"
                        formControl={formControl}
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <CippFormComponent
                        fullWidth
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
      tableFilter={searchFilter}
      title="Saved Logs"
      apiUrl={savedLogsApiUrl}
      apiDataKey="Results"
      simpleColumns={savedLogsColumns}
      queryKey={`SavedLogs-${relativeTime}-${startDate}-${endDate}`}
      apiData={apiParams}
      actions={savedLogsActions}
    />
  );
};

/* Comment to Developer:
 - This page displays saved audit logs with date filtering options.
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
