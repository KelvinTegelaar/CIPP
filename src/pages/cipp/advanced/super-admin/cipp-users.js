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
            are preserved independently and will not be overwritten by the sync. Users assigned the
            superadmin role have full access to CIPP and all other permissions applied will be ignored.
            You must have at least one superadmin user in CIPP at all times, and you cannot remove the
            superadmin role from a user if they are the only superadmin. If you have only one superadmin
            and need to change who it is, first assign another user the superadmin role, then you can
            remove the superadmin role from the original user. To allow users from outside your partner tenant
            to access CIPP, you can add them as guest users in your partner tenant and assign them the
            appropriate roles in CIPP or enable the multi tenant mode in the CIPP SSO tab and add the users
            to the list below without needing to add them as guest users in your tenant.
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
