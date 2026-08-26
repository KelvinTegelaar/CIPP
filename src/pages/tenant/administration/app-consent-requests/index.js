import { useState } from "react";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import {
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  SvgIcon,
  Stack,
} from "@mui/material";
import { Grid } from "@mui/system";
import { Visibility, CheckCircle, ExpandMore, Security } from "@mui/icons-material";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { useSettings } from "../../../../hooks/use-settings";

const apiUrl = "/api/ListAppConsentRequests";
const pageTitle = "App Consent Requests";

const Page = () => {
  const tenantFilter = useSettings().currentTenant;
  const formControl = useForm({
    defaultValues: {
      requestStatus: "InProgress",
    },
  });

  const [expanded, setExpanded] = useState(true); // Accordion state - start expanded since we have a default filter
  const [filterEnabled, setFilterEnabled] = useState(true); // State for filter toggle - start with filter enabled
  const [requestStatus, setRequestStatus] = useState("InProgress"); // State for request status filter - default to InProgress
  const [requestStatusLabel, setRequestStatusLabel] = useState("Pending"); // State for displaying filter label - default label

  const onSubmit = (data) => {
    // Handle the case where requestStatus could be an object {label, value} or a string
    const statusValue =
      typeof data.requestStatus === "object" && data.requestStatus?.value
        ? data.requestStatus.value
        : data.requestStatus;
    const statusLabel =
      typeof data.requestStatus === "object" && data.requestStatus?.label
        ? data.requestStatus.label
        : data.requestStatus;

    // Check if any filter is applied
    const hasFilter = statusValue !== "All";
    setFilterEnabled(hasFilter);

    // Set request status filter if not "All"
    setRequestStatus(hasFilter ? statusValue : null);
    setRequestStatusLabel(hasFilter ? statusLabel : null);

    // Close the accordion after applying filters
    setExpanded(false);
  };

  const clearFilters = () => {
    formControl.reset({
      requestStatus: "All",
    });
    setFilterEnabled(false);
    setRequestStatus(null);
    setRequestStatusLabel(null);
    setExpanded(false); // Close the accordion when clearing filters
  };

  const actions = [
    {
      label: "Review in Entra",
      link: `https://entra.microsoft.com/${tenantFilter}/#view/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/~/AccessRequests`,
      color: "info",
      icon: <Visibility />,
      target: "_blank",
      external: true,
    },
    {
      label: "Approve in Entra",
      link: "[consentUrl]",
      color: "info",
      icon: <CheckCircle />,
      target: "_blank",
      external: true,
    },
  ];

  const simpleColumns = [
    "requestDate", // Request Date
    "requestUser", // Requester
    "appDisplayName", // Application Name
    "appId", // Application ID
    "requestReason", // Reason
    "requestStatus", // Status
    "reviewedBy", // Reviewed by
    "reviewedJustification", // Reviewed Reason
    "consentUrl", // Consent URL
  ];

  const filters = [
    {
      filterName: "Pending requests",
      value: [{ id: "requestStatus", value: "InProgress" }],
      type: "column",
    },
    {
      filterName: "Expired requests",
      value: [{ id: "requestStatus", value: "Expired" }],
      type: "column",
    },
    {
      filterName: "Completed requests",
      value: [{ id: "requestStatus", value: "Completed" }],
      type: "column",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "requestDate", // Request Date
      "requestUser", // Requester
      "appDisplayName", // Application Name
      "appId", // Application ID
      "requestReason", // Reason
      "requestStatus", // Status
      "reviewedBy", // Reviewed by
      "reviewedJustification", // Reviewed Reason
      "consentUrl", // Consent URL
    ],
    actions: actions,
  };

  return (
    <CippTablePage
      tableFilter={
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SvgIcon>
                <FunnelIcon />
              </SvgIcon>
              <Typography variant="h6">
                App Consent Request Filters
                {filterEnabled ? (
                  <span style={{ fontSize: "0.8em", marginLeft: "10px", fontWeight: "normal" }}>
                    ({requestStatusLabel && <>Status: {requestStatusLabel}</>})
                  </span>
                ) : (
                  <span style={{ fontSize: "0.8em", marginLeft: "10px", fontWeight: "normal" }}>
                    (No filters applied)
                  </span>
                )}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <form onSubmit={formControl.handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                {/* Request Status Filter */}
                <Grid size={{ xs: 12 }}>
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

                {/* Action Buttons */}
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={
                        <SvgIcon>
                          <FunnelIcon />
                        </SvgIcon>
                      }
                    >
                      Apply Filters
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={
                        <SvgIcon>
                          <XMarkIcon />
                        </SvgIcon>
                      }
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </AccordionDetails>
        </Accordion>
      }
      title={pageTitle}
      apiUrl={apiUrl}
      simpleColumns={simpleColumns}
      filters={filters}
      queryKey={`AppConsentRequests-${requestStatus}-${filterEnabled}-${tenantFilter}`}
      apiData={{
        RequestStatus: requestStatus, // Pass request status filter from state
        Filter: filterEnabled, // Pass filter toggle state
      }}
      offCanvas={offCanvas}
      actions={actions}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
