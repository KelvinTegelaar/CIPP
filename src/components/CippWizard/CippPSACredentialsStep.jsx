import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  FormHelperText,
  Link,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from "@mui/material";
import CSVReader from "../CSVReader";
import { LoadingButton } from "@mui/lab";
import { Quiz } from "@mui/icons-material";
import { ApiPostCall } from "../../api/ApiCall";
import { Box } from "@mui/system";
export const CippPSACredentialsStep = (props) => {
  const { values: initialValues, onPreviousStep, onNextStep } = props;
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleOnDrop = (data) => {
    const importdata = data.map((item) => {
      Object.keys(item).forEach((key) => {
        if (item[key] === null || item[key] === "") {
          delete item[key];
        }
      });
      return item;
    });
    setValues((prevState) => ({
      ...prevState,
      bulkDevices: importdata,
      url: potentialUrlConfig[values.SyncTool],
    }));
  };
  const potentialUrlConfig = {
    CSV: "/api/import-csv",
    CWM: "/api/config-psa",
    AT: "/api/config-psa",
    Halo: "/api/config-psa",
  };

  const potentialUrlTest = {
    CWM: "/api/test-cwm",
    AT: "/api/test-at",
    Halo: "/api/test-halo",
  };
  const PSATest = ApiPostCall({ urlFromData: true });
  const handleChange = useCallback((event) => {
    setValues((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
      url: potentialUrlConfig[values.SyncTool],
    }));
  }, []);
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (PSATest.data?.data.Success !== true && values.SyncTool !== "CSV") {
        setError("You must perform a successful test before proceeding.");
        return;
      }

      onNextStep?.({
        syncAllClients: true,
        ...PSATest.data?.data,
        ...values,
      });
    },
    [PSATest.data, onNextStep, values]
  );
  const fields = ["ClientName", "DeviceSerial", "DeviceProductNumber", "DeviceManufacturer"];

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <div>
          <Typography variant="h6">Step 2. Configure Source</Typography>
          <Typography color="text.secondary" variant="body2"></Typography>
        </div>
        <Stack spacing={2}>
          {values.SyncTool === "CSV" && (
            <>
              <Typography color="text.secondary" variant="body2">
                <Link
                  href={`data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(
                    fields.join(",") + "\n"
                  )}`}
                  download="BulkAdd.csv"
                >
                  Example CSV
                </Link>
              </Typography>
              <Typography color="text.primary" variant="body">
                <CSVReader
                  name="bulkDevices"
                  onDrop={handleOnDrop}
                  config={{ header: true, skipEmptyLines: true }}
                >
                  <span>Drop CSV file here or click to upload.</span>
                </CSVReader>
              </Typography>
            </>
          )}
          {values.SyncTool === "CWM" && (
            <>
              <TextField
                fullWidth
                label="CW Instance URL"
                name="resource"
                onChange={handleChange}
                placeholder="https://"
              />
              <TextField fullWidth label="Company Id" name="Company" onChange={handleChange} />
              <TextField fullWidth label="API Username" name="Username" onChange={handleChange} />
              <TextField
                type="password"
                fullWidth
                label="API Password"
                name="Secret"
                onChange={handleChange}
              />
            </>
          )}
          {values.SyncTool === "AT" && (
            <>
              <TextField
                fullWidth
                label="Autotask Integration ID"
                name="IntegrationId"
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Autotask API Username"
                name="Username"
                onChange={handleChange}
              />
              <TextField
                type="password"
                fullWidth
                label="Autotask API Password"
                name="Secret"
                onChange={handleChange}
              />
            </>
          )}
          {values.SyncTool === "Halo" && (
            <>
              <TextField
                fullWidth
                label="HaloPSA URL"
                name="haloUrl"
                onChange={handleChange}
                placeholder="https://"
              />
              <TextField fullWidth label="HaloPSA Tenant" name="tenant" onChange={handleChange} />
              <TextField
                fullWidth
                label="HaloPSA Client ID"
                name="ClientId"
                onChange={handleChange}
              />
              <TextField
                type="password"
                fullWidth
                label="HaloPSA Secret"
                name="Secret"
                onChange={handleChange}
              />
            </>
          )}
          <>
            {error && (
              <FormHelperText error sx={{ mt: 2 }}>
                {error}
              </FormHelperText>
            )}
            {PSATest.data?.data?.Messages != null && (
              <FormHelperText error sx={{ mt: 2 }}>
                {PSATest.data?.data?.Messages}
              </FormHelperText>
            )}
            {PSATest.data?.data?.Success === true && (
              <Alert severity="success">Connected successfully!</Alert>
            )}
            {values.SyncTool !== "CSV" && (
              <Box sx={{ width: "fit-content" }}>
                <LoadingButton
                  loading={PSATest.isFetching || PSATest.isPending}
                  onClick={() =>
                    PSATest.mutate({ ...values, url: potentialUrlTest[values.SyncTool] })
                  }
                  size="small"
                  startIcon={
                    <SvgIcon fontSize="small">
                      <Quiz />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  Test
                </LoadingButton>
              </Box>
            )}
          </>
        </Stack>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="flex-end"
          spacing={2}
          sx={{ mt: 3 }}
        >
          <Button color="inherit" onClick={onPreviousStep} size="large" type="button">
            Back
          </Button>
          <Button size="large" type="submit" variant="contained">
            Next Step
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};
