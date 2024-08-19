import Head from "next/head";
import { Unstable_Grid2 as Grid } from "@mui/material";
import { Layout as DashboardLayout } from "../layouts/dashboard";
import { Layout as ReportsLayout } from "../layouts/reports";
import { paths } from "../paths";
import { CippImageCard } from "../components/CippCards/CippImageCard.jsx";
import { ApiGetCall } from "../api/ApiCall.jsx";
import { CippPropertyListCard } from "../components/CippCards/CippPropertyListCard.jsx";
import { DomainAdd, Email, LockOpen } from "@mui/icons-material";
import { UserPlusIcon } from "@heroicons/react/24/outline";

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
      <div>
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
            {deviceData.data?.deployed === true && (
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
            )}
          </Grid>
        </Grid>
      </div>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <ReportsLayout>{page}</ReportsLayout>
  </DashboardLayout>
);

export default Page;
