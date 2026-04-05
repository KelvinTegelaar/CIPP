import { TabbedLayout } from "../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import tabOptions from "./tabOptions";
import CippTablePage from "../../../components/CippComponents/CippTablePage";
import { Alert, Button, FormControlLabel, Link, Stack, Switch, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippApiResults } from "../../../components/CippComponents/CippApiResults";

const Page = () => {
  const pageTitle = "Function Offloading";
  const [offloadFunctions, setOffloadFunctions] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const execOffloadFunctions = ApiGetCall({
    url: "/api/ExecOffloadFunctions?Action=ListCurrent",
    queryKey: "execOffloadFunctionsSettings",
  });

  const updateOffloadFunctions = ApiPostCall({
    relatedQueryKeys: ["execOffloadFunctions", "execOffloadFunctionsSettings"],
  });

  const deleteOffloadEntry = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["execOffloadFunctions", "execOffloadFunctionsSettings"],
  });

  const handleDeleteOffloadEntry = (row) => {
    const entity = {
      RowKey: row.Name,
      PartitionKey: "Version",
    };

    deleteOffloadEntry.mutate({
      url: "/api/ExecAzBobbyTables",
      data: {
        FunctionName: "Remove-AzDataTableEntity",
        TableName: "Version",
        Parameters: {
          Entity: entity,
          Force: true,
        },
      },
    });
  };

  useEffect(() => {
    if (execOffloadFunctions.isSuccess) {
      setOffloadFunctions(Boolean(execOffloadFunctions.data?.OffloadFunctions));
      setIsDirty(false);
    }
  }, [execOffloadFunctions.isSuccess, execOffloadFunctions.data]);

  const handleSave = () => {
    updateOffloadFunctions.mutate({
      url: "/api/ExecOffloadFunctions",
      data: {
        OffloadFunctions: offloadFunctions,
      },
    });
  };

  const canEnable =
    execOffloadFunctions?.data?.OffloadFunctions || execOffloadFunctions?.data?.CanEnable;

  return (
    <CippTablePage
      cardButton={
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={offloadFunctions}
                onChange={(event) => {
                  setOffloadFunctions(event.target.checked);
                  setIsDirty(true);
                }}
                disabled={execOffloadFunctions.isFetching || !canEnable}
              />
            }
            label="Enable Function Offloading"
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isDirty || updateOffloadFunctions.isPending || execOffloadFunctions.isFetching}
          >
            Submit
          </Button>
        </Stack>
      }
      title={pageTitle}
      tenantInTitle={false}
      apiUrl="/api/ExecOffloadFunctions?Action=ListCurrent"
      apiDataKey="Version"
      queryKey="execOffloadFunctions"
      simpleColumns={["Name", "Version", "Default"]}
      actions={[
        {
          label: "Delete Offloading Entry",
          icon: <TrashIcon />,
          url: "/api/ExecAzBobbyTables",
          type: "POST",
          customFunction: handleDeleteOffloadEntry,
          confirmText:
            "Are you sure you want to delete the offloaded function entry for [Name]? This does not delete the function app from Azure, this must be done first or it will register again.",
          condition: (row) => row.Default !== true,
        },
      ]}
      tableFilter={
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={12}>
            <Typography variant="body2">
              This mode enables offloading some of the more processor intensive functions to a
              separate function app. This can be useful in environments where the CIPP server is
              under heavy load. Please review{" "}
              <Link
                component={NextLink}
                href="https://docs.cipp.app/user-documentation/cipp/settings/superadmin/function-offloading"
                target="_blank"
                rel="noreferrer"
              >
                our documentation
              </Link>{" "}
              for more information on how to configure this for your environment.
            </Typography>
          </Grid>
          <Grid size={12}>
            <Alert severity="info">
              If you are self-hosted, you must deploy the additional function app(s) to your CIPP
              resource group and enable CI/CD or all background tasks will fail.
            </Alert>
          </Grid>
          {execOffloadFunctions.data?.Alerts?.length > 0 && (
            <Grid size={12}>
              {execOffloadFunctions.data?.Alerts.map((alert, index) => (
                <Alert severity="warning" key={index} sx={{ mb: 1 }}>
                  {alert}
                </Alert>
              ))}
            </Grid>
          )}
          <Grid size={12}>
            <CippApiResults apiObject={updateOffloadFunctions} />
            <CippApiResults apiObject={deleteOffloadEntry} />
          </Grid>
        </Grid>
      }
    >
    </CippTablePage>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
