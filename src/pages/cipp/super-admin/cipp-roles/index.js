import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import CippPageCard from "/src/components/CippCards/CippPageCard";
import CippRoles from "/src/components/CippSettings/CippRoles";
import { CardContent, Stack, Typography } from "@mui/material";

const Page = () => {
  return (
    <CippPageCard hideBackButton={true} title={"CIPP Roles"}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="body2">
            CIPP roles can be used to restrict permissions for users with the 'editor' or 'readonly'
            roles in CIPP. They can be limited to a subset of tenants and API permissions. To
            restrict direct API access, create a role with the name 'CIPP-API'.
          </Typography>
          <CippRoles />
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
