import { useCallback, useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Card,
  CardHeader,
  Divider,
  List,
  ListItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

const options = [
  {
    label: "Sync Completed",
    value: "syncComplete",
  },
  {
    label: "Sync Failed",
    value: "SyncFailed",
  },
  {
    label: "Warranties Updated",
    value: "WarrantyUpdated",
  },
];

export const CippPSASyncOptions = (props) => {
  const { values: initialValues, onNextStep, onPreviousStep } = props;
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = useCallback((event) => {
    if (event.target.checked) {
      setValues((prevState) => ({
        ...prevState,
        [event.target.name]: true,
      }));
    } else {
      setValues((prevState) => ({
        ...prevState,
        [event.target.name]: false,
      }));
    }
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const newValues = Object.keys(values).reduce((acc, key) => {
        if (key.includes(".")) {
          const [parentKey, childKey] = key.split(".");
          if (!acc[parentKey]) {
            acc[parentKey] = {};
          }
          acc[parentKey][childKey] = values[key];
        } else {
          acc[key] = values[key];
        }
        return acc;
      }, {});

      onNextStep?.(newValues);
    },
    [values, onNextStep]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <div>
          <Typography variant="h6">Step 3. Select your Sync Options</Typography>
        </div>
        <Card variant="outlined">
          <CardHeader subheader="Manage your e-mail alerts" title="Email Notifications" />
          <Divider />
          <List disablePadding>
            {options.map((option, index) => {
              const hasDivider = options.length > index + 1;
              return (
                <ListItem divider={hasDivider} key={option.value}>
                  <Typography sx={{ flexGrow: 1 }} variant="body2">
                    {option.label}
                  </Typography>
                  <Switch name={option.value} onChange={handleChange} />
                </ListItem>
              );
            })}
          </List>
        </Card>
        {values.SyncTool !== "CSV" && (
          <>
            <Card variant="outlined">
              <CardHeader subheader="Select which device types to sync" title="Device Types Sync" />
              <Divider />
              <List disablePadding>
                {values.DeviceTypes &&
                  values.DeviceTypes.map((deviceType) => (
                    <ListItem key={deviceType.id}>
                      <Typography sx={{ flexGrow: 1 }} variant="body2">
                        {deviceType.name}
                      </Typography>
                      <Switch name={`syncTypes.${deviceType.id}`} onChange={handleChange} />
                    </ListItem>
                  ))}
              </List>
            </Card>
            <Card variant="outlined">
              <CardHeader subheader="Select which clients to sync" title="Client Sync" />
              <Divider />
              <List disablePadding>
                <ListItem>
                  <Typography sx={{ flexGrow: 1 }} variant="body2">
                    Sync all clients
                  </Typography>
                  <Switch
                    name="syncAllClients"
                    checked={values.syncAllClients}
                    onChange={handleChange}
                  />
                </ListItem>
                <ListItem>
                  {values.syncAllClients === false && (
                    <>
                      <Typography sx={{ flexGrow: 1 }} variant="body2">
                        Select Clients
                      </Typography>
                      <Autocomplete
                        fullWidth
                        multiple
                        options={values.Clients}
                        getOptionLabel={(option) =>
                          option.companyName ? option.companyName : option.name
                        }
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </>
                  )}
                </ListItem>
              </List>
            </Card>
          </>
        )}
        <Stack alignItems="center" direction="row" justifyContent="flex-end" spacing={2}>
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
