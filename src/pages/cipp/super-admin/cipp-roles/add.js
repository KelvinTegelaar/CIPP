import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippPageCard from "/src/components/CippCards/CippPageCard";
import { CippRoleAddEdit } from "/src/components/CippSettings/CippRoleAddEdit";
import { CardContent, Stack, Alert } from "@mui/material";

const AddRolePage = () => {
  return (
    <CippPageCard hideBackButton={false} title="Add New Role">
      <CardContent>
        <Stack spacing={2}>
          <Alert color="info">
            Create a new custom role with specific permissions and settings.
          </Alert>
          <CippRoleAddEdit />
        </Stack>
      </CardContent>
    </CippPageCard>
  );
};

AddRolePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddRolePage;
