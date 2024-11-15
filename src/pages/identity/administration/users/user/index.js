import { Container, Grid } from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";

import CippVersionProperties from "/src/components/CippSettings/CippVersionProperties";
import CippPasswordSettings from "/src/components/CippSettings/CippPasswordSettings";
import CippDnsSettings from "/src/components/CippSettings/CippDnsSettings";
import CippCacheSettings from "/src/components/CippSettings/CippCacheSettings";
import CippBackupSettings from "/src/components/CippSettings/CippBackupSettings";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import { CalendarIcon } from "@mui/x-date-pickers";
import { Cog8ToothIcon, ServerIcon } from "@heroicons/react/24/outline";

const actions = [
  {
    label: "Send Verification Email",
    handler: () => {},
  },
  {
    label: "Send Password Reset Email",
    handler: () => {},
  },
];

const subtitle = [
  {
    icon: <CalendarIcon />,
    text: "Created at: 2021-09-01", //copy button with email?
  },
  {
    icon: <Cog8ToothIcon />,
    text: "Licenses: 17", // potential last logon day?
  },
  {
    icon: <ServerIcon />,
    text: "MyList: one two", //something else?
  },
];
const Page = () => {
  return (
    <Container sx={{ pt: 3 }} maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <CippVersionProperties />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <CippPasswordSettings />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <CippDnsSettings />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <CippCacheSettings />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <CippBackupSettings />
        </Grid>
      </Grid>
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <HeaderedTabbedLayout
      subtitle={subtitle}
      actions={actions}
      title="View User"
      tabOptions={tabOptions}
    >
      {page}
    </HeaderedTabbedLayout>
  </DashboardLayout>
);

export default Page;
