import { Alert, Button, List, ListItem, SvgIcon, Typography } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { CippFormComponent } from "/src/components/CippComponents/CippFormComponent";
import GDAPRoles from "/src/data/GDAPRoles";
import { Box, Stack } from "@mui/system";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { CippPropertyList } from "/src/components/CippComponents/CippPropertyList";
import cippDefaults from "/src/data/CIPPDefaultGDAPRoles";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
  });

  const selectedRoles = useWatch({ control: formControl.control, name: "gdapRoles" });
  const customSuffix = useWatch({ control: formControl.control, name: "customSuffix" });

  const handleDefaults = () => {
    formControl.setValue("gdapRoles", cippDefaults);
  };

  return (
    <>
      <CippFormPage
        queryKey="ListGDAPRoles"
        formControl={formControl}
        title="GDAP Roles"
        backButtonTitle="GDAP Roles"
        postUrl="/api/ExecAddGDAPRole"
      >
        <Stack spacing={2}>
          <Alert severity="info">
            <Typography variant="subtitle">
              For each role you select a new group will be created inside of your partner tenant
              called "M365 GDAP RoleName". Add your users to these new groups to set their GDAP
              permissions. If you need to segment your groups for different teams or to define
              custom permissions, use the Custom Suffix to create additional group mappings per
              role.
            </Typography>
          </Alert>

          <Box>
            <CippFormComponent
              formControl={formControl}
              name="customSuffix"
              label="Custom Suffix (optional)"
              type="textField"
            />
          </Box>
          <Box>
            <Button
              onClick={handleDefaults}
              startIcon={
                <SvgIcon fontSize="small">
                  <ShieldCheckIcon />
                </SvgIcon>
              }
            >
              Add CIPP Default Roles
            </Button>
          </Box>
          <CippFormComponent
            formControl={formControl}
            name="gdapRoles"
            label="Select GDAP Roles"
            type="autoComplete"
            options={GDAPRoles.map((role) => ({ label: role.Name, value: role.ObjectId }))}
            multiple={true}
            creatable={false}
            required={true}
            validators={{
              validate: (value) => {
                if (!value || value.length === 0) {
                  return "Please select at least one GDAP Role";
                }
                return true;
              },
            }}
          />
          {selectedRoles?.some((role) => role.value === "62e90394-69f5-4237-9190-012177145e10") && (
            <Alert severity="warning">
              The Company Administrator role is a highly privileged role that should be used with
              caution. GDAP Relationships with this role will not be eligible for auto-extend.
            </Alert>
          )}
          {selectedRoles?.length > 0 && (
            <>
              <Alert severity="info">
                The following groups will be created in your partner tenant if they do not already
                exist:
              </Alert>
              <CippPropertyList
                propertyItems={selectedRoles.map((role) => {
                  return {
                    label: `M365 GDAP ${role.label}${customSuffix ? ` - ${customSuffix}` : ""}`,
                    value: GDAPRoles.find((r) => r.ObjectId === role.value).Description,
                  };
                })}
              />
            </>
          )}
        </Stack>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
