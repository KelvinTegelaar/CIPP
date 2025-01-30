import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippPageCard from "/src/components/CippCards/CippPageCard";
import { CippCustomRoles } from "/src/components/CippSettings/CippCustomRoles";
import { Alert, CardContent, Stack, Typography } from "@mui/material";
import { WarningAmberOutlined } from "@mui/icons-material";

const Page = () => {
  return (
    <CippPageCard hideBackButton={true} title={"Custom Roles"}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="body2">
            Custom roles can be used to restrict permissions for users with the 'editor' or
            'readonly' roles in CIPP. They can be limited to a subset of tenants and API
            permissions. To restrict direct API access, create a role with the name 'CIPP-API'.
          </Typography>
          <Alert color="warning" icon={<WarningAmberOutlined />}>
            This functionality is in beta and should be treated as such. The custom role must be
            added to the user in SWA in conjunction with the base role. (e.g. editor,mycustomrole)
          </Alert>
          <CippCustomRoles />
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
