import { useState, useEffect } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import {
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";

const simpleColumns = [
  "Tenant",
  "CippStatus",
  "appDisplayName",
  "requestUser",
  "requestReason",
  "requestStatus",
  "requestDate",
];

const apiUrl = "/api/ListAppConsentRequests";
const pageTitle = "App Consent Requests";

const Page = () => {
  const formControl = useForm({
    defaultValues: {
      requestStatus: "All",
    },
  });

  const [expanded, setExpanded] = useState(false); // Accordion state
  const [filterParams, setFilterParams] = useState({}); // Dynamic filter params

  const onSubmit = (data) => {
    // Handle filter application logic
    const { requestStatus } = data;
    const filters = {};

    if (requestStatus !== "All") {
      filters.requestStatus = requestStatus;
    }

    setFilterParams(filters);
  };

  return (
    <CippTablePage
      tableFilter={
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form onSubmit={formControl.handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                {/* Request Status Filter */}
                <Grid item xs={12}>
                  <CippFormComponent
                    type="autoComplete"
                    name="requestStatus"
                    multiple={false}
                    label="Request Status"
                    options={[
                      { label: "All", value: "All" },
                      { label: "Pending", value: "InProgress" },
                      { label: "Expired", value: "Expired" },
                      { label: "Completed", value: "Completed" },
                    ]}
                    formControl={formControl}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Apply Filters
                  </Button>
                </Grid>
              </Grid>
            </form>
          </AccordionDetails>
        </Accordion>
      }
      title={pageTitle}
      apiUrl={apiUrl}
      simpleColumns={simpleColumns}
      queryKey={`AppConsentRequests-${JSON.stringify(filterParams)}`}
      apiData={{
        ...filterParams,
      }}
      offCanvas={{
        extendedInfoFields: [
          "requestUser", // Requester
          "appDisplayName", // Application Name
          "appId", // Application ID
          "requestReason", // Reason
          "requestStatus", // Status
          "reviewedBy", // Reviewed by
          "reviewedJustification", // Reviewed Reason
        ],
        actions: [
          {
            label: "Review in Entra",
            link: `https://entra.microsoft.com/[TenantFilter]/#view/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/~/AccessRequests`,
            color: "info",
            target: "_blank",
            external: true,
          },
          {
            label: "Approve in Entra",
            link: "[consentUrl]",
            color: "info",
            target: "_blank",
            external: true,
          },
        ],
      }}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
