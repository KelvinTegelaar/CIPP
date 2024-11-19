import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { Mail } from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import ReactTimeAgo from "react-time-ago";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import Grid from "@mui/material/Grid2";
import { CippBannerListCard } from "../../../../../components/CippCards/CippBannerListCard";
import CippRemediationCard from "../../../../../components/CippCards/CippRemediationCard";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { userId } = router.query;

  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListUsers-${userId}`,
  });

  const BECCall = ApiGetCall({
    url: `/api/execBECCheck?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListSignIns-${userId}`,
  });

  // Set the title and subtitle for the layout
  const title = userRequest.isSuccess ? userRequest.data?.[0]?.displayName : "Loading...";

  const subtitle = userRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.userPrincipalName} />,
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Created: <ReactTimeAgo date={new Date(userRequest.data?.[0]?.createdDateTime)} />{" "}
            </>
          ),
        },
      ]
    : [];

  const data = userRequest.data?.[0];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={userRequest.isLoading}
    >
      {userRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {userRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <Grid container spacing={2}>
            <Grid item size={6}>
              <CippRemediationCard
                userPrincipalName={data.userPrincipalName}
                userId={data.id}
                tenantFilter={userSettingsDefaults.currentTenant}
                isFetching={BECCall.isLoading}
              />
            </Grid>
            <Grid item size={6}>
              <Stack spacing={3}>2</Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
