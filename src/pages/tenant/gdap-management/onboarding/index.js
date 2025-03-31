import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";
import { Cancel, PlayArrow, Replay } from "@mui/icons-material";

const pageTitle = "Tenant Onboarding";

const actions = [
  {
    label: "Cancel Onboarding",
    type: "POST",
    url: "/api/ExecOnboardTenant",
    data: { id: "RowKey", Cancel: true },
    confirmText: "Are you sure you want to cancel these onboardings?",
    multiPost: true,
    icon: <Cancel />,
  },
  {
    label: "Retry Onboarding",
    type: "POST",
    url: "/api/ExecOnboardTenant",
    data: { id: "RowKey", Retry: true },
    confirmText: "Are you sure you want to retry these onboardings?",
    multiPost: true,
    icon: <Replay />,
  },
];

const simpleColumns = [
  "Timestamp",
  "Relationship.customer.displayName",
  "Status",
  "OnboardingSteps",
  "Logs",
];

const apiUrl = "/api/ListTenantOnboarding";

const Page = () => {
  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      simpleColumns={simpleColumns}
      tenantInTitle={false}
      queryKey="ListTenantOnboarding"
      cardButton={
        <Button
          component={Link}
          href="/tenant/gdap-management/onboarding/start"
          startIcon={<PlayArrow />}
        >
          Start Tenant Onboarding
        </Button>
      }
      maxHeightOffset="460px"
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
