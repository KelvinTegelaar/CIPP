import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { useForm } from "react-hook-form";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall } from "../../../api/ApiCall";
import { useEffect } from "react";
import Link from "next/link";

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
        <Grid item xs={12} md={12}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            This mode enables offloading some of the more processor intensive functions to a
            separate function app. This can be useful in environments where the CIPP server is under
            heavy load. Please review{" "}
            <Link
              href="https://docs.cipp.app/user-documentation/cipp/settings/superadmin/function-offloading"
              target="_blank"
              rel="noreferrer"
            >
              our documentation
            </Link>{" "}
            for more information on how to configure this for your environment.
          </Typography>
        </Grid>
        <Grid item xs={12} md={12}>
          <CippFormComponent
            type="switch"
            name="OffloadFunctions"
            formControl={formControl}
            label="Enable Function Offloading"
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
