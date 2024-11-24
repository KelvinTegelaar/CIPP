import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

const pageTitle = "Tenant Onboarding";

const actions = [
  {
    label: "Cancel Onboarding",
    type: "POST",
    url: "/api/ExecOnboardTenant",
    data: { id: "RowKey", Cancel: true },
    confirmText: "Are you sure you want to cancel these onboardings?",
    multiPost: true,
  },
  {
    label: "Retry Onboarding",
    type: "POST",
    url: "/api/ExecOnboardTenant",
    data: { id: "RowKey", Retry: true },
    confirmText: "Are you sure you want to retry these onboardings?",
    multiPost: true,
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
      cardButton={
        <Button component={Link} href="/gdap-management/onboarding/wizard">
          Start Tenant Onboarding
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
