import { Box } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { useSettings } from "../../../../hooks/use-settings";
import { Grid, darken, lighten, styled } from "@mui/system";
import { CippPropertyListCard } from "../../../../components/CippCards/CippPropertyListCard";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { getCippTranslation } from "../../../../utils/get-cipp-translation";

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

  const selectedSku = useWatch({
    control: formControl.control,
    name: "sku",
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
            <Grid size={{ xs: 6 }}>
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

                  addedField: {
                    billingCycle: "billingCycle",
                    commitmentTerm: "commitmentTerm",
                    description: "description",
                  },
                }}
                multiple={false}
                formControl={formControl}
                required={true}
                validators={{
                  validate: (option) => {
                    return option?.value ? true : "This field is required.";
                  },
                }}
                sortOptions={true}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <CippFormComponent
                type="number"
                label="Quantity of licenses to purchase."
                name="Quantity"
                formControl={formControl}
                validators={{
                  required: "This field is required.",
                  min: {
                    value: 1,
                    message: "Minimum value is 1.",
                  },
                }}
                required={true}
              />
            </Grid>
            {selectedSku?.value && (
              <Grid size={{ xs: 12 }}>
                <CippPropertyListCard
                  title="Selected SKU Details"
                  variant="outlined"
                  showDivider={false}
                  propertyItems={[
                    { label: "Name", value: selectedSku?.label },
                    {
                      label: "Billing Cycle",
                      value: getCippTranslation(selectedSku?.addedFields?.billingCycle),
                    },
                    {
                      label: "Commitment Term",
                      value: getCippTranslation(selectedSku?.addedFields?.commitmentTerm),
                    },
                    {
                      label: "Description",
                      value: getCippFormatting(
                        selectedSku?.addedFields?.description?.[0]?.value,
                        "htmlDescription"
                      ),
                    },
                  ]}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
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
