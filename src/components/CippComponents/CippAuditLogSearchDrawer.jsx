import { useState, useEffect, useCallback } from "react";
import { CippIcons } from "../../utils/icon-registry"
import { Button, Stack, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { CippOffCanvas } from "./CippOffCanvas";
import { ApiPostCall, ApiGetCall } from "../../api/ApiCall";
import CippFormComponent from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";

const recordTypeOptions = [
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
];

const operationOptions = [
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
];

const toUnixSeconds = (value) => {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
};

const toOptionList = (values, optionList = []) =>
  (Array.isArray(values) ? values : []).filter(Boolean).map((value) => {
    const known = optionList.find((option) => option.value === value);
    return known ?? { label: value, value };
  });

// Keep array defaults for all multi-select fields to avoid Autocomplete receiving undefined.
const baseDefaultValues = {
  RecordTypeFilters: [],
  KeywordFilters: [],
  OperationsFilters: [],
  UserPrincipalNameFilters: [],
  IPAddressFilters: [],
  ObjectIdFilters: [],
  AdministrativeUnitFilters: [],
  ProcessLogs: false,
};

// Maps a Graph security/auditLog/queries object (what the manual-searches table lists) back onto
// the form, so an existing search can be reopened with every filter it was created with.
const mapSearchToFormValues = (search) => ({
  DisplayName: search.displayName ? `${search.displayName} - Copy` : "",
  StartTime: toUnixSeconds(search.filterStartDateTime),
  EndTime: toUnixSeconds(search.filterEndDateTime),
  RecordTypeFilters: toOptionList(search.recordTypeFilters, recordTypeOptions),
  KeywordFilters: toOptionList(
    typeof search.keywordFilter === "string" ? search.keywordFilter.split(/\s+/) : []
  ),
  OperationsFilters: toOptionList(search.operationFilters, operationOptions),
  UserPrincipalNameFilters: toOptionList(search.userPrincipalNameFilters),
  IPAddressFilters: toOptionList(search.ipAddressFilters),
  ObjectIdFilters: toOptionList(search.objectIdFilters),
  AdministrativeUnitFilters: toOptionList(search.administrativeUnitIdFilters),
  ProcessLogs: false,
});

export const CippAuditLogSearchDrawer = ({
  buttonText = "New Search",
  relatedQueryKeys = ["AuditLogSearches"],
  copySource = null,
  onClose,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const currentTenantDomain = useSettings().currentTenant;
  const isCopy = !!copySource;

  // Fetch tenant list to get full tenant details.
  const tenantList = ApiGetCall({
    url: "/api/ListTenants",
    queryKey: "ListTenants-FormnotAllTenants",
    data: { AllTenantSelector: false },
  });

  // Find the current tenant from the list using the domain name
  const allTenants = Array.isArray(tenantList.data) ? tenantList.data : [];
  const currentTenant = allTenants.find(
    (tenant) => tenant.defaultDomainName === currentTenantDomain
  );

  // Values for a fresh form, or for a copy of an existing search. The tenant is always the one
  // currently selected: the Graph query object does not carry it, and the table is tenant-scoped.
  const buildFormValues = useCallback(
    (source) => ({
      ...baseDefaultValues,
      ...(source ? mapSearchToFormValues(source) : {}),
      TenantFilter: currentTenant
        ? {
            label: `${currentTenant.displayName} (${currentTenant.defaultDomainName})`,
            value: currentTenant.defaultDomainName,
          }
        : null,
    }),
    [currentTenant]
  );

  const formControl = useForm({
    defaultValues: buildFormValues(copySource),
  });

  // Re-seed the form when the tenant list resolves or when a search is handed in to copy.
  useEffect(() => {
    formControl.reset(buildFormValues(copySource));
    if (copySource) {
      setDrawerVisible(true);
    }
  }, [buildFormValues, copySource, formControl]);

  const createSearchApi = ApiPostCall({
    datafromUrl: false,
    relatedQueryKeys,
  });

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset(buildFormValues(null));
    createSearchApi.reset();
    onClose?.();
  };

  const handleCreateSearch = async (data) => {
    const formattedData = { ...data };

    // Extract value from TenantFilter autocomplete object
    if (formattedData.TenantFilter?.value) {
      formattedData.TenantFilter = formattedData.TenantFilter.value;
    }

    // Handle KeywordFilters - extract values from array and join with spaces
    if (Array.isArray(formattedData.KeywordFilters)) {
      const keywords = formattedData.KeywordFilters.map((item) =>
        typeof item === "object" ? item.value : item
      ).filter(Boolean);
      formattedData.KeywordFilters = keywords.join(" ");
    }

    // Extract values from RecordTypeFilters array
    if (Array.isArray(formattedData.RecordTypeFilters)) {
      formattedData.RecordTypeFilters = formattedData.RecordTypeFilters.map((item) =>
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
      formattedData.UserPrincipalNameFilters = formattedData.UserPrincipalNameFilters.map((item) =>
        typeof item === "object" ? item.value : item
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

    try {
      await createSearchApi.mutateAsync({
        url: "/api/ExecAuditLogSearch",
        data: formattedData,
      });
    } catch (error) {
      console.error("Error creating search:", error);
    }
  };

  // Create Search Form Fields
  const createSearchFields = [
    {
      type: "textField",
      name: "DisplayName",
      label: "Search Name",
      required: true,
      validators: { required: "Search name is required" },
      disableVariables: true,
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
        queryKey: "ListTenants-AuditDrawer",
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
      name: "RecordTypeFilters",
      label: "Record Types",
      multiple: true,
      creatable: false,
      options: recordTypeOptions,
    },
    {
      type: "autoComplete",
      name: "KeywordFilters",
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
      options: operationOptions,
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

  return (
    <>
      <Button onClick={() => setDrawerVisible(true)} startIcon={<CippIcons.Add />}>
        {buttonText}
      </Button>
      <CippOffCanvas
        title={isCopy ? "Copy Audit Log Search" : "Create New Audit Log Search"}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={createSearchApi} />
            <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
              <Button
                variant="contained"
                onClick={formControl.handleSubmit(handleCreateSearch)}
                disabled={createSearchApi.isPending}
              >
                {createSearchApi.isPending ? "Creating..." : "Create Search"}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        }
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
            {createSearchFields.map((field, index) => (
              <Box key={field.name} sx={{ mb: 3 }}>
                <CippFormComponent {...field} formControl={formControl} />
              </Box>
            ))}
          </Box>
        </Box>
      </CippOffCanvas>
    </>
  );
};
