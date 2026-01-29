import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import tabOptions from "../tabOptions";
import CippPageCard from "../../../../components/CippCards/CippPageCard";
import CippRoles from "../../../../components/CippSettings/CippRoles";
import { CardContent, Stack, Alert } from "@mui/material";

const Page = () => {
  return (
    <CippPageCard hideBackButton={true} title={"CIPP Roles"}>
      <CardContent>
        <Stack spacing={2}>
          <Alert severity="info">
            Custom roles can be used to restrict permissions for users with the 'editor' or
            'readonly' roles in CIPP. They can be limited to a subset of tenants and API
            permissions. Built-in and custom roles can be assigned to Entra security groups for
            granular access control.
          </Alert>
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
