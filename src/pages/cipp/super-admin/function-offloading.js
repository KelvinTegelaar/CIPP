import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { useForm } from "react-hook-form";
import { Alert, Typography, Link } from "@mui/material";
import Grid from "@mui/material/Grid2";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall } from "../../../api/ApiCall";
import { useEffect } from "react";
import NextLink from "next/link";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";

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
            title="Functions App Versions"
            data={execOffloadFunctions.data?.Version}
            simpleColumns={["Name", "Version"]}
            refreshFunction={execOffloadFunctions.refetch}
            isFetching={execOffloadFunctions.isFetching}
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
              (!execOffloadFunctions?.data?.CanEnable && !execOffloadFunctions?.data?.OffloadFunctions)
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
