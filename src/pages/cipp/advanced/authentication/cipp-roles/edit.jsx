import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../../layouts/index";
import CippPageCard from "../../../../../components/CippCards/CippPageCard";
import { CippRoleAddEdit } from "../../../../../components/CippSettings/CippRoleAddEdit";
import { CardContent, Stack, Alert } from "@mui/material";

const EditRolePage = () => {
  const router = useRouter();
  const { role } = router.query;

  return (
    <CippPageCard hideBackButton={false} title={role ? `Edit Role: ${role}` : "Edit Role"}>
      <CardContent>
        <Stack spacing={2}>
          {!role && (
            <Alert severity="info">
              No role selected. Open this page from the CIPP Roles list to edit a role.
            </Alert>
          )}
          {role && (
            <>
              <Alert color="info">
                Editing an existing role will update the permissions for all users assigned to
                this role.
              </Alert>
              <CippRoleAddEdit selectedRole={role} />
            </>
          )}
        </Stack>
      </CardContent>
    </CippPageCard>
  );
};

EditRolePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditRolePage;
