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
import { Typography } from "@mui/material";
import { CippBannerListCard } from "../../../../../components/CippCards/CippBannerListCard";
import { CippExchangeInfoCard } from "../../../../../components/CippCards/CippExchangeInfoCard";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { userId } = router.query;

  const userRequest = ApiGetCall({
    url: `/api/ListUserMailboxDetails?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `Mailbox-${userId}`,
  });
  const title = userRequest.isSuccess
    ? userRequest.data?.[0]?.Mailbox?.[0]?.UserPrincipalName
    : "Loading...";

  const subtitle = userRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: (
            <CippCopyToClipBoard
              type="chip"
              text={userRequest.data?.[0]?.Mailbox?.[0]?.UserPrincipalName}
            />
          ),
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Created:{" "}
              {userRequest.data?.[0]?.Mailbox?.[0]?.WhenCreated ? (
                <ReactTimeAgo date={new Date(userRequest.data?.[0]?.Mailbox?.[0]?.WhenCreated)} />
              ) : (
                "Unknown"
              )}
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
            <Grid item size={4}>
              <CippExchangeInfoCard exchangeData={data} isFetching={userRequest.isLoading} />
            </Grid>
            <Grid item size={8}>
              <Stack spacing={3}>
                <Typography variant="h6">Mailbox permissions</Typography>
                <CippBannerListCard
                  isFetching={userRequest.isLoading}
                  items={[]}
                  isCollapsible={false}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
