import { Box, Divider } from "@mui/material";
import { Grid } from "@mui/system";
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
  const formControl = useForm({ mode: "onChange" });
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
            <Grid size={{ md: 12, xs: 12 }}>
              <CippFormTenantSelector
                label={"Select a tenant to create the JIT Admin in"}
                formControl={formControl}
                type="single"
                allTenants={false}
                preselectedEnabled={true}
                validators={{ required: "A tenant must be selected" }}
              />
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
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
                required={true}
                validators={{ required: "You must select an option" }}
              />
              <Divider sx={{ my: 2 }} />
            </Grid>
            <CippFormCondition
              formControl={formControl}
              field="userAction"
              compareType="is"
              compareValue="create"
            >
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="First Name"
                  name="firstName"
                  formControl={formControl}
                  required={true}
                  validators={{ required: "First Name is required" }}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  formControl={formControl}
                  required={true}
                  validators={{ required: "Last Name is required" }}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Username"
                  name="userName"
                  formControl={formControl}
                  required={true}
                  validators={{ required: "Username is required" }}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormDomainSelector
                  formControl={formControl}
                  name="domain"
                  label="Domain Name"
                  required={true}
                  validators={{ required: "Domain is required" }}
                />
              </Grid>
              <Grid size={{ md: 12, xs: 12 }}>
                <Divider sx={{ me: 2 }} />
              </Grid>
            </CippFormCondition>
            <CippFormCondition
              formControl={formControl}
              field="userAction"
              compareType="is"
              compareValue="select"
            >
              <Grid size={{ md: 12, xs: 12 }}>
                <Grid size={{ md: 12, xs: 12 }}>
                  <CippFormUserSelector
                    formControl={formControl}
                    multiple={false}
                    name="existingUser"
                    label="User"
                    required={true}
                    validators={{ required: "User is required" }}
                  />
                </Grid>
              </Grid>
            </CippFormCondition>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="datePicker"
                fullWidth
                label="Start Date"
                name="startDate"
                formControl={formControl}
                required={true}
                validators={{ required: "Start date is required" }}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="datePicker"
                fullWidth
                label="End Date"
                name="endDate"
                formControl={formControl}
                required={true}
                validators={{
                  required: "End date is required",
                  validate: (value) => {
                    const startDate = formControl.getValues("startDate");
                    if (value && startDate && new Date(value) < new Date(startDate)) {
                      return "End date must be after start date";
                    }
                    return true;
                  },
                }}
              />
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                fullWidth
                label="Roles"
                name="adminRoles"
                options={gdaproles.map((role) => ({ label: role.Name, value: role.ObjectId }))}
                formControl={formControl}
                required={true}
                validators={{
                  required: "At least one role is required",
                  validate: (options) => {
                    if (!options?.length) {
                      return "At least one role is required";
                    }
                    return true;
                  },
                }}
              />
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Reason"
                name="reason"
                placeholder="Enter the reason for adding this JIT Admin"
                multiline
                rows={3}
                formControl={formControl}
                required={true}
                validators={{ required: "A reason is required" }}
              />
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Generate TAP"
                name="UseTAP"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                fullWidth
                label="Expiration Action"
                name="expireAction"
                multiple={false}
                required={true}
                options={[
                  { label: "Delete User", value: "DeleteUser" },
                  { label: "Disable User", value: "DisableUser" },
                  { label: "Remove Roles", value: "RemoveRoles" },
                ]}
                formControl={formControl}
                validators={{ required: "Expiration action is required" }}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
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
