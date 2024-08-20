import Head from "next/head";
import { Unstable_Grid2 as Grid, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "../layouts";
import { paths } from "../paths";
import { CippImageCard } from "../components/CippCards/CippImageCard.jsx";
import { ApiGetCall } from "../api/ApiCall.jsx";
import { CippPropertyListCard } from "../components/CippCards/CippPropertyListCard.jsx";
import { DomainAdd } from "@mui/icons-material";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { Box, Container, Stack } from "@mui/system";

const now = new Date();

const Page = () => {
  const deviceData = ApiGetCall({
    url: "/api/deploymentstatus",
    queryKey: "deploymentstatus",
  });
  return (
    <>
      <Head>
        <title>CyberDrain Backend Manager</title>
      </Head>
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth={false}>
          <Stack spacing={6}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <CippImageCard
                  isFetching={deviceData.isFetching}
                  text={
                    deviceData.data?.status === "Ready"
                      ? "Your instance is ready for deployment. Please click the button below to start the onboarding process."
                      : deviceData.data?.status
                  }
                  title="Welcome"
                  linkText={
                    deviceData.data?.status === "Ready" ? "Start Onboarding" : "Contact Support"
                  }
                  link={
                    deviceData.data?.status === "Ready"
                      ? paths.onboarding
                      : "mailto:helpdesk@cyberdrain.com"
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CippPropertyListCard
                  title="Deployment Status"
                  isFetching={deviceData.isFetching}
                  propertyItems={[
                    {
                      label: "Deployment Status",
                      value: deviceData.data?.status,
                    },
                    {
                      label: "URL",
                      value: deviceData.data?.url,
                    },
                    {
                      label: "Instance Name",
                      value: deviceData.data?.resourceGroup,
                    },
                    {
                      label: "Outbound IPs",
                      value: deviceData.data?.outboundIps,
                    },
                    {
                      label: "API Enabled",
                      value: deviceData.data?.apiEnabled,
                    },
                  ]}
                  actionItems={[
                    // {
                    //   label: "Enable API",
                    //   icon: <LockOpen />,
                    //   link: paths.onboarding,
                    // },
                    {
                      label: "Add User",
                      icon: <UserPlusIcon />,
                      link: paths.users,
                    },
                    {
                      label: "Add Domain",
                      icon: <DomainAdd />,
                      link: paths.domains,
                    },
                  ]}
                />
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
