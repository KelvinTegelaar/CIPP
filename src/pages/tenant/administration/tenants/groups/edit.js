import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import { Grid } from "@mui/system";
import CippPageCard from "/src/components/CippCards/CippPageCard";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import CippAddEditTenantGroups from "/src/components/CippComponents/CippAddEditTenantGroups";

const Page = () => {
  const router = useRouter();
  const { id } = router.query;
  const formControl = useForm({
    mode: "onChange",
  });

  const groupDetails = ApiGetCall({
    url: id ? `/api/ListTenantGroups?groupId=${id}` : null,
    queryKey: id ? `TenantGroupProperties_${id}` : null,
  });

  const updateGroupApi = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [
      `TenantGroupProperties_${id}`,
      "TenantGroupListPage",
    ],
  });

  useEffect(() => {
    if (groupDetails.isSuccess && groupDetails.data) {
      formControl.reset({
        groupId: id,
        groupName: groupDetails?.data?.Results?.[0]?.Name ?? "",
        groupDescription: groupDetails?.data?.Results?.[0]?.Description ?? "",
        members:
          groupDetails?.data?.Results?.[0]?.Members?.map((member) => ({
            label: member.displayName,
            value: member.customerId,
          })) || [],
      });
    }
  }, [groupDetails.isSuccess, groupDetails.data]);

  return (
    <CippPageCard
      title={
        groupDetails.isSuccess
          ? `Edit Tenant Group - ${groupDetails?.data?.Results?.[0]?.Name}`
          : "Loading..."
      }
      backButtonTitle="Tenant Groups"
      noTenantInHead={true}
    >
      <Box sx={{ width: "100%" }}>
        <Grid container spacing={2} sx={{ my: 2, px: 2 }}>
          <Grid item size={{ md: 8, xs: 12 }}>
            <CippAddEditTenantGroups
              formControl={formControl}
              title="Edit Tenant Group"
              backButtonTitle="Tenant Groups"
            />
          </Grid>
        </Grid>
      </Box>

      <CippApiResults apiObject={updateGroupApi} />
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
