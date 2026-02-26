import { Container } from "@mui/material";
import { TabbedLayout } from "../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import tabOptions from "../tabOptions";
import { useSettings } from "../../../hooks/use-settings";
import { ApiGetCall } from "../../../api/ApiCall.jsx";
import { CippDataTable } from "../../../components/CippTable/CippDataTable";
import { CippTestDetailOffCanvas } from "../../../components/CippTestDetail/CippTestDetailOffCanvas";
import { useRouter } from "next/router";

const Page = () => {
  const settings = useSettings();
  const { currentTenant } = settings;
  const router = useRouter();
  const selectedReport =
    router.isReady && !router.query.reportId ? "ztna" : router.query.reportId || "ztna";

  const testsApi = ApiGetCall({
    url: "/api/ListTests",
    data: { tenantFilter: currentTenant, reportId: selectedReport },
    queryKey: `${currentTenant}-ListTests-${selectedReport}`,
    waiting: !!currentTenant && !!selectedReport,
  });

  const customTests =
    testsApi.data?.TestResults?.filter((test) => test.TestType === "Custom") || [];

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
        title="Custom Tests"
        data={customTests}
        simpleColumns={["Name", "Category", "Risk", "Status"]}
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
