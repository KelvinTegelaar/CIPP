import { Layout as DashboardLayout } from "../../../layouts/index.js";
import "@mui/material";
import {
  Alert,
  Box,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import CippFormPage from "../../../components/CippFormPages/CippFormPage";
import { useSettings } from "../../../hooks/use-settings";
import { Info as InfoIcon, Help as HelpIcon } from "@mui/icons-material";

// Common SharePoint languages
const languageOptions = [
  { label: "English (United States)", value: 1033 },
  { label: "English (United Kingdom)", value: 2057 },
  { label: "French (France)", value: 1036 },
  { label: "German (Germany)", value: 1031 },
  { label: "Spanish (Spain)", value: 3082 },
  { label: "Italian (Italy)", value: 1040 },
  { label: "Portuguese (Brazil)", value: 1046 },
  { label: "Dutch (Netherlands)", value: 1043 },
  { label: "Japanese", value: 1041 },
  { label: "Chinese (Simplified)", value: 2052 },
  { label: "Korean", value: 1042 },
  { label: "Swedish", value: 1053 },
  { label: "Norwegian (Bokmål)", value: 1044 },
  { label: "Danish", value: 1030 },
  { label: "Finnish", value: 1035 },
  { label: "Polish", value: 1045 },
  { label: "Russian", value: 1049 },
  { label: "Arabic", value: 1025 },
  { label: "Hebrew", value: 1037 },
];

// Common time zones
const timeZoneOptions = [
  { label: "(UTC-12:00) International Date Line West", value: 0 },
  { label: "(UTC-08:00) Pacific Time (US & Canada)", value: 13 },
  { label: "(UTC-07:00) Mountain Time (US & Canada)", value: 12 },
  { label: "(UTC-06:00) Central Time (US & Canada)", value: 11 },
  { label: "(UTC-05:00) Eastern Time (US & Canada)", value: 10 },
  { label: "(UTC-04:00) Atlantic Time (Canada)", value: 9 },
  { label: "(UTC) Coordinated Universal Time", value: 39 },
  { label: "(UTC+00:00) London, Dublin, Edinburgh", value: 2 },
  { label: "(UTC+01:00) Amsterdam, Berlin, Rome, Paris", value: 4 },
  { label: "(UTC+02:00) Helsinki, Kyiv, Sofia", value: 6 },
  { label: "(UTC+03:00) Moscow, St. Petersburg", value: 51 },
  { label: "(UTC+05:30) Chennai, Kolkata, Mumbai", value: 23 },
  { label: "(UTC+08:00) Beijing, Singapore, Perth", value: 45 },
  { label: "(UTC+09:00) Tokyo, Seoul", value: 46 },
  { label: "(UTC+10:00) Sydney, Melbourne", value: 19 },
  { label: "(UTC+12:00) Auckland, Wellington", value: 17 },
];

// Helper component for section headers with optional help tooltip
const SectionHeader = ({ title, helpText, children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, mt: 2 }}>
    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
    {helpText && (
      <Tooltip title={helpText} arrow placement="right">
        <IconButton size="small" sx={{ p: 0.5 }}>
          <HelpIcon fontSize="small" color="action" />
        </IconButton>
      </Tooltip>
    )}
    {children}
  </Box>
);

// Info box component for contextual help
const InfoBox = ({ children, severity = "info" }) => (
  <Alert severity={severity} sx={{ mb: 2 }} icon={<InfoIcon fontSize="small" />}>
    <Typography variant="body2">{children}</Typography>
  </Alert>
);

