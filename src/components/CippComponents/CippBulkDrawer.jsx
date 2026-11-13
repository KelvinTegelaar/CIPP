import { useEffect, useState } from "react";
import { CippIcons } from "../../utils/icon-registry";
import {
  Alert,
  Button,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippDataTable } from "../CippTable/CippDataTable";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { isMultiTenant } from "../../utils/tenant-selection";

// A CSV cell is a string, the manual dialog's selectors (domain) give { label, value }.
export const cellValue = (value) =>
  value && typeof value === "object" && "value" in value ? value.value : value;

const hasText = (value) => Boolean(String(cellValue(value) ?? "").trim());

// The named cells as trimmed strings, whatever shape they arrived in.
export const trimmedFields = (row, fields) =>
  Object.fromEntries(fields.map((field) => [field, String(cellValue(row?.[field]) ?? "").trim()]));

// A manually added row is queued in the same shape a CSV row has: strings, trimmed, selector
// objects reduced to their value. The preview table would otherwise flatten an object cell into
// domain.label / domain.value columns and show the domain column empty.
const normaliseRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      const cell = cellValue(value);
      return [key, typeof cell === "string" ? cell.trim() : cell];
    }),
  );

/**
 * Bulk-add drawer shared by contacts, shared mailboxes, rooms and equipment: rows come from a CSV
 * upload or the manual dialog, are previewed in a table, and are posted one request per row to
 * the single-add endpoint with bulkRequest so the results panel reports each row separately.
 *
 * fields          CSV columns, in order; also the manual dialog's inputs.
 * exampleRows     two arrays in `fields` order for the example CSV; values free of commas/quotes.
 * fieldValidators react-hook-form rules per field; `required` and `validate` also decide whether a
 *                 CSV row is valid (CSV rows never pass through the dialog's validation).
 * fieldTypes      per-field dialog input: a CippFormComponent type string, or a component that
 *                 takes formControl/name/label/validators (e.g. CippFormDomainSelector).
 * toPayload       (row, tenantDomain) => the exact body the single-add endpoint expects.
 * singleTenantOnly block submit under "All Tenants"; the endpoint needs a real tenant.
 */
