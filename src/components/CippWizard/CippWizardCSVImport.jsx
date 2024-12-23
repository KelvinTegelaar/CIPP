import { Button, Grid, Link, Stack } from "@mui/material";
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
    manualFields = true,
    nameToCSVMapping,
  } = props;
  const tableData = useWatch({ control: formControl.control, name: name });
  const [newTableData, setTableData] = useState([]);
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
  };

  useEffect(() => {
    formControl.setValue(name, newTableData);
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
        download="BulkUser.csv"
      >
        Download Example CSV
      </Link>
      <CippFormComponent
        nameToCSVMapping={nameToCSVMapping}
        type="CSVReader"
        name={name}
        formControl={formControl}
      />
      <Grid container spacing={2}>
        {manualFields &&
          fields.map((field) => (
            <Grid item xs={12} sm={6} md={4} key={field}>
              <CippFormComponent
                name={`addrow.${field}`}
                label={getCippTranslation(field)}
                type="textField"
                formControl={formControl}
              />
            </Grid>
          ))}
        <Grid item xs={12} sm={6} md={4}>
          <Button size="small" onClick={() => handleAddItem()}>
            Add Item
          </Button>
        </Grid>
      </Grid>
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
