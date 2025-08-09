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
} from "@mui/material";
import { Grid } from "@mui/system";
import { ExpandMore, Sort } from "@mui/icons-material";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";

const Page = () => {
  const formControl = useForm({
    defaultValues: {
      period: { value: "D30", label: "30 days" },
    },
  });

  const [expanded, setExpanded] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("D30");
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState("30 days");

  const periodOptions = [
    { value: "D7", label: "7 days" },
    { value: "D30", label: "30 days" },
    { value: "D90", label: "90 days" },
    { value: "D180", label: "180 days" },
  ];

  const onSubmit = (data) => {
    const periodValue =
      typeof data.period === "object" && data.period?.value ? data.period.value : data.period;
    const periodLabel =
      typeof data.period === "object" && data.period?.label ? data.period.label : data.period;

    setSelectedPeriod(periodValue);
    setSelectedPeriodLabel(periodLabel);
    setExpanded(false);
  };

  const clearFilters = () => {
    formControl.reset({
      period: { value: "D30", label: "30 days" },
    });
    setSelectedPeriod("D30");
    setSelectedPeriodLabel("30 days");
    setExpanded(false);
  };

  const tableFilter = (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack direction="row" spacing={1} alignItems="center">
          <SvgIcon>
            <FunnelIcon />
          </SvgIcon>
          <Typography variant="h6">
            Report Period
            <span style={{ fontSize: "0.8em", marginLeft: "10px", fontWeight: "normal" }}>
              (Period: {selectedPeriodLabel})
            </span>
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <form onSubmit={formControl.handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="autoComplete"
                name="period"
                multiple={false}
                label="Report Period"
                options={periodOptions}
                formControl={formControl}
                disableClearable={true}
              />
            </Grid>

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
                  Apply
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
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <CippTablePage
      tableFilter={tableFilter}
      title="Mailbox Activity"
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: `reports/getEmailActivityUserDetail(period='${selectedPeriod}')`,
        $format: "application/json",
        Sort: "userPrincipalName",
      }}
      apiDataKey="Results"
      queryKey={`MailboxActivity-${selectedPeriod}`}
      simpleColumns={[
        "userPrincipalName",
        "displayName",
        "sendCount",
        "receiveCount",
        "readCount",
        "meetingCreatedCount",
        "meetingInteractedCount",
        "lastActivityDate",
        "reportRefreshDate",
        "reportPeriod",
      ]}
      offCanvas={null}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
