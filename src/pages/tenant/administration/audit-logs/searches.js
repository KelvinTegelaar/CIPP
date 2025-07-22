import { useState, useEffect } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog.jsx";
import { Button, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { EyeIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Grid } from "@mui/system";
import { Add } from "@mui/icons-material";
import { useDialog } from "/src/hooks/use-dialog";
import tabOptions from "./tabOptions.json";

const simpleColumns = ["displayName", "status", "filterStartDateTime", "filterEndDateTime"];

const apiUrl = "/api/ListAuditLogSearches?Type=Searches";
const pageTitle = "Log Searches";

const actions = [
  {
    label: "View Results",
    link: "/tenant/administration/audit-logs/search-results?id=[id]&name=[displayName]",
    color: "primary",
    icon: <EyeIcon />,
  },
  {
    label: "Delete Search",
    type: "POST",
    url: "/api/ExecAuditLogSearch",
    data: {
      Action: "Delete",
      SearchId: "Id",
    },
    confirmText: "Are you sure you want to delete this audit log search?",
    color: "danger",
    icon: <TrashIcon />,
  },
];

const Page = () => {
  const createSearchDialog = useDialog();

  const filterControl = useForm({
    mode: "onChange",
    defaultValues: {
      StatusFilter: { label: "All", value: "" },
      DateFilter: { label: "All Time", value: "" },
    },
  });

  const [expanded, setExpanded] = useState(false);
  const [apiUrlWithFilters, setApiUrlWithFilters] = useState(apiUrl);

  // Watch for filter changes and update API URL
  const statusFilter = filterControl.watch("StatusFilter");
  const dateFilter = filterControl.watch("DateFilter");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("Type", "Searches"); // Always set Type=Searches for this page

    if (statusFilter?.value) {
      params.set("Status", statusFilter.value);
    }

    if (dateFilter?.value) {
      params.set("Days", dateFilter.value);
    }

    setApiUrlWithFilters(`/api/ListAuditLogSearches?${params.toString()}`);
  }, [statusFilter, dateFilter]);

  // Create Search Dialog Configuration
  const createSearchFields = [
    {
      type: "autoComplete",
      name: "TenantFilter",
      label: "Tenant",
      multiple: false,
      api: {
        url: "/api/ListTenants?AllTenantSelector=false",
        dataKey: "Results",
        labelField: "displayName",
        valueField: "defaultDomainName",
      },
      validators: { required: "Please select a tenant" },
    },
    {
      type: "datePicker",
      name: "StartTime",
      label: "Start Date & Time",
      dateTimeType: "datetime-local",
      validators: { required: "Start time is required" },
    },
    {
      type: "datePicker",
      name: "EndTime",
      label: "End Date & Time",
      dateTimeType: "datetime-local",
      validators: { required: "End time is required" },
    },
    {
      type: "autoComplete",
      name: "RecordTypeFilters",
      label: "Record Types",
      multiple: true,
      options: [
        { label: "Exchange Admin", value: "exchangeAdmin" },
        { label: "Exchange Item", value: "exchangeItem" },
        { label: "SharePoint", value: "sharePoint" },
        { label: "OneDrive", value: "oneDrive" },
        { label: "Azure Active Directory", value: "azureActiveDirectory" },
        { label: "Azure AD Account Logon", value: "azureActiveDirectoryAccountLogon" },
        { label: "Microsoft Teams", value: "microsoftTeams" },
        { label: "Microsoft Teams Admin", value: "microsoftTeamsAdmin" },
        { label: "Power BI", value: "powerBIAudit" },
        { label: "Microsoft Flow", value: "microsoftFlow" },
        { label: "Threat Intelligence", value: "threatIntelligence" },
        { label: "Security & Compliance", value: "securityComplianceAlerts" },
      ],
    },
    {
      type: "autoComplete",
      name: "ServiceFilters",
      label: "Services",
      multiple: true,
      options: [
        { label: "Exchange Online", value: "Exchange" },
        { label: "SharePoint Online", value: "SharePoint" },
        { label: "OneDrive for Business", value: "OneDrive" },
        { label: "Azure Active Directory", value: "AzureActiveDirectory" },
        { label: "Microsoft Teams", value: "MicrosoftTeams" },
        { label: "Power BI", value: "PowerBI" },
        { label: "Microsoft Flow", value: "MicrosoftFlow" },
        { label: "Dynamics 365", value: "CRM" },
        { label: "Yammer", value: "Yammer" },
        { label: "Security & Compliance", value: "ThreatIntelligence" },
      ],
    },
    {
      type: "textField",
      name: "KeywordFilters",
      label: "Keywords",
      placeholder: "Enter keywords to search for",
    },
    {
      type: "textField",
      name: "OperationsFilters",
      label: "Operations",
      placeholder: "Enter operations (comma-separated)",
    },
    {
      type: "textField",
      name: "UserPrincipalNameFilters",
      label: "User Principal Names",
      placeholder: "Enter UPNs (comma-separated)",
    },
    {
      type: "textField",
      name: "IPAddressFilters",
      label: "IP Addresses",
      placeholder: "Enter IP addresses (comma-separated)",
    },
    {
      type: "textField",
      name: "ObjectIdFilters",
      label: "Object IDs",
      placeholder: "Enter object IDs (comma-separated)",
    },
    {
      type: "textField",
      name: "AdministrativeUnitFilters",
      label: "Administrative Units",
      placeholder: "Enter administrative units (comma-separated)",
    },
  ];

  const createSearchApi = {
    type: "POST",
    url: "/api/ExecAuditLogSearch",
    confirmText: "Create this audit log search? This may take several minutes to complete.",
    relatedQueryKeys: ["AuditLogSearches"],
  };

  return (
    <>
      <CippTablePage
        tableFilter={
          <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Filter Search List</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Status Filter */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="autoComplete"
                    name="StatusFilter"
                    label="Status"
                    multiple={false}
                    options={[
                      { label: "All", value: "" },
                      { label: "Completed", value: "Completed" },
                      { label: "In Progress", value: "InProgress" },
                      { label: "Failed", value: "Failed" },
                    ]}
                    formControl={filterControl}
                  />
                </Grid>

                {/* Date Range Filter */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="autoComplete"
                    name="DateFilter"
                    label="Date Range"
                    multiple={false}
                    options={[
                      { label: "All Time", value: "" },
                      { label: "Last 24 Hours", value: "1" },
                      { label: "Last 7 Days", value: "7" },
                      { label: "Last 30 Days", value: "30" },
                    ]}
                    formControl={filterControl}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        }
        title={pageTitle}
        apiUrl={apiUrlWithFilters}
        apiDataKey="Results"
        simpleColumns={simpleColumns}
        queryKey="AuditLogSearches"
        actions={actions}
        cardButton={
          <Button
            onClick={() => createSearchDialog.handleOpen()}
            startIcon={<Add />}
            variant="contained"
          >
            New Search
          </Button>
        }
      />

      <CippApiDialog
        createDialog={createSearchDialog}
        title="Create New Audit Log Search"
        fields={createSearchFields}
        api={createSearchApi}
      />
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
