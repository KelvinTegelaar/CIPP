import { Box, Grid } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import CippInviteUser from "../../../../components/CippFormPages/CippInviteGuest";
const Page = () => {
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  return (
    <>
      <CippFormPage
        queryKey={`Users-${userSettingsDefaults.currentTenant}`}
        formControl={formControl}
        title="User"
        backButtonTitle="User Overview"
        postUrl="/api/AddGuest"
      >
        <Box sx={{ my: 2 }}>
          <Grid item xs={12}></Grid>
          <CippInviteUser formControl={formControl} userSettingsDefaults={userSettingsDefaults} />
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