const AddSiteForm = () => {
  const userSettingsDefaults = useSettings();
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      templateName: { label: "Communication", value: "Communication" },
      siteDesign: { label: "Blank", value: "Blank" },
      lcid: { label: "English (United States)", value: 1033 },
      shareByEmailEnabled: false,
    },
  });

  // Watch template to show/hide site design options
  const templateName = useWatch({ control: formControl.control, name: "templateName" });
  const siteDesign = useWatch({ control: formControl.control, name: "siteDesign" });

  const isCommunicationSite = templateName?.value === "Communication";
  const isCustomDesign = siteDesign?.value === "Custom";

  return (
    <CippFormPage
      title="Add SharePoint Site"
      postUrl="/api/AddSite"
      formControl={formControl}
      backButtonTitle="Back to Sites"
    >
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Intro guidance */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2, mb: 2, bgcolor: "background.default" }}>
            <Typography variant="body2" color="text.secondary">
              Create a new SharePoint site for your organization. Choose between a{" "}
              <strong>Communication site</strong> for broadcasting information to a broad audience,
              or a <strong>Team site</strong> for collaboration within a specific group. Not sure
              which to choose? Communication sites are best for company news, policies, and
              announcements. Team sites are better for project collaboration and document sharing.
            </Typography>
          </Paper>
        </Grid>

        {/* Basic Information Section */}
        <Grid size={{ xs: 12 }}>
          <SectionHeader
            title="Basic Information"
            helpText="Enter the core details for your new SharePoint site"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            name="siteName"
            label="Site Name"
            formControl={formControl}
            required
            placeholder="e.g., Marketing Team, Company Intranet"
            helperText="This will be displayed as the site title and used to create the site URL. Keep it short and descriptive."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            name="siteOwner"
            label="Site Owner"
            formControl={formControl}
            required
            multiple={false}
            type="autoComplete"
            api={{
              url: "/api/ListGraphRequest",
              // CippAutocomplete appends the current tenant to this key, so switching
              // tenants refetches the list.
              queryKey: "AddSiteOwner",
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
            helperText="The owner has full control over the site and can manage permissions, settings, and content."
            validators={{
              validate: (value) => {
                if (!value) {
                  return "Site owner is required";
                }
                return true;
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            name="siteDescription"
            label="Site Description"
            formControl={formControl}
            required
            multiline
            rows={2}
            placeholder="e.g., Central hub for marketing team resources, campaigns, and collaboration"
            helperText="A clear description helps users understand the site's purpose and improves searchability."
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <SectionHeader
            title="Site Template & Design"
            helpText="Choose the type of site and its visual design. This affects the default layout and available features."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            name="templateName"
            label="Site Template"
            formControl={formControl}
            required
            type="autoComplete"
            multiple={false}
            options={[
              { label: "Communication", value: "Communication" },
              { label: "Team Site (No M365 Group)", value: "Team" },
            ]}
            helperText="Communication = broadcast content to many viewers. Team = collaborate with a specific group."
            validators={{
              validate: (value) => {
                if (!value) {
                  return "Template is required";
                }
                return true;
              },
            }}
          />
        </Grid>

        {/* Template-specific guidance */}
        <Collapse in={isCommunicationSite} sx={{ width: "100%" }}>
          <Grid container spacing={2} sx={{ pl: 0, pt: 2 }}>
            <Grid size={{ xs: 12 }}>
              <InfoBox>
                <strong>Communication Site:</strong> Ideal for company intranets, department
                portals, news sites, and showcasing content to a broad audience. Features include
                modern page layouts, news web parts, and easy customization. Visitors typically
                read content rather than edit it.
              </InfoBox>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                name="siteDesign"
                label="Site Design"
                formControl={formControl}
                type="autoComplete"
                multiple={false}
                options={[
                  { label: "Blank - Start from scratch", value: "Blank" },
                  { label: "Topic - News, events, and highlighted content", value: "Topic" },
                  { label: "Showcase - Visual focus with large images", value: "Showcase" },
                  { label: "Custom - Use a tenant site design", value: "Custom" },
                ]}
                helperText="Each design provides a different starting layout. You can always customize later."
              />
            </Grid>

            <Collapse in={isCustomDesign} sx={{ width: "100%" }}>
              <Grid container spacing={2} sx={{ pl: 0, pt: 2 }}>
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    name="customSiteDesignId"
                    label="Custom Site Design"
                    formControl={formControl}
                    type="autoComplete"
                    multiple={false}
                    api={{
                      url: "/api/ListGraphRequest",
                      data: {
                        Endpoint: "sites/root/siteDesigns",
                        $select: "id,title,description",
                      },
                      dataKey: "Results",
                      labelField: (design) =>
                        design.description
                          ? `${design.title} - ${design.description}`
                          : design.title,
                      valueField: "id",
                    }}
                    placeholder="Select a custom site design from your tenant"
                    helperText="Custom site designs are created by your organization's SharePoint administrators and can include branding, web parts, and custom configurations."
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
        </Collapse>

        <Collapse in={!isCommunicationSite && templateName?.value === "Team"} sx={{ width: "100%" }}>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid size={{ xs: 12 }}>
              <InfoBox>
                <strong>Team Site (without M365 Group):</strong> Best for project workspaces, team
                collaboration, and document management. Includes document libraries, lists, and
                pages. This creates a standalone site without creating a Microsoft 365 Group or
                Teams integration. Choose this when you need a simple collaboration space without
                the overhead of a full M365 Group.
              </InfoBox>
            </Grid>
          </Grid>
        </Collapse>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <SectionHeader
            title="Regional Settings"
            helpText="Configure language and time zone for the site. These affect how dates, times, and content are displayed."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            name="lcid"
            label="Language"
            formControl={formControl}
            type="autoComplete"
            multiple={false}
            options={languageOptions}
            helperText="Sets the default language for site navigation, menus, and system text. Users can still view content in other languages."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            name="timeZoneId"
            label="Time Zone"
            formControl={formControl}
            type="autoComplete"
            multiple={false}
            options={timeZoneOptions}
            placeholder="Use tenant default"
            helperText="Affects how dates and times are displayed throughout the site. Choose the time zone where most users are located."
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <SectionHeader
            title="Advanced Options"
            helpText="Optional settings for security, organization, and storage. Skip these to use tenant defaults."
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These settings are optional. Leave them blank to use your organization&apos;s default
            policies.
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            name="sensitivityLabel"
            label="Sensitivity Label"
            formControl={formControl}
            type="autoComplete"
            multiple={false}
            api={{
              url: "/api/ListGraphRequest",
              data: {
                Endpoint: "security/informationProtection/sensitivityLabels",
                $select: "id,name,description",
                $filter: "isActive eq true",
              },
              dataKey: "Results",
              labelField: (label) =>
                label.description ? `${label.name} - ${label.description}` : label.name,
              valueField: "id",
            }}
            placeholder="None (use tenant default)"
            helperText="Apply a Microsoft Purview sensitivity label to classify and protect site content. Labels can enforce encryption, access controls, and data loss prevention policies."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            name="hubSiteId"
            label="Associate with Hub Site"
            formControl={formControl}
            type="autoComplete"
            multiple={false}
            api={{
              url: "/api/ListSites",
              data: {
                type: "SharePointSiteUsage",
                filter: "IsHubSite eq true",
              },
              dataKey: "Results",
              labelField: (site) => site.SiteUrl || site.displayName || site.Title,
              valueField: "SiteId",
            }}
            placeholder="None"
            helperText="Hub sites group related sites together with shared navigation and branding. Associating with a hub makes this site discoverable alongside other related sites."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            name="storageQuota"
            label="Storage Quota (MB)"
            formControl={formControl}
            type="number"
            placeholder="Use tenant default"
            helperText="Maximum storage space for this site in megabytes. Leave blank to use the tenant's default allocation. 1 GB = 1024 MB."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            name="shareByEmailEnabled"
            label="Allow external sharing by email"
            formControl={formControl}
            type="switch"
            helperText="When enabled, site owners can invite external users (outside your organization) to access content by sending email invitations. This setting is subject to tenant-level sharing policies."
          />
        </Grid>

        {/* Final guidance */}
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>What happens next?</strong> After clicking submit, the site will begin
              provisioning. This typically takes 1-2 minutes. The site owner will receive full
              access and can then customize the site, add content, and invite additional members.
            </Typography>
          </Alert>
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
