import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { useSettings } from "/src/hooks/use-settings";

const AddSiteForm = () => {
  const userSettingsDefaults = useSettings();
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  return (
    <CippFormPage
      title="SharePoint Site"
      postUrl="/api/AddSite"
      formControl={formControl}
      backButtonTitle="Back to Sites"
    >
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <CippFormComponent name="siteName" label="Site Name" formControl={formControl} required />
        </Grid>
        <Grid item xs={12}>
          <CippFormComponent
            name="siteDescription"
            label="Site Description"
            formControl={formControl}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CippFormComponent
            name="SiteOwner"
            label="Add Owner"
            formControl={formControl}
            required
            multiple={false}
            type="autoComplete"
            api={{
              url: "/api/ListGraphRequest",
              data: {
                Endpoint: "users",
                $filter: "accountEnabled eq true",
                $top: 999,
                $count: true,
                $orderby: "displayName",
                $select: "id,displayName,userPrincipalName",
              },
              dataKey: "Results",
              labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
              valueField: "userPrincipalName",
              addedField: {
                id: "id",
              },
            }}
            validators={{
              validate: (value) => {
                if (!value) {
                  return "Required";
                }
                return true;
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <CippFormComponent
            name="TemplateName"
            label="Template Name"
            formControl={formControl}
            required
            type="autoComplete"
            multiple={false}
            options={[
              { label: "Team (No Microsoft365 Group)", value: "team" },
              { label: "Communication", value: "communication" },
            ]}
            validators={{
              validate: (value) => {
                if (!value) {
                  return "Required";
                }
                return true;
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <CippFormComponent
            name="siteDesign"
            label="Site Design Template"
            formControl={formControl}
            required
            type="autoComplete"
            multiple={false}
            options={[
              { label: "Blank", value: "blank" },
              { label: "Showcase", value: "Showcase" },
              { label: "Topic", value: "Topic" },
            ]}
            validators={{
              validate: (value) => {
                if (!value) {
                  return "Required";
                }
                return true;
              },
            }}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

const Page = () => {
  return <AddSiteForm />;
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
