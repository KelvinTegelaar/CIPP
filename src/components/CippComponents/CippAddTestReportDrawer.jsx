import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState } from "react-hook-form";
import { Add } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { ApiPostCall, ApiGetCall } from "../../api/ApiCall";

export const CippAddTestReportDrawer = ({ buttonText = "Create custom report" }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

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
    formControl.reset({
      name: "",
      description: "",
      IdentityTests: [],
      DevicesTests: [],
    });
  };

  return (
    <>
      <Button
        variant="contained"
        size="small"
        sx={{ whiteSpace: "nowrap", minHeight: 40 }}
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
          <Grid size={12}>
            <CippFormComponent
              type="autoComplete"
              label="Identity Tests"
              name="IdentityTests"
              formControl={formControl}
              multiple
              options={availableTests.IdentityTests?.map((test) => ({
                value: test.id,
                label: `${test.id} - ${test.name}`,
              }))}
              isFetching={availableTestsApi.isFetching}
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="autoComplete"
              label="Device Tests"
              name="DevicesTests"
              formControl={formControl}
              multiple
              options={availableTests.DevicesTests?.map((test) => ({
                value: test.id,
                label: `${test.id} - ${test.name}`,
              }))}
              isFetching={availableTestsApi.isFetching}
            />
          </Grid>
        </Grid>
      </CippOffCanvas>
    </>
  );
};
