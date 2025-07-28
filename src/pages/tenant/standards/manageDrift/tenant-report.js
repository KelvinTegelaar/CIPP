import { Box, Typography, Stack } from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { useRouter } from "next/router";
import { EyeIcon } from "@heroicons/react/24/outline";
import tabOptions from "./tabOptions.json";

const Page = () => {
  const router = useRouter();
  const { tenantFilter, templateId } = router.query;

  const pageTitle = "Tenant Report";
  const subtitle = [
    {
      icon: "info",
      text: `Detailed drift report for tenant: ${tenantFilter || "All Tenants"}`,
    },
  ];

  const actions = [
    {
      label: "View Details",
      link: "/tenant/standards/manageDrift?templateId=[standardId]&tenantFilter=[tenantFilter]",
      icon: <EyeIcon />,
      color: "info",
      target: "_self",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {pageTitle}
      </Typography>
      
      <Stack spacing={3}>
        <CippTablePage
          title="Tenant Drift Summary"
          apiUrl={`/api/ListTenantDrift${tenantFilter ? `?tenantFilter=${tenantFilter}` : "?tenantFilter=AllTenants"}`}
          tenantInTitle={false}
          actions={actions}
          simpleColumns={[
            "tenantFilter",
            "standardName", 
            "alignmentScore",
            "acceptedDeviations",
            "currentDeviations",
            "deniedDeviations",
          ]}
          queryKey="ListTenantDriftReport"
        />
      </Stack>
    </Box>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title="Manage Drift"
      subtitle={[
        {
          icon: "info", 
          text: "Monitor and manage configuration drift across your tenants",
        },
      ]}
    >
      {page}
    </HeaderedTabbedLayout>
  </DashboardLayout>
);

export default Page;