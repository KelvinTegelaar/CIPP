import { Link, Stack } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippDataTable } from "../CippTable/CippDataTable";
import { useWatch } from "react-hook-form";
import { Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";

export const CippWizardCSVImport = (props) => {
  const { onNextStep, formControl, currentStep, onPreviousStep, fields, name } = props;
  const tableData = useWatch({ control: formControl.control, name: name });
  const [newTableData, setTableData] = useState([]);
  const handleRemoveItem = (row) => {
    if (row === undefined) return false;
    const index = tableData.findIndex((item) => item === row);
    //create a copy of tableData, remove the item at index, and set the new tableData
    const newTableData = [...tableData];
    newTableData.splice(index, 1);
    setTableData(newTableData);
    console.log("Removed item", row);
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
      <CippFormComponent type="CSVReader" name={name} formControl={formControl} />
      <CippDataTable
        actions={actions}
        title={`CSV Preview`}
        data={tableData}
        simple={false}
        simpleColumns={fields}
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
