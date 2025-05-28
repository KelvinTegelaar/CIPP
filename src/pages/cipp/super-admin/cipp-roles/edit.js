import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippPageCard from "/src/components/CippCards/CippPageCard";
import { CippRoleAddEdit } from "/src/components/CippSettings/CippRoleAddEdit";
import { CardContent, Stack, Alert } from "@mui/material";

const EditRolePage = () => {
  const router = useRouter();
  const { role } = router.query;

  return (
    <CippPageCard hideBackButton={false} title={`Edit Role: ${role}`}>
      <CardContent>
        <Stack spacing={2}>
          <Alert color="info">
            Editing an existing role will update the permissions for all users assigned to this
            role.
          </Alert>
          <CippRoleAddEdit selectedRole={role} />
        </Stack>
      </CardContent>
    </CippPageCard>
  );
};

EditRolePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditRolePage;
