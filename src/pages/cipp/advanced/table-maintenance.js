import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useEffect, useState } from "react";
import { ApiPostCall } from "../../../api/ApiCall";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard"; // Fixed import
import { CippDataTable } from "/src/components/CippTable/CippDataTable"; // Fixed import
import { useDialog } from "../../../hooks/use-dialog";
import {
  Box,
  Container,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  SvgIcon,
  Tooltip,
  Typography,
  MenuItem,
  Select,
  Alert,
} from "@mui/material";
import { MagnifyingGlassIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Add, AddCircle, RemoveCircle, Sync, WarningAmber } from "@mui/icons-material";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { useForm, useWatch } from "react-hook-form";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import { Grid } from "@mui/system";
import CippButtonCard from "../../../components/CippCards/CippButtonCard";
import { CippApiResults } from "../../../components/CippComponents/CippApiResults";
import { CippHead } from "../../../components/CippComponents/CippHead";

const CustomAddEditRowDialog = ({ formControl, open, onClose, onSubmit, defaultValues }) => {
  const fields = useWatch({ control: formControl.control, name: "fields" });

  useEffect(() => {
    if (open) {
      formControl.reset({
        fields: defaultValues.fields || [],
      });
    }
  }, [open, defaultValues, formControl]);

  const addField = () => {
    formControl.reset({
      fields: [...fields, { name: "", value: "", type: "textField" }],
    });
  };

  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    formControl.reset({ fields: newFields });
  };

  const handleTypeChange = (index, newType) => {
    const newFields = fields.map((field, i) => (i === index ? { ...field, type: newType } : field));
    formControl.reset({ fields: newFields });
  };

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={onClose} width="xl">
      <DialogTitle>Add/Edit Row</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ my: 2, width: "100%" }}>
          {Array.isArray(fields) && fields?.length > 0 && (
            <>
              {fields.map((field, index) => (
                <Stack direction="row" spacing={0.5} key={index} alignItems="center" width="100%">
                  <Box width="30%">
                    <CippFormComponent
                      type="textField"
                      name={`fields[${index}].name`}
                      formControl={formControl}
                      label="Name"
                      disableVariables={true}
                    />
                  </Box>
                  <Box width="10%">
                    <Select
                      value={field.type}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                      fullWidth
                      sx={{ py: 1 }}
                    >
                      <MenuItem value="textField">Text</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="switch">Boolean</MenuItem>
                    </Select>
                  </Box>
                  <Box width="50%">
                    <CippFormComponent
                      type={field.type}
                      name={`fields[${index}].value`}
                      formControl={formControl}
                      label="Value"
                      sx={() => {
                        if (field.type === "switch") {
                          return { ml: 2 };
                        } else if (field.type === "number") {
                          return { width: "100%" };
                        } else {
                          return {};
                        }
                      }}
                      disableVariables={true}
                    />
                  </Box>

                  <IconButton onClick={() => removeField(index)}>
                    <RemoveCircle />
                  </IconButton>
                </Stack>
              ))}
            </>
          )}
          <Button onClick={addField} startIcon={<AddCircle />}>
            Add Property
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={formControl.handleSubmit(onSubmit)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Page = () => {
  const pageTitle = "Table Maintenance";
  const apiUrl = "/api/ExecAzBobbyTables";
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const addTableDialog = useDialog(); // Add dialog for adding table
  const deleteTableDialog = useDialog(); // Add dialog for deleting table
  const addEditRowDialog = useDialog(); // Add dialog for adding/editing row
  const [defaultAddEditValues, setDefaultAddEditValues] = useState({});
  const [tableFilterParams, setTableFilterParams] = useState({ First: 1000 });
  const formControl = useForm({
    mode: "onChange",
  });
  const [accordionExpanded, setAccordionExpanded] = useState(false);

  const addEditFormControl = useForm({
    mode: "onChange",
  });

  const filterFormControl = useForm({
    mode: "onChange",
    defaultValues: {
      First: 1000,
    },
  });

  const tableFilter = useWatch({ control: formControl.control, name: "tableFilter" });

  const fetchTables = ApiPostCall({
    queryKey: "CippTables",
    onResult: (result) => setTables(result),
  });

  const fetchTableData = ApiPostCall({
    queryKey: "CippTableData",
    onResult: (result) => {
      setTableData(result);
    },
  });

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName);
    fetchTableData.mutate({
      url: apiUrl,
      data: {
        FunctionName: "Get-AzDataTableEntity",
        TableName: tableName,
        Parameters: filterFormControl.getValues(),
      },
    });
  };

  const handleRefresh = () => {
    if (selectedTable) {
      fetchTableData.mutate({
        url: apiUrl,
        data: {
          FunctionName: "Get-AzDataTableEntity",
          TableName: selectedTable,
          Parameters: tableFilterParams,
        },
      });
    }
  };

  const tableRowAction = ApiPostCall({
    queryKey: "CippTableRowAction",
    onResult: handleRefresh,
  });

  const handleTableRefresh = () => {
    fetchTables.mutate({ url: apiUrl, data: { FunctionName: "Get-AzDataTable", Parameters: {} } });
  };

  const getSelectedProps = (data) => {
    if (data?.Property && data?.Property.length > 0) {
      var selectedProps = ["ETag", "PartitionKey", "RowKey"];
      data?.Property.map((prop) => {
        if (selectedProps.indexOf(prop.value) === -1) {
          selectedProps.push(prop.value);
        }
      });
      return selectedProps;
    } else {
      return [];
    }
  };

  useEffect(() => {
    handleTableRefresh();
  }, []);

  const actionItems = tables
    .filter(
      (table) =>
        tableFilter === "" ||
        tableFilter === undefined ||
        table.toLowerCase().includes(tableFilter.toLowerCase())
    )
    .map((table) => ({
      label: `${table}`,
      customFunction: () => {
        setTableData([]);
        handleTableSelect(table);
      },
      noConfirm: true,
    }));

  const propertyItems = [
    {
      label: "",
      value: (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 1 }}>
          <SvgIcon fontSize="small">
            <MagnifyingGlassIcon />
          </SvgIcon>
          <CippFormComponent type="textField" name="tableFilter" formControl={formControl} />
        </Stack>
      ),
    },
  ];

  const getTableFields = () => {
    if (tableData.length === 0) return [];
    const sampleRow = tableData[0];
    return Object.keys(sampleRow)
      .filter((key) => key !== "ETag" && key !== "Timestamp")
      .map((key) => {
        const value = sampleRow[key];
        let type = "textField";
        if (typeof value === "number") {
          type = "number";
        } else if (typeof value === "boolean") {
          type = "switch";
        }
        return {
          name: key,
          label: key,
          type: type,
          required: false,
        };
      });
  };

  return (
    <Container maxWidth={false} sx={{ width: "100%" }}>
      <CippHead title={pageTitle} noTenant={true} />
      <Typography variant="h4" gutterBottom>
        {pageTitle}
      </Typography>
      <Alert severity="warning" sx={{ mb: 2 }}>
        This page allows you to view and manage data in Azure Tables. This is advanced functionality
        that should only be used when directed by CyberDrain support.
      </Alert>
      <Grid sx={{ flexGrow: 1, display: "flex" }} container spacing={2}>
        <Grid size={3}>
          <CippPropertyListCard
            title="Tables"
            propertyItems={propertyItems}
            actionItems={actionItems.sort((a, b) => a.label.localeCompare(b.label))}
            isFetching={fetchTables.isPending}
            cardSx={{ maxHeight: "calc(100vh - 170px)", overflow: "auto" }}
            actionButton={
              <Stack direction="row" spacing={1}>
                <Tooltip title="Add Table">
                  <IconButton
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={addTableDialog.handleOpen} // Open add table dialog
                  >
                    <SvgIcon fontSize="small">
                      <Add />
                    </SvgIcon>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh Tables">
                  <IconButton
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleTableRefresh}
                  >
                    <SvgIcon fontSize="small">
                      <Sync />
                    </SvgIcon>
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          />
        </Grid>
        <Grid size={9}>
          {selectedTable && (
            <Box sx={{ width: "100%" }}>
              <Stack spacing={1}>
                <CippButtonCard
                  title="Table Filters"
                  accordionExpanded={accordionExpanded}
                  component="accordion"
                  CardButton={
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={filterFormControl.handleSubmit((data) => {
                        var properties = getSelectedProps(data);
                        setTableFilterParams({ ...data, Property: properties });
                        handleRefresh();
                        setAccordionExpanded(false);
                      })}
                    >
                      Apply Filters
                    </Button>
                  }
                >
                  <Stack spacing={1}>
                    <CippFormComponent
                      type="textField"
                      name="Filter"
                      formControl={filterFormControl}
                      label="OData Filter"
                    />
                    <CippFormComponent
                      type="autoComplete"
                      name="Property"
                      formControl={filterFormControl}
                      label="Property"
                      options={getTableFields().map((field) => ({
                        label: field?.label,
                        value: field?.name,
                      }))}
                    />
                    <Stack direction="row" spacing={1}>
                      <CippFormComponent
                        type="number"
                        name="First"
                        formControl={filterFormControl}
                        label="First"
                      />
                      <CippFormComponent
                        type="number"
                        name="Skip"
                        formControl={filterFormControl}
                        label="Skip"
                      />
                    </Stack>
                  </Stack>
                </CippButtonCard>
                <CippApiResults apiObject={tableRowAction} />
                <CippDataTable
                  title={`${selectedTable}`}
                  data={tableData}
                  refreshFunction={handleRefresh}
                  isFetching={fetchTableData.isPending}
                  cardButton={
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => {
                          setDefaultAddEditValues({
                            fields: getTableFields().map((field) => ({
                              name: field?.name,
                              value: "",
                              type: field?.type,
                            })),
                          });
                          addEditRowDialog.handleOpen();
                        }} // Open add/edit row dialog
                        startIcon={
                          <SvgIcon fontSize="small">
                            <Add />
                          </SvgIcon>
                        }
                      >
                        Add Row
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={deleteTableDialog.handleOpen} // Open delete table dialog
                        startIcon={
                          <SvgIcon fontSize="small">
                            <TrashIcon />
                          </SvgIcon>
                        }
                      >
                        Delete Table
                      </Button>
                    </Stack>
                  }
                  actions={[
                    {
                      label: "Edit",
                      type: "POST",
                      icon: (
                        <SvgIcon fontSize="small">
                          <PencilIcon />
                        </SvgIcon>
                      ),
                      customFunction: (row) => {
                        setDefaultAddEditValues({
                          fields: Object.keys(row)
                            .filter((key) => key !== "ETag" && key !== "Timestamp")
                            .map((key) => {
                              const value = row[key];
                              let type = "textField";
                              if (typeof value === "number") {
                                type = "number";
                              } else if (typeof value === "boolean") {
                                type = "switch";
                              }
                              return { name: key, value: value, type: type };
                            }),
                        });
                        addEditRowDialog.handleOpen();
                      },
                      noConfirm: true,
                      hideBulk: true,
                    },
                    {
                      label: "Delete",
                      type: "POST",
                      icon: (
                        <SvgIcon fontSize="small">
                          <TrashIcon />
                        </SvgIcon>
                      ),
                      url: apiUrl,
                      customFunction: (row) => {
                        var entity = [];
                        if (Array.isArray(row)) {
                          entity = row.map((r) => ({
                            RowKey: r.RowKey,
                            PartitionKey: r.PartitionKey,
                            ETag: r.ETag,
                          }));
                        } else {
                          entity = {
                            RowKey: row.RowKey,
                            PartitionKey: row.PartitionKey,
                            ETag: row.ETag,
                          };
                        }
                        tableRowAction.mutate({
                          url: apiUrl,
                          data: {
                            FunctionName: "Remove-AzDataTableEntity",
                            TableName: selectedTable,
                            Parameters: {
                              Entity: entity,
                            },
                          },
                        });
                      },
                      confirmText:
                        "Do you want to delete the selected row(s)? This action cannot be undone.",
                      multiPost: true,
                    },
                  ]}
                />
              </Stack>
            </Box>
          )}
        </Grid>
      </Grid>
      <CippApiDialog
        title="Add Table"
        createDialog={addTableDialog}
        fields={[{ name: "TableName", label: "Table Name", type: "textField", required: true }]}
        api={{
          url: apiUrl,
          confirmText: "Use this form to create a new table in Azure Tables.",
          type: "POST",
          data: { FunctionName: "New-AzDataTable" },
          onSuccess: () => {
            handleTableRefresh();
          },
        }}
      />
      <CippApiDialog
        title="Delete Table"
        createDialog={deleteTableDialog}
        fields={[]}
        api={{
          url: apiUrl,
          confirmText: (
            <Stack direction="row" spacing={1}>
              <WarningAmber />
              <Typography variant="body1">
                Are you sure you want to delete this table? This is a destructive action that cannot
                be undone.
              </Typography>
            </Stack>
          ),
          type: "POST",
          data: { FunctionName: "Remove-AzDataTable", TableName: selectedTable, Parameters: {} },
          onSuccess: () => {
            setSelectedTable(null);
            setTableData([]);
            handleTableRefresh();
          },
        }}
      />
      <CustomAddEditRowDialog
        formControl={addEditFormControl}
        open={addEditRowDialog.open}
        onClose={addEditRowDialog.handleClose}
        onSubmit={(data) => {
          const payload = data.fields.reduce((acc, field) => {
            acc[field.name] = field.value;
            return acc;
          }, {});
          tableRowAction.mutate({
            url: apiUrl,
            data: {
              FunctionName: "Add-AzDataTableEntity",
              TableName: selectedTable,
              Parameters: { Entity: payload, Force: true },
            },
            onSuccess: handleRefresh,
          });
          addEditRowDialog.handleClose();
        }}
        defaultValues={defaultAddEditValues}
      />
    </Container>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
