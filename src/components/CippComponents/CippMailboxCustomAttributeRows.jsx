import { useEffect } from "react";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { useFieldArray, useWatch } from "react-hook-form";
import { Grid } from "@mui/system";
import { CippIcons } from "../../utils/icon-registry";
import CippFormComponent from "./CippFormComponent";

export const CUSTOM_ATTRIBUTE_OPTIONS = Array.from({ length: 15 }, (_, i) => {
  const n = i + 1;
  return { label: `Custom Attribute ${n}`, value: `CustomAttribute${n}` };
});

/** Prefill rows for attributes that already have values; otherwise one empty row. */
export const buildCustomAttributeRows = (mailbox) => {
  const rows = [];
  for (let i = 1; i <= 15; i++) {
    const key = `CustomAttribute${i}`;
    const value = mailbox?.[key];
    if (value) {
      rows.push({
        attribute: { label: `Custom Attribute ${i}`, value: key },
        value,
      });
    }
  }
  return rows.length > 0 ? rows : [{ attribute: null, value: "" }];
};

/** Cloud-only, or hybrid with Exchange attributes cloud-managed. */
export const canEditMailboxCustomAttributes = (mailbox) => {
  if (!mailbox) {
    return false;
  }
  if (mailbox.IsDirSynced !== true) {
    return true;
  }
  return mailbox.IsExchangeCloudManaged === true;
};

export const CippMailboxCustomAttributeRows = ({
  formControl,
  name = "attributeRows",
  disabled = false,
}) => {
  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name,
  });

  const watchedRows = useWatch({
    control: formControl.control,
    name,
  });

  // Ensure at least one row when the dialog mounts
  useEffect(() => {
    if (fields.length === 0) {
      append({ attribute: null, value: "" });
    }
  }, [fields.length, append]);

  const getSelectedValues = (excludeIndex) =>
    (watchedRows || [])
      .map((row, index) => {
        if (index === excludeIndex) return null;
        return row?.attribute?.value ?? row?.attribute ?? null;
      })
      .filter(Boolean);

  const getOptionsForRow = (index) => {
    const selected = new Set(getSelectedValues(index));
    return CUSTOM_ATTRIBUTE_OPTIONS.filter((option) => !selected.has(option.value));
  };

  const canAddMore = fields.length < 15;

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Typography variant="body2" color="text.secondary">
        Choose which custom attributes to set. Leave Value empty to clear that attribute. Attributes
        not listed here are left unchanged.
      </Typography>
      {fields.map((field, index) => (
        <Grid container spacing={1} key={field.id} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <CippFormComponent
              type="autoComplete"
              name={`${name}.${index}.attribute`}
              label="Attribute"
              formControl={formControl}
              multiple={false}
              creatable={false}
              disabled={disabled}
              options={getOptionsForRow(index)}
              validators={
                disabled
                  ? undefined
                  : {
                      validate: (value) => {
                        const selected = value?.value ?? value;
                        if (!selected) {
                          return "Select an attribute";
                        }
                        return true;
                      },
                    }
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: !disabled && fields.length > 1 ? 6 : 7 }}>
            <CippFormComponent
              type="textField"
              name={`${name}.${index}.value`}
              label="Value"
              formControl={formControl}
              placeholder="Leave empty to clear"
              disabled={disabled}
            />
          </Grid>
          {!disabled && fields.length > 1 && (
            <Grid size={{ xs: 12, sm: 1 }}>
              <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "center" } }}>
                <IconButton
                  onClick={() => remove(index)}
                  aria-label="Remove attribute row"
                  size="small"
                >
                  <CippIcons.Remove />
                </IconButton>
              </Box>
            </Grid>
          )}
        </Grid>
      ))}
      {!disabled && (
        <Box>
          <Button
            size="small"
            startIcon={<CippIcons.Add />}
            onClick={() => append({ attribute: null, value: "" })}
            disabled={!canAddMore}
          >
            Add attribute
          </Button>
        </Box>
      )}
    </Stack>
  );
};

export default CippMailboxCustomAttributeRows;
