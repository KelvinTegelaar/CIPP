import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { useForm } from "react-hook-form";
import { Grid, Typography } from "@mui/material";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall } from "../../../api/ApiCall";
import { useEffect } from "react";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Tenant Mode";

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      TenantMode: "default",
    },
  });

  const tenantModeOptions = [
    {
      label: "Multi Tenant - GDAP Mode",
      value: "default",
    },
    {
      label: "Multi Tenant - Add Partner Tenant",
      value: "PartnerTenantAvailable",
    },
    {
      label: "Single Tenant - Own Tenant Mode",
      value: "owntenant",
    },
  ];

  const execPartnerMode = ApiGetCall({
    url: "/api/ExecPartnerMode?Action=ListCurrent",
    queryKey: "execPartnerMode",
  });

  useEffect(() => {
    if (execPartnerMode.isSuccess) {
      formControl.reset({
        TenantMode: execPartnerMode.data?.TenantMode,
      });
    }
  }, [execPartnerMode.isSuccess, execPartnerMode.data]);

  return (
    <CippFormPage
      title={pageTitle}
      hideBackButton={true}
      hidePageType={true}
      formControl={formControl}
      resetForm={false}
      postUrl="/api/ExecPartnerMode"
      queryKey={["execPartnerMode", "TenantSelector"]}
    >
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={12}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            The configuration settings below should only be modified by a super admin. Super admins
            can configure what tenant mode CIPP operates in. See{" "}
            <Link
              href="https://docs.cipp.app/setup/installation/owntenant"
              target="_blank"
              rel="noreferrer"
            >
              our documentation
            </Link>{" "}
            for more information on how to configure these modes and what they mean.
          </Typography>
        </Grid>
        <Grid item xs={12} md={12}>
          <CippFormComponent
            type="radio"
            name="TenantMode"
            options={tenantModeOptions}
            formControl={formControl}
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
