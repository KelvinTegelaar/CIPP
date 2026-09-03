import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippIcons } from "../../../../utils/icon-registry"
import { Layout as DashboardLayout } from "../../../../layouts/index";
import tabOptions from "../tabOptions";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
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
    multiPost: false,
    icon: <CippIcons.Cancel />,
  },
  {
    label: "Retry Onboarding",
    type: "POST",
    url: "/api/ExecOnboardTenant",
    data: { id: "RowKey", Retry: true },
    confirmText: "Are you sure you want to retry these onboardings?",
    multiPost: false,
    icon: <CippIcons.Replay />,
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
      // The default title slot would pick Timestamp, which has no text form.
      mobileCard={{ primary: "Relationship.customer.displayName" }}
      tenantInTitle={false}
      queryKey="ListTenantOnboarding"
      cardButton={
        <Button
          component={Link}
          href="/tenant/gdap-management/onboarding/start"
          startIcon={<CippIcons.PlayArrow />}
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
