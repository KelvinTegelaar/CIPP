import { Alert, Box, Stack, Typography } from "@mui/material";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";

export const CippAddEditGdapRoleTemplate = (props) => {
  const { formControl, availableRoles } = props;

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Alert severity="info">
        <Typography variant="subtitle">
          GDAP Role templates are used to create new GDAP invites for your customer tenants. Make
          sure to select a template that matches the permissions you want to grant.
        </Typography>
      </Alert>

      <Box>
        <CippFormComponent
          formControl={formControl}
          name="templateId"
          label="Template Name"
          type="textField"
          required={true}
        />
      </Box>
      <CippFormComponent
        formControl={formControl}
        name="roleMappings"
        label="Select GDAP Role Mappings"
        type="autoComplete"
        isFetching={availableRoles?.isFetching}
        options={availableRoles?.data?.map((role) => ({
          label: role.GroupName,
          value: role.GroupId,
          addedFields: role,
        }))}
        multiple={true}
        creatable={false}
        required={true}
        validators={{
          validate: (value) => {
            if (!value || value.length === 0) {
              return "Please select at least one GDAP Role Mapping";
            }
            return true;
          },
        }}
        sortOptions={true}
      />
    </Stack>
  );
};
