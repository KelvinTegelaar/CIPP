import { Box } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { useForm } from "react-hook-form";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import jitAdminRoles from "../../../../data/JitAdminRoles.json";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      templateName: "",
      roles: [],
    },
  });

  const router = useRouter();
  const { id } = router.query;

  const template = ApiGetCall({
    url: `/api/ListJITRoleTemplates?GUID=${id}`,
    queryKey: `JITRoleTemplate-${id}`,
    waiting: !!id,
  });

  useEffect(() => {
    if (template.isSuccess && template.data?.[0]) {
      const templateData = template.data[0];
      formControl.reset({ ...templateData, GUID: id });
    }
  }, [template.isSuccess, template.data]);

  return (
    <CippFormPage
      resetForm={false}
      queryKey="ListJITRoleTemplates"
      formControl={formControl}
      title="JIT Role Template"
      backButtonTitle="JIT Role Templates"
      postUrl="/api/EditJITRoleTemplate"
    >
      <Box sx={{ my: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Template Name"
              name="templateName"
              formControl={formControl}
              required={true}
              validators={{ required: "Template Name is required" }}
            />
          </Grid>
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              fullWidth
              label="Allowed Roles"
              name="roles"
              multiple={true}
              creatable={false}
              options={jitAdminRoles.map((role) => ({ label: role.Name, value: role.ObjectId }))}
              formControl={formControl}
              required={true}
              validators={{
                required: "At least one role is required",
                validate: (options) =>
                  options?.length ? true : "At least one role is required",
              }}
              helperText="CIPP roles assigned this template may only grant these directory roles via JIT Admin."
            />
          </Grid>
          <CippFormComponent type="hidden" name="GUID" formControl={formControl} />
        </Grid>
      </Box>
    </CippFormPage>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
