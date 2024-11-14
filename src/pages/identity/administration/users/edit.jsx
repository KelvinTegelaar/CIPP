import { Box, CircularProgress, Skeleton } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "/src/hooks/use-settings";
import CippAddEditUser from "/src/components/CippFormPages/CippAddEditUser";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import { useEffect } from "react";
import CippFormSkeleton from "../../../../components/CippFormPages/CippFormSkeleton";
import { getCippLicenseTranslation } from "/src/utils/get-cipp-license-translation";

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
      console.log(user);
      formControl.reset({
        ...user,
        tenantFilter: userSettingsDefaults.currentTenant,
        licenses: user.assignedLicenses.map((license) => ({
          label: getCippLicenseTranslation([license]),
          value: license.skuId,
        })),
      });
      formControl.trigger();
    }
  }, [userRequest.isSuccess, userRequest.data, userRequest.isLoading]);

  return (
    <>
      <CippFormPage
        queryKey={[`ListUsers-${userId}`, `Licenses-${userSettingsDefaults.currentTenant}`]}
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
        postUrl="/api/EditUser"
      >
        <Box sx={{ my: 2 }}>
          {userRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 1, 1, 1, 2, 2, 2, 2, 3]} />}
          {userRequest.isSuccess && (
            <CippAddEditUser
              formControl={formControl}
              userSettingsDefaults={userSettingsDefaults}
              formType="edit"
            />
          )}
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
