import React from "react";
import { Box, Divider, Grid } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "/src/hooks/use-settings";
import { darken, lighten, styled } from "@mui/system";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const tenantDomain = userSettingsDefaults?.currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: tenantDomain,
      action: "NewSub",
      iagree: false,
    },
  });
  const GroupHeader = styled("div")(({ theme }) => ({
    position: "sticky",
    top: "-8px",
    padding: "4px 10px",
    color: theme.palette.primary.main,
    backgroundColor: lighten(theme.palette.primary.light, 0.85),
    ...theme.applyStyles("dark", {
      backgroundColor: darken(theme.palette.primary.main, 0.8),
    }),
  }));

  const GroupItems = styled("ul")({
    padding: 0,
  });

  return (
    <>
      <CippFormPage
        queryKey={"CippFormPage"}
        formControl={formControl}
        title="Add Subscription"
        backButtonTitle="CSP Licenses"
        postUrl="/api/ExecCSPLicense"
      >
        <Box sx={{ my: 2 }}>
          <Grid container spacing={2}>
            {/* Conditional Access Policy Selector */}
            <Grid item xs={6}>
              <CippFormComponent
                type="autoComplete"
                creatable={false}
                label={`Available SKUs for ${tenantDomain}`}
                name="sku"
                api={{
                  queryKey: `SKU-${tenantDomain}`,
                  url: "/api/ListCSPsku",
                  labelField: (option) => `${option?.name[0]?.value} (${option?.sku})`,
                  valueField: "sku",
                }}
                multiple={false}
                formControl={formControl}
              />
            </Grid>
            <Grid item xs={6}>
              <CippFormComponent
                type="number"
                label="Quantity of licenses to purchase."
                name="Quantity"
                formControl={formControl}
              />
            </Grid>
            <Grid item xs={12}>
              <CippFormComponent
                type="checkbox"
                label="I understand that buy pressing submit this license will be purchased according to the terms and conditions for this SKU with Sherweb."
                name="iagree"
                formControl={formControl}
                validators={{
                  required: "This field is required.",
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
