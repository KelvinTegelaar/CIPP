import { useState } from "react";
import { CardContent, Button, SvgIcon, Alert } from "@mui/material";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog";
import { ApiPostCall } from "/src/api/ApiCall";

const CippCustomVariables = ({ id }) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // Simple cache invalidation using React Query wildcard support
  const allRelatedKeys = ["CustomVariables*"];

  const updateCustomVariablesApi = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: allRelatedKeys,
  });

  const reservedVariables = [
    "tenantid",
    "tenantname",
    "tenantfilter",
    "partnertenantid",
    "samappid",
    "cippuserschema",
    "cippurl",
    "defaultdomain",
    "serial",
    "systemroot",
    "systemdrive",
    "temp",
    "userprofile",
    "username",
    "userdomain",
    "windir",
    "programfiles",
    "programfiles(x86)",
    "programdata",
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
          disableVariables: true,
          validators: { validate: validateVariableName },
        },
        {
          type: "textField",
          name: "Value",
          label: "Value",
          disableVariables: true,
          placeholder: "Enter the value for the custom variable.",
          required: true,
        },
        {
          type: "textField",
          name: "Description",
          label: "Description",
          placeholder: "Enter a description for the custom variable.",
          required: false,
          disableVariables: true,
        },
      ],
      type: "POST",
      url: "/api/ExecCippReplacemap",
      data: {
        Action: "!AddEdit",
        tenantId: id,
      },
      relatedQueryKeys: allRelatedKeys,
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
        tenantId: id,
      },
      relatedQueryKeys: allRelatedKeys,
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
          ? "Global variables are key-value pairs that can be used to store additional information for All Tenants. These are applied to templates in standards using the format %variablename%. If a tenant has a custom variable with the same name, the tenant's variable will take precedence."
          : "Custom variables are key-value pairs that can be used to store additional information about a tenant. These are applied to templates in standards using the format %variablename%."}
      </Alert>
      <CippDataTable
        queryKey={`CustomVariables-${id}`}
        title={id === "AllTenants" ? "Global Variables" : "Custom Variables"}
        actions={actions}
        api={{
          url: `/api/ExecCippReplacemap?Action=List&tenantId=${id}`,
          dataKey: "Results",
        }}
        simpleColumns={["RowKey", "Value", "Description"]}
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
            disableVariables: true,
            validators: { validate: validateVariableName },
          },
          {
            type: "textField",
            name: "Value",
            label: "Value",
            disableVariables: true,
            placeholder: "Enter the value for the custom variable.",
            required: true,
          },
          {
            type: "textField",
            name: "Description",
            label: "Description",
            placeholder: "Enter a description for the custom variable.",
            required: false,
            disableVariables: true,
          },
        ]}
        api={{
          type: "POST",
          url: "/api/ExecCippReplacemap",
          data: { Action: "AddEdit", tenantId: id },
          relatedQueryKeys: allRelatedKeys,
        }}
      />
    </CardContent>
  );
};

export default CippCustomVariables;
