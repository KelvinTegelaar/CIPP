import { useState } from "react";
import { CardContent, Button, SvgIcon, Alert } from "@mui/material";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog";
import { ApiPostCall } from "/src/api/ApiCall";

const CippCustomVariables = ({ id }) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const updateCustomVariablesApi = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`CustomVariables_${id}`],
  });

  const reservedVariables = [
    "tenantid",
    "tenantname",
    "tenantfilter",
    "partnertenantid",
    "samappid",
  ];

  const validateVariableName = (value) => {
    if (reservedVariables.includes(value.toLowerCase())) {
      return "The variable name is reserved and cannot be used.";
    } else if (!value.includes(" ") && !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(value)) {
      return true;
    } else {
      return "The variable name must not contain spaces or special characters.";
    }
  };

  const actions = [
    {
      label: "Edit",
      icon: (
        <SvgIcon>
          <PencilIcon />
        </SvgIcon>
      ),
      confirmText: "Update the custom variable '[RowKey]'?",
      hideBulk: true,
      setDefaultValues: true,
      fields: [
        {
          type: "textField",
          name: "RowKey",
          label: "Variable Name",
          placeholder: "Enter the key for the custom variable.",
          required: true,
          validators: validateVariableName,
        },
        {
          type: "textField",
          name: "Value",
          label: "Value",
          placeholder: "Enter the value for the custom variable.",
          required: true,
        },
      ],
      type: "POST",
      url: "/api/ExecCippReplacemap",
      data: {
        Action: "!AddEdit",
        customerId: id,
      },
      relatedQueryKeys: [`CustomVariables_${id}`],
    },
    {
      label: "Delete",
      icon: <TrashIcon />,
      confirmText: "Are you sure you want to delete [RowKey]?",
      type: "POST",
      url: "/api/ExecCippReplacemap",
      data: {
        Action: "Delete",
        RowKey: "RowKey",
        customerId: id,
      },
      relatedQueryKeys: [`CustomVariables_${id}`],
      multiPost: false,
    },
  ];

  const handleAddVariable = () => {
    setOpenAddDialog(true);
  };

  return (
    <CardContent>
      <Alert severity="info" sx={{ mb: 2 }}>
        {id === "AllTenants"
          ? "Global variables are key-value pairs that can be used to store additional information for All Tenants. These are applied to templates in standards using the format %VariableName%. If a tenant has a custom variable with the same name, the tenant's variable will take precedence."
          : "Custom variables are key-value pairs that can be used to store additional information about a tenant. These are applied to templates in standards using the format %VariableName%."}
      </Alert>
      <CippDataTable
        queryKey={`CustomVariables_${id}`}
        title={id === "AllTenants" ? "Global Variables" : "Custom Variables"}
        actions={actions}
        api={{
          url: `/api/ExecCippReplacemap?Action=List&customerId=${id}`,
          dataKey: "Results",
        }}
        simpleColumns={["RowKey", "Value"]}
        cardButton={
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleAddVariable}
            startIcon={
              <SvgIcon fontSize="small">
                <PlusIcon />
              </SvgIcon>
            }
          >
            Add Variable
          </Button>
        }
      />
      <CippApiResults apiObject={updateCustomVariablesApi} />
      <CippApiDialog
        createDialog={{
          open: openAddDialog,
          handleClose: () => setOpenAddDialog(false),
        }}
        title="Add Variable"
        fields={[
          {
            type: "textField",
            name: "RowKey",
            label: "Variable Name",
            placeholder: "Enter the name for the custom variable without %.",
            required: true,
            validators: validateVariableName,
          },
          {
            type: "textField",
            name: "Value",
            label: "Value",
            placeholder: "Enter the value for the custom variable.",
            required: true,
          },
        ]}
        api={{
          type: "POST",
          url: "/api/ExecCippReplacemap",
          data: { Action: "AddEdit", customerId: id },
          relatedQueryKeys: [`CustomVariables_${id}`],
        }}
      />
    </CardContent>
  );
};

export default CippCustomVariables;
