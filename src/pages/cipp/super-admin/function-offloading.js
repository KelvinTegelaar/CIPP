import { TabbedLayout } from "../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import tabOptions from "./tabOptions";
import CippFormPage from "../../../components/CippFormPages/CippFormPage";
import { useForm } from "react-hook-form";
import { Alert, Link } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import { useEffect } from "react";
import NextLink from "next/link";
import { CippDataTable } from "../../../components/CippTable/CippDataTable";
import { TrashIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Function Offloading";

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      OffloadFunctions: false,
    },
  });

  const execOffloadFunctions = ApiGetCall({
    url: "/api/ExecOffloadFunctions?Action=ListCurrent",
    queryKey: "execOffloadFunctions",
  });

  const deleteOffloadEntry = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["execOffloadFunctions"],
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
      formControl.reset({
        OffloadFunctions: execOffloadFunctions.data?.OffloadFunctions,
      });
    }
  }, [execOffloadFunctions.isSuccess, execOffloadFunctions.data]);

  return (
    <CippFormPage
      title={pageTitle}
      hideBackButton={true}
      hidePageType={true}
      formControl={formControl}
      resetForm={false}
      postUrl="/api/ExecOffloadFunctions"
      queryKey={"execOffloadFunctions"}
    >
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={12}>
          This mode enables offloading some of the more processor intensive functions to a separate
          function app. This can be useful in environments where the CIPP server is under heavy
          load. Please review{" "}
          <Link
            component={NextLink}
            href="https://docs.cipp.app/user-documentation/cipp/settings/superadmin/function-offloading"
            target="_blank"
            rel="noreferrer"
          >
            our documentation
          </Link>{" "}
          for more information on how to configure this for your environment.
          <Alert severity="info" sx={{ mt: 2 }}>
            If you are self-hosted, you must deploy the additional function app(s) to your CIPP
            resource group and enable CI/CD or all background tasks will fail.
          </Alert>
        </Grid>
        <Grid size={12}>
          <CippDataTable
            cardProps={{
              variant: "outlined",
            }}
            title="Registered Functions Apps"
            data={execOffloadFunctions.data?.Version}
            simpleColumns={["Name", "Version", "Default"]}
            refreshFunction={execOffloadFunctions.refetch}
            isFetching={execOffloadFunctions.isFetching}
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
          />
        </Grid>
        {execOffloadFunctions.data?.Alerts?.length > 0 && (
          <Grid size={12}>
            {execOffloadFunctions.data?.Alerts.map((alert, index) => (
              <Alert severity="warning" key={index}>
                {alert}
              </Alert>
            ))}
          </Grid>
        )}
        <Grid size={12}>
          <CippFormComponent
            type="switch"
            name="OffloadFunctions"
            formControl={formControl}
            label="Enable Function Offloading"
            disabled={
              execOffloadFunctions.isFetching ||
              (!execOffloadFunctions?.data?.CanEnable &&
                !execOffloadFunctions?.data?.OffloadFunctions)
            }
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
