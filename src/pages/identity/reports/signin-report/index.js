import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { useState } from "react";
import { Button, Grid, TextField, Switch, FormControlLabel } from "@mui/material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";

const Page = () => {
  const pageTitle = "Sign Ins Report";
  const apiUrl = "/api/ListSignIns";
  const actions = [];
  const offCanvas = null;
  const simpleColumns = [
    "createdDateTime",
    "userPrincipalName",
    "clientAppUsed",
    "authenticationRequirement",
    "errorCode",
    "additionalDetails",
    "locationcipp",
  ];

  const [filterValues, setFilterValues] = useState({
    Days: 7,
    filter: "",
    failedLogonsOnly: false,
    FailureThreshold: 0,
  });

  const [appliedFilters, setAppliedFilters] = useState(filterValues);

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilterValues({
      ...filterValues,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFilterSubmit = () => {
    setAppliedFilters(filterValues);
  };

  const tableFilter = (
    <CippButtonCard title="Filter Options" component="accordion">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Days"
            name="Days"
            type="number"
            value={filterValues.Days}
            onChange={handleFilterChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Custom Filter"
            name="filter"
            value={filterValues.filter}
            onChange={handleFilterChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={filterValues.failedLogonsOnly}
                onChange={handleFilterChange}
                name="failedLogonsOnly"
              />
            }
            label="Failed Logons Only"
          />
        </Grid>
        {filterValues.failedLogonsOnly && (
          <Grid item xs={12} sm={6}>
            <TextField
              label="Failure Threshold"
              name="FailureThreshold"
              type="number"
              value={filterValues.FailureThreshold}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleFilterSubmit}>
            Apply Filter
          </Button>
        </Grid>
      </Grid>
    </CippButtonCard>
  );

  return (
    <>
      <CippTablePage
        tableFilter={tableFilter}
        title={pageTitle}
        apiUrl={apiUrl}
        apiData={appliedFilters}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        queryKey={`ListSignIns-${JSON.stringify(appliedFilters)}`}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
