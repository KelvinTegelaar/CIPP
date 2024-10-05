import { Box, CircularProgress, Skeleton } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "/src/hooks/use-settings";
import CippAddEditUser from "/src/components/CippFormPages/CippAddEditUser";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import { useEffect } from "react";
const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { userId } = router.query;

  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListUsers-${userId}`,
  });

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  useEffect(() => {
    if (userRequest.isSuccess) {
      const user = userRequest.data?.[0];
      formControl.reset({
        ...user,
      });
      formControl.trigger();
    }
  }, [userRequest.isSuccess]);

  return (
    <>
      <CippFormPage
        queryKey={`Users-${userSettingsDefaults.currentTenant}`}
        formControl={formControl}
        title={
          userRequest.isSuccess ? (
            `${userRequest.data?.[0]?.displayName} (${userRequest.data?.[0]?.userPrincipalName})`
          ) : (
            <CircularProgress />
          )
        }
        backButtonTitle="User Overview"
        formPageType="Edit"
        postUrl="/api/AddUser"
      >
        <Box sx={{ my: 2 }}>
          {userRequest.isLoading && <Skeleton variant="rectangular" />}
          {userRequest.isSuccess && (
            <CippAddEditUser
              formControl={formControl}
              userSettingsDefaults={userSettingsDefaults}
            />
          )}
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
