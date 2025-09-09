import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { ApiPostCall } from "../../../../../api/ApiCall";
import { Box } from "@mui/material";
import { Grid } from "@mui/system";
import CippPageCard from "../../../../../components/CippCards/CippPageCard";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import CippAddEditTenantGroups from "/src/components/CippComponents/CippAddEditTenantGroups";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
  });

  const addGroupApi = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["TenantGroupListPage"],
  });

  const handleAddGroup = (data) => {
    addGroupApi.mutate({
      url: "/api/EditTenantGroup",
      data: {
        Action: "AddEdit",
        groupName: data.groupName,
        groupDescription: data.groupDescription,
      },
    });
  };

  return (
    <CippPageCard title="Add Tenant Group" backButtonTitle="Tenant Groups" noTenantInHead={true}>
      <Box sx={{ width: "100%" }}>
        <Grid container spacing={2} sx={{ my: 2, px: 2 }}>
          <Grid size={{ md: 8, xs: 12 }}>
            <CippAddEditTenantGroups
              formControl={formControl}
              onSubmit={handleAddGroup}
              title="Add Tenant Group"
              backButtonTitle="Tenant Groups"
            />
          </Grid>
        </Grid>
      </Box>

      <CippApiResults apiObject={addGroupApi} />
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
