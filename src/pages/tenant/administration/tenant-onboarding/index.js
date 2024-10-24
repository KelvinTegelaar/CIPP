import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

const pageTitle = "Tenant Onboarding";

const actions = [
  {
    label: "Cancel Onboarding",
    modal: true,
    modalType: "POST",
    modalBody: { id: "[RowKey]" },
    modalUrl: "/api/ExecOnboardTenant?Cancel=true",
    modalMessage: "Are you sure you want to cancel these onboardings?",
  },
  {
    label: "Retry Onboarding",
    modal: true,
    modalType: "POST",
    modalBody: { id: "[RowKey]" },
    modalUrl: "/api/ExecOnboardTenant?Retry=true",
    modalMessage: "Are you sure you want to retry these onboardings?",
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
      apiDataKey="Results"
      actions={actions}
      simpleColumns={simpleColumns}
      cardButton={
        <Button component={Link} href="/tenant/administration/tenant-onboarding-wizard">
          Start Tenant Onboarding
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
