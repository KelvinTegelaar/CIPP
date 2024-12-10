import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import ReactTimeAgo from "react-time-ago";
import { CippCopyToClipBoard } from "/src/components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import Grid from "@mui/material/Grid2";
import { Typography } from "@mui/material";
import { CippBannerListCard } from "/src/components/CippCards/CippBannerListCard";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { relationshipId } = router.query;

  const relationshipRequest = ApiGetCall({
    url: `/api/ListGraphRequest?Endpoint=tenantRelationships/delegatedAdminRelationships/${id}`,
    queryKey: `ListRelationships-${id}`,
  });

  // Set the title and subtitle for the layout
  const title = relationshipRequest.isSuccess ? relationshipRequest.data?.name : "Loading...";

  const subtitle = relationshipRequest.isSuccess
    ? [
        {
          text: <CippCopyToClipBoard type="chip" text={relationshipRequest.data?.id} />,
        },
        {
          text: (
            <>
              Created: <ReactTimeAgo date={new Date(relationshipRequest.data?.createdDateTime)} />{" "}
            </>
          ),
        },
      ]
    : [];

  const data = relationshipRequest.data;

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={relationshipRequest.isLoading}
    >
      {relationshipRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {relationshipRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <Grid container spacing={2}>
            <Grid item size={4}>
              <Typography variant="h6">Relationship Details</Typography>
              <div>
                <p>ID: {data.id}</p>
                <p>Name: {data.name}</p>
                <p>Status: {data.status}</p>
                {/* Add more fields as necessary */}
              </div>
            </Grid>
            <Grid item size={8}>
              <Stack spacing={3}>
                <Typography variant="h6">Additional Information</Typography>
                <CippBannerListCard
                  isFetching={relationshipRequest.isLoading}
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
