import Head from "next/head";
import { Box, Container, Stack, Unstable_Grid2 as Grid, Switch, Select } from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { OrderQuickActions } from "../../../sections/dashboard/orders/order-quick-actions";
import { CippPropertyListCard } from "../../../components/CippCards/CippPropertyListCard";

const Page = () => {
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="xl" sx={{ height: "100%" }}>
          <Stack spacing={4}>
            <Stack spacing={2}>
              <Stack
                alignItems="flex-start"
                direction="row"
                justifyContent="space-between"
                spacing={1}
              ></Stack>
            </Stack>
            <div>
              <Grid container spacing={3}>
                <Grid xs={12} lg={8}>
                  <Stack spacing={3}>
                    <CippPropertyListCard
                      layout="two"
                      showDivider={false}
                      title="General Settings"
                      propertyItems={[
                        {
                          label: "Show Compressed Tenant List in overview",
                          value: <Switch />,
                        },

                        {
                          label: "Default Theme",
                          value: <Select />,
                        },
                        {
                          label: "Default Page Size",
                          value: <Select />,
                        },
                        {
                          label: "Default new user usage location",
                          value: <Switch />,
                        },
                        {
                          label: "Default user attributes",
                          value: <Select />,
                        },
                        {
                          label: "Menu Favourites",
                          value: <Select />,
                        },
                      ]}
                    />
                    <CippPropertyListCard
                      layout="two"
                      showDivider={false}
                      title="Offboarding Settings"
                      propertyItems={[
                        {
                          label: "Show Compressed Tenant List in overview",
                          value: <Switch />,
                        },
                        {
                          label: "Default new user usage location",
                          value: <Switch />,
                        },
                        {
                          label: "Default Theme",
                          value: <Select />,
                        },
                        {
                          label: "Default Page Size",
                          value: <Select />,
                        },
                      ]}
                    />
                  </Stack>
                </Grid>
                <Grid xs={12} lg={4}>
                  <OrderQuickActions />
                </Grid>
              </Grid>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
