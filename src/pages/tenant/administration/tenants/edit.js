import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Stack, Box, Tab, Tabs, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { CippCardTabPanel } from "/src/components/CippComponents/CippCardTabPanel";
import CippFormSection from "/src/components/CippFormPages/CippFormSection";
import CippPageCard from "../../../../components/CippCards/CippPageCard";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import CippCustomVariables from "/src/components/CippComponents/CippCustomVariables";

function tabProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Page = () => {
  const router = useRouter();
  const { id } = router.query;
  const formControl = useForm({
    mode: "onChange",
  });
  const [value, setValue] = useState(0);

  const tenantDetails = ApiGetCall({
    url: id ? `/api/ListTenantDetails?tenantFilter=${id}` : null,
    queryKey: id ? `TenantProperties_${id}` : null,
  });

  useEffect(() => {
    if (tenantDetails.isSuccess && tenantDetails.data) {
      formControl.reset({
        customerId: id,
        Alias: tenantDetails?.data?.customProperties?.Alias ?? "",
        Groups:
          tenantDetails.data.Groups?.map((group) => ({
            label: group.Name,
            value: group.Id,
          })) || [],
      });
    }
  }, [tenantDetails.isSuccess, tenantDetails.data]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <CippPageCard
      title={
        tenantDetails.isSuccess
          ? `Edit Tenant - ${
              tenantDetails?.data?.customProperties?.Alias ?? tenantDetails?.data?.displayName
            }`
          : "Loading..."
      }
      backButtonTitle="Tenants"
      noTenantInHead={true}
    >
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: "24px", m: "auto" }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="Edit Tenant Tabs">
            <Tab label="General" {...tabProps(0)} />
            <Tab label="Custom Variables" {...tabProps(1)} />
          </Tabs>
        </Box>
        <CippCardTabPanel value={value} index={0}>
          <Grid container spacing={2} sx={{ my: 2, px: 2 }}>
            <Grid item size={{ md: 4, xs: 12 }}>
              <CippPropertyListCard
                variant="outlined"
                title="Tenant Details"
                propertyItems={[
                  { label: "Display Name", value: tenantDetails.data?.displayName },
                  {
                    label: "Tenant ID",
                    value: getCippFormatting(tenantDetails.data?.id, "Tenant"),
                  },
                ]}
                showDivider={false}
                isFetching={tenantDetails.isFetching}
              />
            </Grid>
            <Grid item size={{ md: 8, xs: 12 }}>
              <CippFormSection
                relatedQueryKeys={[
                  `TenantProperties_${id}`,
                  "ListTenants-notAllTenants",
                  "TenantSelector",
                ]}
                formControl={formControl}
                title="Edit Tenant"
                backButtonTitle="Tenants"
                postUrl="/api/EditTenant"
                customDataformatter={(values) => {
                  const formattedValues = {
                    tenantAlias: values.Alias,
                    tenantGroups: values.Groups.map((group) => ({
                      groupId: group.value,
                      groupName: group.label,
                    })),
                    customerId: id,
                  };
                  return formattedValues;
                }}
              >
                <Typography variant="h6">Properties</Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <CippFormComponent
                    type="textField"
                    name="Alias"
                    label="Tenant Alias"
                    placeholder="Enter a custom alias for this tenant to be displayed in CIPP."
                    formControl={formControl}
                    isFetching={tenantDetails.isFetching}
                    disabled={tenantDetails.isFetching}
                  />
                  <CippFormComponent
                    creatable={false}
                    type="autoComplete"
                    name="Groups"
                    label="Tenant Groups"
                    placeholder="Select the groups this tenant belongs to."
                    formControl={formControl}
                    multiple
                    api={{
                      url: "/api/ListTenantGroups",
                      queryKey: "AllTenantGroups",
                      dataKey: "Results",
                      labelField: "Name",
                      valueField: "Id",
                    }}
                    disabled={tenantDetails.isFetching}
                  />
                </Stack>
              </CippFormSection>
            </Grid>
          </Grid>
        </CippCardTabPanel>
        <CippCardTabPanel value={value} index={1}>
          <CippCustomVariables id={id} />
        </CippCardTabPanel>
      </Box>
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
