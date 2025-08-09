import { useState, useEffect } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog.jsx";
import { Button, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Grid } from "@mui/system";
import { Add, ManageSearch } from "@mui/icons-material";
import { useDialog } from "/src/hooks/use-dialog";
import tabOptions from "./tabOptions.json";
import { useSettings } from "/src/hooks/use-settings";

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
    label: "Process Logs",
    url: "/api/ExecAuditLogSearch",
    confirmText:
      "Process these logs? Note: This will only alert on logs that match your Alert Configuration rules.",
    type: "POST",
    data: {
      Action: "ProcessLogs",
      SearchId: "id",
    },
    icon: <ManageSearch />,
  },
];

const Page = () => {
  const createSearchDialog = useDialog();
  const currentTenant = useSettings().currentTenant;

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
      type: "textField",
      name: "DisplayName",
      label: "Search Name",
    },
    {
      type: "autoComplete",
      name: "TenantFilter",
      label: "Tenant",
      multiple: false,
      creatable: false,
      api: {
        url: "/api/ListTenants?AllTenantSelector=false",
        labelField: (option) => `${option.displayName} (${option.defaultDomainName})`,
        valueField: "defaultDomainName",
        queryKey: "ListTenants-FormnotAllTenants",
        excludeTenantFilter: true,
      },
      validators: { validate: (value) => !!value?.value || "Please select a tenant" },
      required: true,
    },
    {
      type: "datePicker",
      name: "StartTime",
      label: "Start Date & Time",
      dateTimeType: "datetime-local",
      validators: { required: "Start time is required" },
      required: true,
    },
    {
      type: "datePicker",
      name: "EndTime",
      label: "End Date & Time",
      dateTimeType: "datetime-local",
      validators: { required: "End time is required" },
      required: true,
    },
    {
      type: "autoComplete",
      name: "ServiceFilters",
      label: "Services",
      multiple: true,
      creatable: false,
      options: [
        { label: "Azure Active Directory", value: "AzureActiveDirectory" },
        { label: "Dynamics 365", value: "CRM" },
        { label: "Exchange Online", value: "Exchange" },
        { label: "Microsoft Flow", value: "MicrosoftFlow" },
        { label: "Microsoft Teams", value: "MicrosoftTeams" },
        { label: "OneDrive for Business", value: "OneDrive" },
        { label: "Power BI", value: "PowerBI" },
        { label: "Security & Compliance", value: "ThreatIntelligence" },
        { label: "SharePoint Online", value: "SharePoint" },
        { label: "Yammer", value: "Yammer" },
      ],
      validators: {
        validate: (values) => values?.length > 0 || "Please select at least one service",
      },
    },
    {
      type: "autoComplete",
      name: "RecordTypeFilters",
      label: "Record Types",
      multiple: true,
      creatable: false,
      options: [
        { label: "Azure Active Directory", value: "azureActiveDirectory" },
        { label: "Azure AD Account Logon", value: "azureActiveDirectoryAccountLogon" },
        { label: "Azure AD STS Logon", value: "azureActiveDirectoryStsLogon" },
        { label: "Compliance DLP Endpoint", value: "complianceDLPEndpoint" },
        { label: "Compliance DLP Exchange", value: "complianceDLPExchange" },
        { label: "Compliance DLP SharePoint", value: "complianceDLPSharePoint" },
        { label: "Data Governance", value: "dataGovernance" },
        { label: "Exchange Admin", value: "exchangeAdmin" },
        { label: "Exchange Item", value: "exchangeItem" },
        { label: "Exchange Item Group", value: "exchangeItemGroup" },
        { label: "Information Worker Protection", value: "informationWorkerProtection" },
        { label: "Label Content Explorer", value: "labelContentExplorer" },
        { label: "Microsoft Flow", value: "microsoftFlow" },
        { label: "Microsoft Forms", value: "microsoftForms" },
        { label: "Microsoft Stream", value: "microsoftStream" },
        { label: "Microsoft Teams", value: "microsoftTeams" },
        { label: "Microsoft Teams Admin", value: "microsoftTeamsAdmin" },
        { label: "Microsoft Teams Analytics", value: "microsoftTeamsAnalytics" },
        { label: "Microsoft Teams Device", value: "microsoftTeamsDevice" },
        { label: "Microsoft Teams Shifts", value: "microsoftTeamsShifts" },
        { label: "MIP Label", value: "mipLabel" },
        { label: "OneDrive", value: "oneDrive" },
        { label: "Power Apps App", value: "powerAppsApp" },
        { label: "Power Apps Plan", value: "powerAppsPlan" },
        { label: "Power BI Audit", value: "powerBIAudit" },
        { label: "Power BI DLP", value: "powerBIDlp" },
        { label: "Security & Compliance Alerts", value: "securityComplianceAlerts" },
        { label: "Security & Compliance Insights", value: "securityComplianceInsights" },
        { label: "Security & Compliance RBAC", value: "securityComplianceRBAC" },
        { label: "SharePoint", value: "sharePoint" },
        { label: "SharePoint File Operation", value: "sharePointFileOperation" },
        { label: "SharePoint List Operation", value: "sharePointListOperation" },
        { label: "SharePoint Sharing Operation", value: "sharePointSharingOperation" },
        { label: "Threat Intelligence", value: "threatIntelligence" },
        { label: "Threat Intelligence ATP Content", value: "threatIntelligenceAtpContent" },
        { label: "Threat Intelligence URL", value: "threatIntelligenceUrl" },
        { label: "Workplace Analytics", value: "workplaceAnalytics" },
      ],
    },
    {
      type: "autoComplete",
      name: "KeywordFilter",
      label: "Keywords",
      multiple: true,
      creatable: true,
      freeSolo: true,
      placeholder: "Enter keywords to search for",
      options: [],
    },
    {
      type: "autoComplete",
      name: "OperationsFilters",
      label: "Operations",
      multiple: true,
      creatable: true,
      placeholder: "Enter or select operations",
      options: [
        // Authentication & User Operations
        { label: "User Logged In", value: "UserLoggedIn" },
        { label: "Mailbox Login", value: "mailboxlogin" },

        // User Management Operations
        { label: "Add User", value: "add user." },
        { label: "Update User", value: "update user." },
        { label: "Delete User", value: "delete user." },
        { label: "Reset User Password", value: "reset user password." },
        { label: "Change User Password", value: "change user password." },
        { label: "Change User License", value: "change user license." },

        // Group Management Operations
        { label: "Add Group", value: "add group." },
        { label: "Update Group", value: "update group." },
        { label: "Delete Group", value: "delete group." },
        { label: "Add Member to Group", value: "add member to group." },
        { label: "Remove Member from Group", value: "remove member from group." },

        // Mailbox Operations
        { label: "New Mailbox", value: "New-Mailbox" },
        { label: "Set Mailbox", value: "Set-Mailbox" },
        { label: "Add Mailbox Permission", value: "add-mailboxpermission" },
        { label: "Remove Mailbox Permission", value: "remove-mailboxpermission" },
        { label: "Mail Items Accessed", value: "mailitemsaccessed" },

        // Email Operations
        { label: "Send Message", value: "send" },
        { label: "Send As", value: "sendas" },
        { label: "Send On Behalf", value: "sendonbehalf" },
        { label: "Create Item", value: "create" },
        { label: "Update Message", value: "update" },
        { label: "Copy Messages", value: "copy" },
        { label: "Move Messages", value: "move" },
        { label: "Move to Deleted Items", value: "movetodeleteditems" },
        { label: "Soft Delete", value: "softdelete" },
        { label: "Hard Delete", value: "harddelete" },

        // Inbox Rules
        { label: "New Inbox Rule", value: "new-inboxrule" },
        { label: "Set Inbox Rule", value: "set-inboxrule" },
        { label: "Update Inbox Rules", value: "updateinboxrules" },

        // Folder Operations
        { label: "Add Folder Permissions", value: "addfolderpermissions" },
        { label: "Remove Folder Permissions", value: "removefolderpermissions" },
        { label: "Update Folder Permissions", value: "updatefolderpermissions" },
        { label: "Update Calendar Delegation", value: "updatecalendardelegation" },

        // SharePoint/OneDrive Operations (Common ones)
        { label: "File Accessed", value: "FileAccessed" },
        { label: "File Modified", value: "FileModified" },
        { label: "File Deleted", value: "FileDeleted" },
        { label: "File Downloaded", value: "FileDownloaded" },
        { label: "File Uploaded", value: "FileUploaded" },
        { label: "Sharing Set", value: "SharingSet" },
        { label: "Anonymous Link Created", value: "AnonymousLinkCreated" },

        // Role and Permission Operations
        { label: "Add Member to Role", value: "add member to role." },
        { label: "Remove Member from Role", value: "remove member from role." },
        { label: "Add Service Principal", value: "add service principal." },
        { label: "Remove Service Principal", value: "remove service principal." },

        // Company and Domain Operations
        { label: "Add Domain to Company", value: "add domain to company." },
        { label: "Remove Domain from Company", value: "remove domain from company." },
        { label: "Verify Domain", value: "verify domain." },
        { label: "Set Company Information", value: "set company information." },

        // Security Operations
        { label: "Disable Strong Authentication", value: "Disable Strong Authentication." },
        { label: "Apply Record Label", value: "applyrecordlabel" },
        { label: "Update STS Refresh Token", value: "Update StsRefreshTokenValidFrom Timestamp." },
      ],
    },
    {
      type: "autoComplete",
      name: "UserPrincipalNameFilters",
      label: "User Principal Names",
      multiple: true,
      creatable: true,
      freeSolo: true,
      placeholder: "Enter user principal names",
      options: [],
    },
    {
      type: "autoComplete",
      name: "IPAddressFilters",
      label: "IP Addresses",
      multiple: true,
      creatable: true,
      freeSolo: true,
      placeholder: "Enter IP addresses",
      options: [],
    },
    {
      type: "autoComplete",
      name: "ObjectIdFilters",
      label: "Object IDs",
      multiple: true,
      creatable: true,
      freeSolo: true,
      placeholder: "Enter object IDs",
      options: [],
    },
    {
      type: "autoComplete",
      name: "AdministrativeUnitFilters",
      label: "Administrative Units",
      multiple: true,
      creatable: true,
      placeholder: "Enter administrative units",
      api: {
        url: "/api/ListGraphRequest",
        queryKey: "AdministrativeUnits",
        data: {
          Endpoint: "directoryObjects/microsoft.graph.administrativeUnit",
          $select: "id,displayName",
        },
        dataKey: "Results",
        labelField: "displayName",
        valueField: "id",
        addedField: {
          id: "id",
          displayName: "displayName",
        },
        showRefresh: true,
      },
    },
    {
      type: "switch",
      name: "ProcessLogs",
      label: "Process Logs for Alerts",
      helperText: "Enable to store this search for alert processing",
    },
  ];

  const createSearchApi = {
    type: "POST",
    url: "/api/ExecAuditLogSearch",
    confirmText:
      "Create this audit log search? This may take several minutes to hours to complete.",
    relatedQueryKeys: ["AuditLogSearches"],
    allowResubmit: true,
    customDataformatter: (row, action, data) => {
      const formattedData = { ...data };
      console.log("Formatted Data:", formattedData);
      // Extract value from TenantFilter autocomplete object
      if (formattedData.TenantFilter?.value) {
        formattedData.TenantFilter = formattedData.TenantFilter.value;
      }

      // Handle KeywordFilter - extract values from array and join with spaces
      if (Array.isArray(formattedData.KeywordFilter)) {
        const keywords = formattedData.KeywordFilter.map((item) =>
          typeof item === "object" ? item.value : item
        ).filter(Boolean);
        formattedData.KeywordFilter = keywords.join(" ");
      }

      // Extract values from RecordTypeFilters array
      if (Array.isArray(formattedData.RecordTypeFilters)) {
        formattedData.RecordTypeFilters = formattedData.RecordTypeFilters.map((item) =>
          typeof item === "object" ? item.value : item
        );
      }

      // Extract values from ServiceFilters array
      if (Array.isArray(formattedData.ServiceFilters)) {
        formattedData.ServiceFilters = formattedData.ServiceFilters.map((item) =>
          typeof item === "object" ? item.value : item
        );
      }

      // Extract values from OperationsFilters array
      if (Array.isArray(formattedData.OperationsFilters)) {
        formattedData.OperationsFilters = formattedData.OperationsFilters.map((item) =>
          typeof item === "object" ? item.value : item
        );
      }

      // Extract values from UserPrincipalNameFilters array
      if (Array.isArray(formattedData.UserPrincipalNameFilters)) {
        formattedData.UserPrincipalNameFilters = formattedData.UserPrincipalNameFilters.map(
          (item) => (typeof item === "object" ? item.value : item)
        );
      }

      // Extract values from IPAddressFilters array
      if (Array.isArray(formattedData.IPAddressFilters)) {
        formattedData.IPAddressFilters = formattedData.IPAddressFilters.map((item) =>
          typeof item === "object" ? item.value : item
        );
      }

      // Extract values from ObjectIdFilters array
      if (Array.isArray(formattedData.ObjectIdFilters)) {
        formattedData.ObjectIdFilters = formattedData.ObjectIdFilters.map((item) =>
          typeof item === "object" ? item.value : item
        );
      }

      // Extract values from AdministrativeUnitFilters array
      if (Array.isArray(formattedData.AdministrativeUnitFilters)) {
        formattedData.AdministrativeUnitFilters = formattedData.AdministrativeUnitFilters.map(
          (item) => (typeof item === "object" ? item.value : item)
        );
      }

      // Remove empty arrays to avoid sending unnecessary data
      Object.keys(formattedData).forEach((key) => {
        if (Array.isArray(formattedData[key]) && formattedData[key].length === 0) {
          delete formattedData[key];
        }
        if (
          formattedData[key] === "" ||
          formattedData[key] === null ||
          formattedData[key] === undefined
        ) {
          delete formattedData[key];
        }
      });

      return formattedData;
    },
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
        queryKey={`AuditLogSearches-${filterControl.getValues().StatusFilter?.value || "All"}-${
          filterControl.getValues().DateFilter?.value || "AllTime"
        }-${currentTenant}`}
        actions={actions}
        cardButton={
          <Button onClick={() => createSearchDialog.handleOpen()} startIcon={<Add />}>
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
