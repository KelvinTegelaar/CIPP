import { useState } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import {
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm } from "react-hook-form";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";

const simpleColumns = [
  "DateTime",
  "Tenant",
  "TenantID",
  "User",
  "Message",
  "API",
  "Severity",
  "LogData",
];

const apiUrl = "/api/Listlogs";
const pageTitle = "LogBook Results";

const Page = () => {
  const formControl = useForm({
    defaultValues: {
      startDate: null,
      toggleSwitch: false,
    },
  });

  const [expanded, setExpanded] = useState(false); // State for Accordion
  const [filterEnabled, setFilterEnabled] = useState(false); // State for filter toggle
  const [dateFilter, setDateFilter] = useState(null); // State for date filter

  const onSubmit = (data) => {
    // Set filter states based on form submission
    setFilterEnabled(data.toggleSwitch);
    setDateFilter(
      data.startDate
        ? new Date(data.startDate * 1000).toISOString().split("T")[0].replace(/-/g, "")
        : null
    );
  };

  return (
    <CippTablePage
      tableFilter={
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Logbook Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form onSubmit={formControl.handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                {/* Date Filter */}
                <Grid item xs={12} sm={4}>
                  <CippFormComponent
                    type="datePicker"
                    name="startDate"
                    label="Select Date"
                    dateTimeType="date"
                    formControl={formControl}
                  />
                </Grid>

                {/* Toggle Switch */}
                <Grid item xs={12}>
                  <CippFormComponent
                    type="switch"
                    name="toggleSwitch"
                    label="Enable this filter"
                    formControl={formControl}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Apply Filters
                  </Button>
                </Grid>
              </Grid>
            </form>
          </AccordionDetails>
        </Accordion>
      }
      title={pageTitle}
      apiUrl={apiUrl}
      simpleColumns={simpleColumns}
      queryKey={`Listlogs-${dateFilter}-${filterEnabled}`}
      apiData={{
        DateFilter: dateFilter, // Pass date filter from state
        Filter: filterEnabled, // Pass filter toggle state
      }}
    />
  );
};

/* Comment to Developer:
 - The filter is inside an expandable Accordion. By default, the filter is collapsed.
 - The "Apply Filters" button sets the form data for date and filter toggle.
 - Form state is managed using react-hook-form, and the filter states are applied to the table.
 - The DateFilter is passed in 'YYYYMMDD' format, and Filter toggle is passed as a boolean.
*/

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
