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
            Manage users who can access CIPP. Add users by their email address (UPN) and assign
            them built-in or custom roles. Users not in this list will still be able to log in if
            &quot;Allow All Tenant Users&quot; is enabled, but they will only receive default
            (authenticated) permissions. Role resolution also considers Entra group mappings
            configured on the CIPP Roles page.
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
