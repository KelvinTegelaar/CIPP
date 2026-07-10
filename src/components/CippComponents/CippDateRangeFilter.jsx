import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import CippFormComponent from "./CippFormComponent";

/**
 * Reusable relative / start-end date range filter (the one used on the Saved Logs page).
 * Calls onApply({ RelativeTime, StartDate, EndDate }) when the user applies the filter.
 * RelativeTime is formatted like "48h" / "7d"; StartDate/EndDate come from the date pickers.
 */
export const CippDateRangeFilter = ({
  onApply,
  defaultTime = 7,
  defaultInterval = { label: "Days", value: "d" },
  title = "Search Options",
}) => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      dateFilter: "relative",
      Time: defaultTime,
      Interval: defaultInterval,
    },
  });

  const [expanded, setExpanded] = useState(false);

  const onSubmit = (data) => {
    if (data.dateFilter === "relative") {
      onApply?.({ RelativeTime: `${data.Time}${data.Interval.value}`, StartDate: null, EndDate: null });
    } else if (data.dateFilter === "startEnd") {
      onApply?.({ RelativeTime: null, StartDate: data.startDate, EndDate: data.endDate });
    }
  };

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{title}</Typography>
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
};

export default CippDateRangeFilter;
