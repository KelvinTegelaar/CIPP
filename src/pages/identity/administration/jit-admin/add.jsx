import { Box, Divider, Grid } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippFormTenantSelector } from "../../../../components/CippComponents/CippFormTenantSelector";
import { useForm } from "react-hook-form";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { CippFormCondition } from "../../../../components/CippComponents/CippFormCondition";
import gdaproles from "/src/data/GDAPRoles.json";
import { CippFormDomainSelector } from "../../../../components/CippComponents/CippFormDomainSelector";
import { CippFormUserSelector } from "../../../../components/CippComponents/CippFormUserSelector";
const Page = () => {
  const formControl = useForm({ Mode: "onChange" });
  return (
    <>
      <CippFormPage
        queryKey={"JIT Admin Table"}
        formControl={formControl}
        title="JIT Admin"
        backButtonTitle="JIT Admin"
        postUrl="/api/ExecJitAdmin"
      >
        <Box sx={{ my: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <CippFormTenantSelector
                label={"Select a tenant to create the JIT Admin in"}
                formControl={formControl}
                type="single"
                allTenants={false}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <Divider sx={{ mb: 2 }} />
              <CippFormComponent
                type="radio"
                label="Would you like to create a new user or assign permissions to an existing user?"
                name="userAction"
                row
                formControl={formControl}
                options={[
                  { label: "New User", value: "create" },
                  { label: "Existing User", value: "select" },
                ]}
              />
              <Divider sx={{ my: 2 }} />
            </Grid>
            <CippFormCondition
              formControl={formControl}
              field="userAction"
              compareType="is"
              compareValue="create"
            >
              <Grid item xs={12} md={6}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="First Name"
                  name="firstName"
                  formControl={formControl}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  formControl={formControl}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Username"
                  name="userName"
                  formControl={formControl}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CippFormDomainSelector
                  formControl={formControl}
                  name="domain"
                  label="Domain Name"
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <Divider sx={{ me: 2 }} />
              </Grid>
            </CippFormCondition>
            <CippFormCondition
              formControl={formControl}
              field="userAction"
              compareType="is"
              compareValue="select"
            >
              <Grid item xs={12} md={12}>
                <Grid item xs={12} md={12}>
                  <CippFormUserSelector
                    formControl={formControl}
                    multiple={false}
                    name="existingUser"
                    label="User"
                  />
                </Grid>
              </Grid>
            </CippFormCondition>
            <Grid item xs={12} md={6}>
              <CippFormComponent
                type="datePicker"
                fullWidth
                label="Start Date"
                name="startDate"
                formControl={formControl}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CippFormComponent
                type="datePicker"
                fullWidth
                label="End Date"
                name="endDate"
                formControl={formControl}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <CippFormComponent
                type="autoComplete"
                fullWidth
                label="Roles"
                name="adminRoles"
                options={gdaproles.map((role) => ({ label: role.Name, value: role.ObjectId }))}
                formControl={formControl}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <CippFormComponent
                type="switch"
                label="Generate TAP"
                name="UseTAP"
                formControl={formControl}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CippFormComponent
                type="autoComplete"
                fullWidth
                label="Expiration Action"
                name="expireAction"
                multiple={false}
                options={[
                  { label: "Delete User", value: "DeleteUser" },
                  { label: "Disable User", value: "DisableUser" },
                  { label: "Remove Roles", value: "RemoveRoles" },
                ]}
                formControl={formControl}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CippFormComponent
                type="autoComplete"
                fullWidth
                label="Notification Action"
                name="postExecution"
                multiple={true}
                options={[
                  { label: "Webhook", value: "Webhook" },
                  { label: "Email", value: "email" },
                  { label: "PSA", value: "PSA" },
                ]}
                formControl={formControl}
              />
            </Grid>
          </Grid>
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
