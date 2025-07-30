import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import { CippChartCard } from "/src/components/CippCards/CippChartCard";
import { ApiGetCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import { Policy, Sync, PlayArrow } from "@mui/icons-material";
import tabOptions from "./tabOptions.json";

const Page = () => {
  const router = useRouter();
  const { templateId } = router.query;

  // Mock data for demonstration - replace with actual API call
  const driftHistoryData = ApiGetCall({
    url: `/api/GetDriftHistory`,
    data: { templateId },
    queryKey: `GetDriftHistory-${templateId}`,
  });

  // Generate mock timeline data for the last 30 days
  const generateTimelineData = () => {
    const days = [];
    const deviations = [];
    const acceptedDeviations = [];
    const deniedDeviations = [];
    const inAlignment = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Mock data - replace with actual data processing
      deviations.push(Math.floor(Math.random() * 20) + 5);
      acceptedDeviations.push(Math.floor(Math.random() * 8) + 2);
      deniedDeviations.push(Math.floor(Math.random() * 5) + 1);
      inAlignment.push(Math.floor(Math.random() * 15) + 10);
    }

    return { days, deviations, acceptedDeviations, deniedDeviations, inAlignment };
  };

  const timelineData = generateTimelineData();

  // Format data like secureScore example - array of objects with name and data
  const timelineChartSeries = [
    {
      name: "Deviations Detected",
      data: timelineData.days.map((day, index) => ({
        x: day,
        y: timelineData.deviations[index],
      })),
    },
    {
      name: "Accepted deviations - Customer Specific",
      data: timelineData.days.map((day, index) => ({
        x: day,
        y: timelineData.acceptedDeviations[index],
      })),
    },
    {
      name: "Denied Deviation",
      data: timelineData.days.map((day, index) => ({
        x: day,
        y: timelineData.deniedDeviations[index],
      })),
    },
  ];

  // Actions for the ActionsMenu
  const actions = [
    {
      label: "Refresh Data",
      icon: <Sync />,
      noConfirm: true,
      customFunction: () => {
        driftHistoryData.refetch();
      },
    },
    ...(templateId
      ? [
          {
            label: "Run Standard Now (Currently Selected Tenant only)",
            type: "GET",
            url: "/api/ExecStandardsRun",
            icon: <PlayArrow />,
            data: {
              TemplateId: templateId,
            },
            confirmText: "Are you sure you want to force a run of this standard?",
            multiPost: false,
          },
          {
            label: "Run Standard Now (All Tenants in Template)",
            type: "GET",
            url: "/api/ExecStandardsRun",
            icon: <PlayArrow />,
            data: {
              TemplateId: templateId,
              tenantFilter: "allTenants",
            },
            confirmText: "Are you sure you want to force a run of this standard?",
            multiPost: false,
          },
        ]
      : []),
  ];

  const title = "Manage Drift";
  const subtitle = [
    {
      icon: <Policy />,
      text: `Template ID: ${templateId || "Loading..."}`,
    },
  ];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      backUrl="/tenant/standards/list-standards"
      actions={actions}
      actionsData={{}}
      isFetching={driftHistoryData.isLoading}
    >
      <Box sx={{ py: 2 }}>
        <Stack spacing={4}>
          <Typography variant="h6">Drift History</Typography>
          <Typography variant="body1" color="text.secondary">
            Historical timeline of drift deviations, acceptances, denials, and alignment status over the last 30 days.
          </Typography>

          <Grid container spacing={3}>
            {/* Single Timeline Chart */}
            <Grid size={{ xs: 12 }}>
              <CippChartCard
                title="Drift History Timeline - Deviations Over Time"
                chartType="line"
                chartSeries={timelineChartSeries}
                isFetching={driftHistoryData.isLoading}
              />
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;