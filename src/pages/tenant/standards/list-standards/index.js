import { Alert, Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/24/outline";
import { CopyAll, Delete, PlayArrow } from "@mui/icons-material";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import { Grid } from "@mui/system";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";

const Page = () => {
  const oldStandards = ApiGetCall({ url: "/api/ListStandards", queryKey: "ListStandards-legacy" });

  const pageTitle = "Standard Templates";
  const actions = [
    {
      label: "Edit Template",
      //when using a link it must always be the full path /identity/administration/users/[id] for example.
      link: "/tenant/standards/template?id=[GUID]",
      icon: <EyeIcon />,
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
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveStandardTemplate",
      icon: <Delete />,
      data: {
        ID: "GUID",
      },
      confirmText: "Are you sure you want to delete this template?",
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
          <Grid container item spacing={2}>
            <Alert
              severity="warning"
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <Grid item size={12}>
                You have legacy standards available. Press the button to convert these standards to
                the new format. This will create a new template for each standard you had, but will
                disable the schedule. After conversion, please check the new templates to ensure
                they are correct and re-enable the schedule.
              </Grid>
              <Grid item size={2}>
                <Button onClick={() => handleConversion()} variant={"contained"}>
                  Convert Legacy Standards
                </Button>
              </Grid>
            </Alert>
          </Grid>
          <Grid item size={8}>
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
        <Button component={Link} href="template">
          Add Template
        </Button>
      }
      actions={actions}
      tableFilter={tableFilter}
      simpleColumns={[
        "templateName",
        "tenantFilter",
        "excludedTenants",
        "updatedAt",
        "updatedBy",
        "runManually",
      ]}
      queryKey="listStandardTemplates"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
