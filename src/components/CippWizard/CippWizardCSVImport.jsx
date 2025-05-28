import { Button, Link, Stack, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Grid } from "@mui/system";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippDataTable } from "../CippTable/CippDataTable";
import { useWatch } from "react-hook-form";
import { Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { getCippTranslation } from "../../utils/get-cipp-translation";

export const CippWizardCSVImport = (props) => {
  const {
    onNextStep,
    formControl,
    currentStep,
    onPreviousStep,
    fields,
    name,
    manualFields = false,
    nameToCSVMapping,
    fileName = "BulkUser",
  } = props;
  const tableData = useWatch({ control: formControl.control, name: name });
  const [newTableData, setTableData] = useState([]);
  const [open, setOpen] = useState(false);

  // Register form field with validation
  formControl.register(name, {
    validate: (value) => Array.isArray(value) && value.length > 0,
  });

  const handleRemoveItem = (row) => {
    if (row === undefined) return false;
    const index = tableData?.findIndex((item) => item === row);
    const newTableData = [...tableData];
    newTableData.splice(index, 1);
    setTableData(newTableData);
  };

  const handleAddItem = () => {
    const newRowData = formControl.getValues("addrow");
    if (newRowData === undefined) return false;
    const newTableData = [...tableData, newRowData];
    setTableData(newTableData);
    setOpen(false);
  };

  useEffect(() => {
    formControl.setValue(name, newTableData, {
      shouldValidate: true,
    });
  }, [newTableData]);

  const actions = [
    {
      icon: <Delete />,
      label: "Delete Row",
      confirmText: "Are you sure you want to delete this row?",
      customFunction: handleRemoveItem,
      noConfirm: true,
    },
  ];

  return (
    <Stack spacing={3}>
      <Link
        href={`data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(fields.join(",") + "\n")}`}
        download={`${fileName}.csv`}
      >
        Download Example CSV
      </Link>
      <CippFormComponent
        nameToCSVMapping={nameToCSVMapping}
        type="CSVReader"
        name={name}
        formControl={formControl}
      />
      {manualFields && (
        <Grid container spacing={2}>
          {fields.map((field) => (
            <>
              <Grid item size={{ md: 4, sm: 6, xs: 12 }} key={field}>
                <CippFormComponent
                  name={`addrow.${field}`}
                  label={getCippTranslation(field)}
                  type="textField"
                  formControl={formControl}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (e.target.value === "") return false;
                      handleAddItem();
                      setTimeout(() => {
                        formControl.setValue(`addrow.${field}`, "");
                      }, 500);
                    }
                  }}
                />
              </Grid>
            </>
          ))}
          <Grid item size={{ md: 4, sm: 6, xs: 12 }}>
            <Button size="small" onClick={() => handleAddItem()}>
              Add Item
            </Button>
          </Grid>
        </Grid>
      )}
      {!manualFields && (
        <>
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12 }}>
              <Button size="small" onClick={() => setOpen(true)}>
                Add Item
              </Button>
            </Grid>
          </Grid>
          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Add a new row</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ py: 1 }}>
                {fields.map((field) => (
                  <Grid item size={{ xs: 12 }} key={field}>
                    <CippFormComponent
                      name={`addrow.${field}`}
                      label={getCippTranslation(field)}
                      type="textField"
                      formControl={formControl}
                    />
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleAddItem}>
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      <CippDataTable
        actions={actions}
        title={`CSV Preview`}
        data={tableData}
        simple={false}
        simpleColumns={fields}
        noCard={true}
      />
      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
