import { Alert, Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import Link from "next/link";
import { CopyAll, Delete, PlayArrow, AddBox, Edit, GitHub } from "@mui/icons-material";
import { ApiGetCall, ApiPostCall } from "../../../../../api/ApiCall";
import { Grid } from "@mui/system";
import { CippApiResults } from "../../../../../components/CippComponents/CippApiResults";
import { EyeIcon } from "@heroicons/react/24/outline";
import tabOptions from "../tabOptions.json";

const Page = () => {
  const oldStandards = ApiGetCall({ url: "/api/ListStandards", queryKey: "ListStandards-legacy" });
  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const pageTitle = "Templates";
  const actions = [
    {
      label: "View Tenant Report",
      link: "/tenant/standards/compare?templateId=[GUID]",
      icon: <EyeIcon />,
      color: "info",
      target: "_self",
    },
    {
      label: "Edit Template",
      //when using a link it must always be the full path /identity/administration/users/[id] for example.
      link: "/tenant/standards/template?id=[GUID]&type=[type]",
      icon: <Edit />,
      color: "success",
      target: "_self",
    },
    {
      label: "Clone & Edit Template",
      link: "/tenant/standards/template?id=[GUID]&clone=true",
      icon: <CopyAll />,
      color: "success",
      target: "_self",
    },
    {
      label: "Run Template Now (Currently Selected Tenant only)",
      type: "GET",
      url: "/api/ExecStandardsRun",
      icon: <PlayArrow />,
      data: {
        TemplateId: "GUID",
      },
      confirmText: "Are you sure you want to force a run of this template?",
      multiPost: false,
    },
    {
      label: "Run Template Now (All Tenants in Template)",
      type: "GET",
      url: "/api/ExecStandardsRun",
      icon: <PlayArrow />,
      data: {
        TemplateId: "GUID",
        tenantFilter: "allTenants",
      },
      confirmText: "Are you sure you want to force a run of this template?",
      multiPost: false,
    },
    {
      label: "Save to GitHub",
      type: "POST",
      url: "/api/ExecCommunityRepo",
      icon: <GitHub />,
      data: {
        Action: "UploadTemplate",
        GUID: "GUID",
      },
      fields: [
        {
          label: "Repository",
          name: "FullName",
          type: "select",
          api: {
            url: "/api/ListCommunityRepos",
            data: {
              WriteAccess: true,
            },
            queryKey: "CommunityRepos-Write",
            dataKey: "Results",
            valueField: "FullName",
            labelField: "FullName",
          },
          multiple: false,
          creatable: false,
          required: true,
          validators: {
            required: { value: true, message: "This field is required" },
          },
        },
        {
          label: "Commit Message",
          placeholder: "Enter a commit message for adding this file to GitHub",
          name: "Message",
          type: "textField",
          multiline: true,
          required: true,
          rows: 4,
        },
      ],
      confirmText: "Are you sure you want to save this template to the selected repository?",
      condition: () => integrations.isSuccess && integrations?.data?.GitHub?.Enabled,
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveStandardTemplate",
      icon: <Delete />,
      data: {
        ID: "GUID",
      },
      confirmText: "Are you sure you want to delete [templateName]?",
      multiPost: false,
    },
  ];
  const conversionApi = ApiPostCall({ relatedQueryKeys: "listStandardTemplates" });
  const handleConversion = () => {
    conversionApi.mutate({
      url: "/api/execStandardConvert",
      data: {},
    });
  };
  const tableFilter = (
    <div>
      {oldStandards.isSuccess && oldStandards.data.length !== 0 && (
        <Grid container spacing={2}>
          <Grid container spacing={2}>
            <Alert
              severity="warning"
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <Grid size={12}>
                You have legacy standards available. Press the button to convert these standards to
                the new format. This will create a new template for each standard you had, but will
                disable the schedule. After conversion, please check the new templates to ensure
                they are correct and re-enable the schedule.
              </Grid>
              <Grid size={2}>
                <Button onClick={() => handleConversion()} variant={"contained"}>
                  Convert Legacy Standards
                </Button>
              </Grid>
            </Alert>
          </Grid>
          <Grid size={8}>
            <CippApiResults apiObject={conversionApi} />
          </Grid>
        </Grid>
      )}
    </div>
  );
  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/listStandardTemplates"
      tenantInTitle={false}
      cardButton={
        <>
          <Button component={Link} href="../template" startIcon={<AddBox />} sx={{ mr: 1 }}>
            Add Template
          </Button>
          <Button component={Link} href="../template?type=drift" startIcon={<AddBox />}>
            Create Drift Template
          </Button>
        </>
      }
      actions={actions}
      tableFilter={tableFilter}
      simpleColumns={[
        "templateName",
        "type",
        "tenantFilter",
        "excludedTenants",
        "updatedAt",
        "updatedBy",
        "runManually",
        "standards",
      ]}
      queryKey="listStandardTemplates"
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
