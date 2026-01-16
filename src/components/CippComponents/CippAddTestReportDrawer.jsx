import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
  Chip,
  Tab,
  Tabs,
  Paper,
  Stack,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { Add } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { ApiPostCall, ApiGetCall } from "../../api/ApiCall";

export const CippAddTestReportDrawer = ({ buttonText = "Create custom report" }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      IdentityTests: [],
      DevicesTests: [],
    },
  });

  const { isValid } = useFormState({ control: formControl.control });
  const selectedIdentityTests =
    useWatch({ control: formControl.control, name: "IdentityTests" }) || [];
  const selectedDeviceTests =
    useWatch({ control: formControl.control, name: "DevicesTests" }) || [];

  const createReport = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ListTestReports"],
  });

  // Fetch available tests for the form
  const availableTestsApi = ApiGetCall({
    url: "/api/ListAvailableTests",
    queryKey: ["ListAvailableTests"],
  });

  const availableTests = availableTestsApi.data || { IdentityTests: [], DevicesTests: [] };

  // Reset form fields on successful creation
  useEffect(() => {
    if (createReport.isSuccess) {
      formControl.reset({
        name: "",
        description: "",
        IdentityTests: [],
        DevicesTests: [],
      });
    }
  }, [createReport.isSuccess, formControl]);

  const handleSubmit = () => {
    formControl.trigger();
    if (!isValid) {
      return;
    }

    const values = formControl.getValues();
    Object.keys(values).forEach((key) => {
      if (values[key] === "" || values[key] === null) {
        delete values[key];
      }
    });

    createReport.mutate({
      url: "/api/AddTestReport",
      data: values,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSearchTerm("");
    setActiveTab(0);
    formControl.reset({
      name: "",
      description: "",
      IdentityTests: [],
      DevicesTests: [],
    });
  };

  const toggleTest = (testId, testType) => {
    const fieldName = testType === "Identity" ? "IdentityTests" : "DevicesTests";
    const currentTests = formControl.getValues(fieldName) || [];

    if (currentTests.includes(testId)) {
      formControl.setValue(
        fieldName,
        currentTests.filter((id) => id !== testId),
        { shouldValidate: true }
      );
    } else {
      formControl.setValue(fieldName, [...currentTests, testId], { shouldValidate: true });
    }
  };

  const isTestSelected = (testId, testType) => {
    return testType === "Identity"
      ? selectedIdentityTests.includes(testId)
      : selectedDeviceTests.includes(testId);
  };

  const filterTests = (tests) => {
    if (!searchTerm) return tests;
    return tests.filter(
      (test) =>
        test.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const currentTests =
    activeTab === 0
      ? filterTests(availableTests.IdentityTests || [])
      : filterTests(availableTests.DevicesTests || []);

  const currentTestType = activeTab === 0 ? "Identity" : "Devices";

  return (
    <>
      <Button
        variant="contained"
        sx={{
          whiteSpace: "nowrap",
          fontWeight: "bold",
          textTransform: "none",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          transition: "all 0.2s ease-in-out",
          px: 2,
        }}
        onClick={() => setDrawerVisible(true)}
        startIcon={<Add />}
      >
        {buttonText}
      </Button>
      <CippOffCanvas
        title="Create Custom Report"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <CippApiResults apiObject={createReport} />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={formControl.handleSubmit(handleSubmit)}
                disabled={createReport.isPending || !isValid}
              >
                {createReport.isPending
                  ? "Creating..."
                  : createReport.isSuccess
                  ? "Create Another"
                  : "Create Report"}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        <Grid container spacing={3}>
          {/* Report Details Section */}
          <Grid size={12}>
            <Paper sx={{ p: 3, backgroundColor: "background.default" }}>
              <Typography variant="h6" gutterBottom>
                Report Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <CippFormComponent
                    type="textField"
                    label="Report Name"
                    name="name"
                    formControl={formControl}
                    validators={{ required: "Report Name is required" }}
                  />
                </Grid>
                <Grid size={12}>
                  <CippFormComponent
                    type="textField"
                    label="Description"
                    name="description"
                    formControl={formControl}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Selection Summary */}
          <Grid size={12}>
            <Paper sx={{ p: 2, backgroundColor: "primary.50" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" color="primary">
                  Selected Tests:
                </Typography>
                <Chip
                  label={`${selectedIdentityTests.length} Identity`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${selectedDeviceTests.length} Device`}
                  color="secondary"
                  size="small"
                  variant="outlined"
                />
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Total: {selectedIdentityTests.length + selectedDeviceTests.length} tests
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Test Selection Section */}
          <Grid size={12}>
            <Paper sx={{ p: 0 }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => {
                    setActiveTab(newValue);
                    setSearchTerm("");
                  }}
                  variant="fullWidth"
                >
                  <Tab
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>Identity Tests</span>
                        {selectedIdentityTests.length > 0 && (
                          <Chip size="small" label={selectedIdentityTests.length} color="primary" />
                        )}
                      </Box>
                    }
                  />
                  <Tab
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>Device Tests</span>
                        {selectedDeviceTests.length > 0 && (
                          <Chip size="small" label={selectedDeviceTests.length} color="secondary" />
                        )}
                      </Box>
                    }
                  />
                </Tabs>
              </Box>

              {/* Search Bar */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Search ${currentTestType} tests...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>

              {/* Test List */}
              <Box
                sx={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  p: 2,
                }}
              >
                {availableTestsApi.isFetching ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">Loading tests...</Typography>
                  </Box>
                ) : currentTests.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? "No tests found matching your search" : "No tests available"}
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={1}>
                    {currentTests.map((test) => {
                      const isSelected = isTestSelected(test.id, currentTestType);
                      return (
                        <Grid size={12} key={test.id}>
                          <Card
                            sx={{
                              cursor: "pointer",
                              transition: "all 0.2s",
                              border: 1,
                              borderColor: isSelected ? "primary.main" : "divider",
                              backgroundColor: isSelected ? "primary.50" : "background.paper",
                              "&:hover": {
                                borderColor: "primary.main",
                                boxShadow: 2,
                              },
                            }}
                            onClick={() => toggleTest(test.id, currentTestType)}
                          >
                            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mb: 0.5,
                                    }}
                                  >
                                    <Chip
                                      label={test.id}
                                      size="small"
                                      color={isSelected ? "primary" : "default"}
                                      sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: isSelected ? 600 : 400,
                                        color: isSelected ? "primary.main" : "text.primary",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {test.name}
                                    </Typography>
                                  </Box>
                                  {test.description && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                      }}
                                    >
                                      {test.description}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CippOffCanvas>
    </>
  );
};