export const CippBulkDrawer = ({
  title,
  buttonText,
  startIcon = <CippIcons.GroupAdd />,
  requiredPermissions = [],
  PermissionButton = Button,
  itemLabel,
  itemLabelPlural = `${itemLabel}s`,
  fields,
  exampleRows,
  csvFileName,
  fieldValidators = {},
  fieldTypes = {},
  invalidRowMessage,
  toPayload,
  url,
  relatedQueryKeys,
  singleTenantOnly = false,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addRowDialogOpen, setAddRowDialogOpen] = useState(false);
  const tenantDomain = useSettings().currentTenant;
  const isAllTenants = singleTenantOnly && (!tenantDomain || isMultiTenant(tenantDomain));

  const exampleCsv = [fields, ...exampleRows].map((row) => row.join(",")).join("\n") + "\n";

  const rowIsValid = (row) =>
    fields.every((field) => {
      const rules = fieldValidators[field];
      if (!rules) return true;
      if (rules.required && !hasText(row?.[field])) return false;
      return !rules.validate || rules.validate(cellValue(row?.[field])) === true;
    });

  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      bulkRows: [],
    },
  });

  const bulkRows = useWatch({ control: formControl.control, name: "bulkRows" });

  const invalidRowCount = (bulkRows || []).filter((row) => !rowIsValid(row)).length;

  const addItems = ApiPostCall({ relatedQueryKeys });

  // Every queued row has been posted once a batch succeeds; keep them and "Create More" would
  // re-post them all as duplicates.
  useEffect(() => {
    if (addItems.isSuccess) {
      formControl.setValue("bulkRows", [], { shouldValidate: true });
    }
  }, [addItems.isSuccess, formControl]);

  formControl.register("bulkRows", {
    validate: (value) => Array.isArray(value) && value.length > 0,
  });

  const handleRemoveItem = (row) => {
    if (row === undefined) return false;
    const currentData = formControl.getValues("bulkRows") || [];
    const rowKey = JSON.stringify(row);
    const index = currentData.findIndex((item) => JSON.stringify(item) === rowKey);
    if (index === -1) return false;
    const newData = [...currentData];
    newData.splice(index, 1);
    formControl.setValue("bulkRows", newData, { shouldValidate: true });
  };

  const handleAddItem = async () => {
    const valid = await formControl.trigger(
      fields.filter((field) => fieldValidators[field]).map((field) => `addrow.${field}`),
    );
    if (!valid) return;
    const newRowData = formControl.getValues("addrow");
    if (newRowData === undefined) return false;
    const currentData = formControl.getValues("bulkRows") || [];
    formControl.setValue("bulkRows", [...currentData, normaliseRow(newRowData)], {
      shouldValidate: true,
    });
    setAddRowDialogOpen(false);
    formControl.reset({
      ...formControl.getValues(),
      addrow: {},
    });
  };

  const handleSubmit = () => {
    addItems.mutate({
      url,
      bulkRequest: true,
      data: (formControl.getValues("bulkRows") || []).map((row) => toPayload(row, tenantDomain)),
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({ bulkRows: [] });
    addItems.reset();
    // CSVReader restores the last file name from sessionStorage on mount, so a reopened drawer
    // (or another bulk drawer) would show a file as loaded above an empty queue.
    sessionStorage.removeItem("csvFileName");
    sessionStorage.removeItem("csvFileSize");
  };

  const actions = [
    {
      icon: <CippIcons.Delete />,
      label: "Delete Row",
      confirmText: "Are you sure you want to delete this row?",
      customFunction: handleRemoveItem,
      noConfirm: true,
    },
  ];

  return (
    <>
      <PermissionButton
        {...(PermissionButton !== Button ? { requiredPermissions } : {})}
        onClick={() => setDrawerVisible(true)}
        startIcon={startIcon}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title={title}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={addItems} />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={
                  isAllTenants ||
                  addItems.isPending ||
                  !bulkRows ||
                  bulkRows.length === 0 ||
                  invalidRowCount > 0
                }
              >
                {addItems.isPending
                  ? `Creating ${itemLabelPlural}...`
                  : addItems.isSuccess
                    ? `Create More ${itemLabelPlural}`
                    : `Create ${itemLabelPlural}`}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </div>
          </Stack>
        }
      >
        <Grid container spacing={2}>
          {isAllTenants && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning">
                Bulk creation is single-tenant only. Select a specific tenant using the tenant
                selector before adding {itemLabelPlural.toLowerCase()}.
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Link
              href={`data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(exampleCsv)}`}
              download={csvFileName}
            >
              Download Example CSV
            </Link>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="CSVReader"
              name="bulkRows"
              formControl={formControl}
              onRemove={() => formControl.setValue("bulkRows", [], { shouldValidate: true })}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button size="small" onClick={() => setAddRowDialogOpen(true)}>
              Add {itemLabel} Manually
            </Button>
          </Grid>

          {invalidRowCount > 0 && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning">
                {invalidRowCount} row{invalidRowCount === 1 ? " is" : "s are"} {invalidRowMessage}.
                Fix the CSV or delete the row before creating {itemLabelPlural.toLowerCase()}.
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <CippDataTable
              actions={actions}
              title={`${itemLabel} Preview`}
              data={bulkRows || []}
              simple={false}
              simpleColumns={fields}
              noCard={true}
            />
          </Grid>
        </Grid>

        <Dialog
          open={addRowDialogOpen}
          onClose={() => setAddRowDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add a new {itemLabel.toLowerCase()}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ py: 1 }}>
              {fields.map((field) => {
                const fieldType = fieldTypes[field];
                // Anything that is not a CippFormComponent type name is a component (memo and
                // forwardRef components are objects, not functions).
                const Component =
                  fieldType && typeof fieldType !== "string" ? fieldType : CippFormComponent;
                return (
                  <Grid size={{ md: 6, xs: 12 }} key={field}>
                    <Component
                      name={`addrow.${field}`}
                      label={getCippTranslation(field)}
                      {...(Component === CippFormComponent ? { type: fieldType || "textField" } : {})}
                      formControl={formControl}
                      validators={fieldValidators[field]}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setAddRowDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddItem}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </CippOffCanvas>
    </>
  );
};
