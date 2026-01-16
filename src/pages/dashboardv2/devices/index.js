import React from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall } from "/src/api/ApiCall.jsx";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { CippTestDetailOffCanvas } from "/src/components/CippTestDetail/CippTestDetailOffCanvas";
import { useRouter } from "next/router";

const Page = () => {
  const settings = useSettings();
  const { currentTenant } = settings;
  const router = useRouter();
  // Only use default if router is ready and reportId is still not present
  const selectedReport =
    router.isReady && !router.query.reportId ? "ztna" : router.query.reportId || "ztna";

  const testsApi = ApiGetCall({
    url: "/api/ListTests",
    data: { tenantFilter: currentTenant, reportId: selectedReport },
    queryKey: `${currentTenant}-ListTests-${selectedReport}`,
    waiting: !!currentTenant && !!selectedReport,
  });

  const DevicesTests =
    testsApi.data?.TestResults?.filter((test) => test.TestType === "Devices") || [];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "passed":
        return "success";
      case "failed":
        return "error";
      case "investigate":
        return "warning";
      case "skipped":
        return "default";
      default:
        return "default";
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const offCanvas = {
    size: "lg",
    children: (row) => <CippTestDetailOffCanvas row={row} />,
  };

  const filters = [
    {
      filterName: "Passed",
      value: [{ id: "Status", value: "Passed" }],
      type: "column",
    },
    {
      filterName: "Failed",
      value: [{ id: "Status", value: "Failed" }],
      type: "column",
    },
    {
      filterName: "Investigate",
      value: [{ id: "Status", value: "Investigate" }],
      type: "column",
    },
    {
      filterName: "Skipped",
      value: [{ id: "Status", value: "Skipped" }],
      type: "column",
    },
    {
      filterName: "High Risk",
      value: [{ id: "Risk", value: "High" }],
      type: "column",
    },
    {
      filterName: "Medium Risk",
      value: [{ id: "Risk", value: "Medium" }],
      type: "column",
    },
    {
      filterName: "Low Risk",
      value: [{ id: "Risk", value: "Low" }],
      type: "column",
    },
  ];

  return (
    <Container maxWidth={false} sx={{ pt: 3 }}>
      <CippDataTable
        title="Device Tests"
        data={DevicesTests}
        simpleColumns={["Name", "Risk", "Status"]}
        isFetching={testsApi.isFetching}
        offCanvas={offCanvas}
        offCanvasOnRowClick={true}
        filters={filters}
        actions={[]}
      />
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
