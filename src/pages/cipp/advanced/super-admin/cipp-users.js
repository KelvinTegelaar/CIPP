import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import tabOptions from "./tabOptions";
import CippPageCard from "../../../../components/CippCards/CippPageCard";
import { CippUserManagement } from "../../../../components/CippSettings/CippUserManagement";
import { CardContent, Stack, Alert } from "@mui/material";

const Page = () => {
  return (
    <CippPageCard hideBackButton={true} title={"CIPP User Management"}>
      <CardContent>
        <Stack spacing={2}>
          <Alert severity="info">
            Manage users who can access CIPP. Users are automatically synced from your partner
            tenant every 15 minutes based on Entra group memberships configured on the CIPP Roles
            page. You can also manually add users or assign additional roles — manual assignments
            are preserved independently and will not be overwritten by the sync. Users not in this
            list can still log in if &quot;Allow All Tenant Users&quot; is enabled, but they will
            only receive default (authenticated) permissions.
          </Alert>
          <CippUserManagement />
        </Stack>
      </CardContent>
    </CippPageCard>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
