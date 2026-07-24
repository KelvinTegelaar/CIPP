import { useFieldArray } from "react-hook-form";
import { Alert, Box, Button, IconButton, Stack, Typography, Tooltip } from "@mui/material";
import { Grid } from "@mui/system";
import { Add, Delete } from "@mui/icons-material";
import CippFormComponent from "./CippFormComponent";

// SharePoint built-in permission levels. Used for both site-root and per-library grants.
export const SHAREPOINT_PERMISSION_LEVELS = [
  { label: "Read", value: "read" },
  { label: "Contribute", value: "contribute" },
  { label: "Edit", value: "edit" },
  { label: "Design", value: "design" },
  { label: "Full Control", value: "fullControl" },
];

// Reusable list of { principal, permissionLevel } grants backed by a react-hook-form field array.
// Groups are referenced by display name only (the same convention CA templates use): the name is
// matched against each target tenant at deploy time, so templates stay tenant-agnostic. `name` is
// the dot-notation path to the array (e.g. "siteTemplates.0.permissions").
export const CippSharePointPermissionEditor = ({
  formControl,
  name,
  emptyText = "No permissions configured.",
}) => {
  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name,
  });

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Groups are referenced by display name. During deployment the name is matched against each
        target tenant, so the same template works everywhere.
      </Alert>
      {fields.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {emptyText}
        </Typography>
      )}
      <Stack spacing={1}>
        {fields.map((field, index) => (
          <Grid container spacing={1} key={field.id} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 7 }}>
              <CippFormComponent
                type="textField"
                label="Group Display Name"
                name={`${name}.${index}.principal`}
                formControl={formControl}
                validators={{ required: "A group display name is required" }}
              />
            </Grid>
            <Grid size={{ xs: 10, md: 4 }}>
              <CippFormComponent
                type="select"
                label="Permission Level"
                name={`${name}.${index}.permissionLevel`}
                formControl={formControl}
                options={SHAREPOINT_PERMISSION_LEVELS}
                validators={{ required: "Select a permission level" }}
              />
            </Grid>
            <Grid size={{ xs: 2, md: 1 }} sx={{ display: "flex", justifyContent: "center" }}>
              <Tooltip title="Remove permission">
                <IconButton
                  aria-label="remove permission"
                  size="small"
                  onClick={() => remove(index)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        ))}
      </Stack>
      <Button
        size="small"
        startIcon={<Add />}
        onClick={() => append({ principal: "", permissionLevel: "read" })}
        sx={{ mt: fields.length > 0 ? 1 : 0 }}
      >
        Add Permission
      </Button>
    </Box>
  );
};

export default CippSharePointPermissionEditor;
