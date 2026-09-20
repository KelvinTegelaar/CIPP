import { Button, Stack, SvgIcon, Menu, MenuItem, ListItemText, Alert } from "@mui/material";
import { CippIcons } from "../../utils/icon-registry"
import { useState, useEffect, useMemo } from "react";
import isEqual from "lodash/isEqual";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { ApiGetCall, ApiGetCallWithPagination, ApiPostCall } from "../../api/ApiCall";
import { CippDataTable } from "../CippTable/CippDataTable";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { CippCopyToClipBoard } from "../CippComponents/CippCopyToClipboard";
import { Box } from "@mui/system";

// IP entries that impose no real restriction; a role with only these (or none) is unrestricted,
// matching the backend collapsing an empty list to "Any".
const ALLOW_ALL_IP_TOKENS = new Set(["", "any", "*", "0.0.0.0", "0.0.0.0/0", "::", "::/0"]);

// Ranges on a role that would actually block traffic. superadmin is IP-exempt at runtime.
const getRestrictiveRoleRanges = (role) => {
  if (!role || String(role.RoleName).toLowerCase() === "superadmin") return [];
  const ranges = Array.isArray(role.IPRange) ? role.IPRange : [];
  return ranges.filter((range) => !ALLOW_ALL_IP_TOKENS.has(String(range).trim().toLowerCase()));
};

// Restrictive entries from a free-form IP-range list (client's own IPRange field or similar).
const getRestrictiveRanges = (ranges) =>
  (Array.isArray(ranges) ? ranges : [])
    .map((r) => String(r?.value ?? r).trim())
    .filter((r) => r && !ALLOW_ALL_IP_TOKENS.has(r.toLowerCase()));

// Dialog warning (advisory, not enforced): MCP connectors call in from the AI provider's cloud IPs,
// so an IP restriction on the client itself OR on its role will most likely block them (403).
const McpRoleIpWarning = ({ formControl }) => {
  const mcpAllowed = useWatch({ control: formControl.control, name: "MCPAllowed" });
  const roleValue = useWatch({ control: formControl.control, name: "Role" });
  const ipRangeValue = useWatch({ control: formControl.control, name: "IPRange" });
  const customRoles = ApiGetCall({ url: "/api/ListCustomRole", queryKey: "CustomRoleList" });

  if (!mcpAllowed) return null;

  const clientRanges = getRestrictiveRanges(ipRangeValue);
  const roleName = roleValue?.value ?? roleValue;
  const role = roleName
    ? (customRoles.data ?? []).find(
        (r) => String(r.RoleName).toLowerCase() === String(roleName).toLowerCase()
      )
    : null;
  const roleRanges = getRestrictiveRoleRanges(role);

  if (clientRanges.length === 0 && roleRanges.length === 0) return null;

  return (
    <Alert severity="warning" sx={{ mt: 1 }}>
      MCP connectors call in from your AI provider's cloud IPs, so IP restrictions on an MCP client
      will most likely block it (403).
      {clientRanges.length > 0 && <> This client's IP range only allows {clientRanges.join(", ")}.</>}
      {roleRanges.length > 0 && (
        <>
          {" "}
          Role <strong>{roleName}</strong> only allows {roleRanges.join(", ")}.
        </>
      )}{" "}
      Consider setting the IP range to <strong>Any</strong> and using a role with no IP restriction.
    </Alert>
  );
};

const CippApiClientManagement = () => {
  const router = useRouter();
  const [openAddClientDialog, setOpenAddClientDialog] = useState(false);
  const [openAddExistingAppDialog, setOpenAddExistingAppDialog] = useState(false);
  const [addClientRetryPayload, setAddClientRetryPayload] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const formControl = useForm({
    mode: "onChange",
  });

  const postCall = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: ["ApiClients", "AzureConfiguration"],
  });

  const azureConfig = ApiGetCall({
    url: "/api/ExecApiClient",
    data: { Action: "GetAzureConfiguration" },
    queryKey: "AzureConfiguration",
  });

  const apiClients = ApiGetCallWithPagination({
    url: "/api/ExecApiClient",
    data: { Action: "List" },
    queryKey: "ApiClients",
  });

  // Shared with the role autoComplete fields below via the queryKey, so this adds no extra call.
  const customRoles = ApiGetCall({
    url: "/api/ListCustomRole",
    queryKey: "CustomRoleList",
  });


  // Authoritative per-client egress (today) from Craft's accounting table. Self-hides (Enabled:false)
  // when accounting is off / not hosted, in which case the column shows "-".
  const egressUsage = ApiGetCall({
    url: "/api/ListApiEgress",
    queryKey: "ApiEgressUsage",
  });

  // Merge the client list with egress so the table can show a per-client "Egress (today)" column.
  // The list is small, so this drives the table from `data` (client-side) rather than the server api.
  const clientRows = useMemo(() => {
    const clients = apiClients.data?.pages?.[0]?.Results || [];
    const usage = egressUsage.data?.Results?.Enabled ? egressUsage.data.Results.Clients || [] : [];
    const byAppId = new Map(usage.map((c) => [String(c.AppId).toLowerCase(), c]));
    const fmtBytes = (b) =>
      b == null
        ? "-"
        : b >= 1073741824
        ? `${(b / 1073741824).toFixed(1)} GB`
        : b >= 1048576
        ? `${(b / 1048576).toFixed(1)} MB`
        : b >= 1024
        ? `${(b / 1024).toFixed(1)} KB`
        : `${b} B`;
    return clients.map((c) => {
      const e = byAppId.get(String(c.ClientId).toLowerCase());
      return { ...c, EgressToday: e ? fmtBytes(e.Bytes) : "-", EgressSheddedToday: e ? e.Shed : 0 };
    });
  }, [apiClients.data, egressUsage.data]);

  // MCP-enabled clients with an IP restriction — on the client's own IP range or on its role. MCP
  // connectors call in from the AI provider's cloud IPs, so either will most likely block them (403).
  const mcpRoleIpWarnings = useMemo(() => {
    if (!apiClients.isSuccess || !customRoles.isSuccess) return [];
    const roles = customRoles.data ?? [];
    const clients = apiClients.data?.pages?.[0]?.Results || [];
    return clients
      .filter((client) => client.MCPAllowed)
      .map((client) => {
        const role = client.Role
          ? roles.find((r) => String(r.RoleName).toLowerCase() === String(client.Role).toLowerCase())
          : null;
        const roleRanges = getRestrictiveRoleRanges(role);
        const clientRanges = getRestrictiveRanges(client.IPRange);
        const ranges = [...new Set([...clientRanges, ...roleRanges])];
        return ranges.length > 0
          ? { appName: client.AppName, role: client.Role, ranges }
          : null;
      })
      .filter(Boolean);
  }, [apiClients.isSuccess, apiClients.data, customRoles.isSuccess, customRoles.data]);

  const hasUnsavedChanges = useMemo(() => {
    if (!azureConfig.isSuccess || !apiClients.isSuccess) return false;
    return !isEqual(
      (apiClients.data?.pages?.[0]?.Results || [])
        .filter((c) => c.Enabled)
        .map((c) => c.ClientId)
        .sort(),
      (azureConfig.data?.Results?.ClientIDs || []).sort()
    );
  }, [azureConfig.isSuccess, azureConfig.data, apiClients.isSuccess, apiClients.data]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handleRouteChange = (url) => {
      if (
        hasUnsavedChanges &&
        !window.confirm(
          "You have unsaved API client changes. Are you sure you want to leave this page?"
        )
      ) {
        router.events.emit("routeChangeError");
        throw "Route change aborted due to unsaved changes.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [hasUnsavedChanges, router.events]);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleSaveToAzure = () => {
    handleMenuClose();
    if (
      !window.confirm(
        "Saving to Azure will restart the CIPP instance. Changes may take up to 60 seconds to reflect. Do you want to continue?"
      )
    ) {
      return;
    }
    postCall.mutate({
      url: `/api/ExecApiClient?action=SaveToAzure`,
      data: {},
    });
  };

  const getRetryPayload = (result) => {
    const firstResult = result?.Results?.[0];
    if (firstResult?.retryAvailable === true) {
      return firstResult.retryPayload;
    }
    return null;
  };

  const mergeApiDataWithRetry = (baseData, retryPayload) => {
    if (!retryPayload) {
      return baseData;
    }

    return {
      ...baseData,
      ...retryPayload,
      CIPPAPI: {
        ...(baseData.CIPPAPI || {}),
        ...(retryPayload.CIPPAPI || {}),
      },
    };
  };

  const handleAddClientAfterEffect = (result) => {
    setAddClientRetryPayload(getRetryPayload(result));
  };

  const actions = [
    {
      label: "Edit",
      icon: (
        <SvgIcon>
          <CippIcons.PencilIcon />
        </SvgIcon>
      ),
      confirmText: "Update the API client settings for [AppName]?",
      hideBulk: true,
      setDefaultValues: true,
      fields: [
        {
          type: "autoComplete",
          name: "Role",
          multiple: false,
          creatable: false,
          label: "Select Role",
          placeholder: "Choose a role from the CIPP Role list.",
          api: {
            url: "/api/ListCustomRole",
            queryKey: "CustomRoleList",
            labelField: "RoleName",
            valueField: "RoleName",
            showRefresh: true,
          },
        },
        {
          type: "autoComplete",
          name: "IPRange",
          multiple: true,
          freeSolo: true,
          creatable: true,
          options: [],
          label: "Enter IP Range (Single hosts or CIDR notation)",
          placeholder: "Type in the IP addresses and hit enter.",
        },
        {
          type: "switch",
          name: "Enabled",
          label: "Enable this client",
        },
        {
          type: "switch",
          name: "MCPAllowed",
          label: "MCP Access Allowed",
        },
        {
          type: "alert",
          name: "mcpAccessWarning",
          severity: "warning",
          label:
            "Enabling MCP Access sets this client up as an MCP connector sign-in app — AI clients (Claude, ChatGPT, Copilot Studio, VS Code) sign in as it, and the shared CIPP-MCP resource app is created automatically. You can enable multiple MCP clients, each with its own role, IP range and Conditional Access. MCP is only supported on CIPP-NG.",
        },
        {
          name: "mcpRoleIpWarning",
          component: McpRoleIpWarning,
        },
      ],
      type: "POST",
      url: "/api/ExecApiClient",
      data: {
        Action: "AddUpdate",
        ClientId: "ClientId",
      },
      relatedQueryKeys: ["ApiClients"],
    },
    {
      label: "Reset Application Secret",
      icon: <CippIcons.Key />,
      confirmText: "Are you sure you want to reset the application secret for [AppName]?",
      type: "POST",
      url: "/api/ExecApiClient",
      data: {
        Action: "ResetSecret",
        ClientId: "ClientId",
      },
      hideBulk: true,
    },
    {
      label: "Copy API Scope",
      icon: <CippIcons.ClipboardDocumentIcon />,
      noConfirm: true,
      customFunction: (row, action, formData) => {
        var scope = `api://${row.ClientId}/.default`;
        navigator.clipboard.writeText(scope);
      },
      hideBulk: true,
    },
    {
      label: "Delete Client",
      icon: <CippIcons.Delete />,
      confirmText: "Are you sure you want to delete [AppName]?",
      type: "POST",
      url: "/api/ExecApiClient",
      data: {
        Action: "Delete",
        ClientId: "ClientId",
      },
      fields: [
        {
          type: "switch",
          name: "RemoveAppReg",
          label: "Remove App Registration",
        },
      ],
      relatedQueryKeys: ["ApiClients"],
      multiPost: false,
    },
  ];

  return (
    <>
      <Stack spacing={1}>
        <CippPropertyListCard
          title="Function Authentication"
          actionButton={
            <>
              <Button
                onClick={handleMenuOpen}
                variant="outlined"
                startIcon={
                  <SvgIcon>
                    <CippIcons.ChevronDownIcon />
                  </SvgIcon>
                }
              >
                Actions
              </Button>
              <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setAddClientRetryPayload(null);
                    setOpenAddClientDialog(true);
                  }}
                >
                  <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                    <CippIcons.Create />
                  </SvgIcon>
                  <ListItemText>Create New Client</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setOpenAddExistingAppDialog(true);
                  }}
                >
                  <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                    <CippIcons.PlusSmallIcon />
                  </SvgIcon>
                  <ListItemText>Add Existing Client</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    azureConfig.refetch();
                    handleMenuClose();
                  }}
                >
                  <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                    <CippIcons.Sync />
                  </SvgIcon>
                  <ListItemText>Refresh Configuration</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleSaveToAzure}>
                  <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                    <CippIcons.Save />
                  </SvgIcon>
                  <ListItemText>Save to Azure</ListItemText>
                </MenuItem>
              </Menu>
            </>
          }
          propertyItems={[
            {
              label: "Microsoft Authentication Enabled",
              value: azureConfig.data?.Results?.Enabled,
            },
            {
              label: "API Url",
              value: azureConfig.data?.Results?.ApiUrl ? (
                <CippCopyToClipBoard type="chip" text={azureConfig.data?.Results?.ApiUrl} />
              ) : (
                "Not Available"
              ),
            },
            {
              label: "Token URL",
              value: azureConfig.data?.Results?.TenantID ? (
                <CippCopyToClipBoard
                  type="chip"
                  text={`https://login.microsoftonline.com/${azureConfig.data?.Results?.TenantID}/oauth2/v2.0/token`}
                />
              ) : (
                "Not Available"
              ),
            },
            {
              label: "Tenant ID",
              value: azureConfig.data?.Results?.TenantID ? (
                <CippCopyToClipBoard type="chip" text={azureConfig.data?.Results?.TenantID} />
              ) : (
                "Not Available"
              ),
            },
          ]}
          layout="dual"
          showDivider={false}
          isFetching={azureConfig.isFetching}
        />
        {azureConfig.isSuccess && apiClients.isSuccess && (
          <>
            {hasUnsavedChanges && (
              <Box sx={{ px: 3 }}>
                <Alert severity="warning">
                  You have unsaved changes. Click Actions &gt; Save Azure Configuration to update
                  the allowed API Clients. If you've just saved your API clients, try refreshing the
                  configuration first.
                </Alert>
              </Box>
            )}
          </>
        )}
        {azureConfig.isSuccess && azureConfig.data?.Results?.Enabled === false && (
          <Box sx={{ px: 3 }}>
            <Alert severity="warning">
              Microsoft Authentication is disabled. Configure API Clients and click Actions &gt;
              Save Azure Configuration.
            </Alert>
          </Box>
        )}
        {mcpRoleIpWarnings.length > 0 && (
          <Box sx={{ px: 3 }}>
            <Alert severity="warning">
              These MCP-enabled clients have an IP restriction (on the client or its role). MCP
              connectors call in from your AI provider's cloud IPs, so this will most likely block
              them (403). Consider setting the IP range to Any and using a role with no IP
              restriction:
              <ul style={{ marginBottom: 0 }}>
                {mcpRoleIpWarnings.map((warning) => (
                  <li key={warning.appName}>
                    <strong>{warning.appName}</strong> — allows only {warning.ranges.join(", ")}
                  </li>
                ))}
              </ul>
            </Alert>
          </Box>
        )}
        <Box sx={{ px: 3 }}>
          <CippApiResults apiObject={postCall} />
        </Box>
        <CippDataTable
          actions={actions}
          title="CIPP-API Clients"
          data={clientRows}
          isFetching={apiClients.isFetching || egressUsage.isFetching}
          refreshFunction={() => {
            apiClients.refetch?.();
            egressUsage.refetch?.();
          }}
          simpleColumns={[
            "Enabled",
            "MCPAllowed",
            "AppName",
            "ClientId",
            "Role",
            "IPRange",
            "EgressToday",
          ]}
          // Distinct from the page's "ApiClients" data query. This table is fed the merged
          // clientRows via the `data` prop, but CippDataTable still spins up an internal
          // ApiGetCallWithPagination keyed on this queryKey. ApiGetCall(WithPagination) keys
          // react-query on [queryKey] alone (no url), so reusing "ApiClients" here made the
          // internal query (url undefined) share the page query's cache entry and, being the
          // last-rendered observer, hijack its queryFn — on invalidation the list refetched to
          // empty ("No records") until a manual refresh. A separate key avoids the collision;
          // the list still refreshes via relatedQueryKeys → the page's apiClients → clientRows.
          queryKey={`ApiClientsTable`}
        />
      </Stack>

      <CippApiDialog
        createDialog={{
          open: openAddClientDialog,
          handleClose: () => {
            setOpenAddClientDialog(false);
            setAddClientRetryPayload(null);
          },
        }}
        allowResubmit={true}
        dialogAfterEffect={handleAddClientAfterEffect}
        title="Add Client"
        fields={[
          {
            type: "textField",
            name: "AppName",
            label: "App Name",
            placeholder: "Enter a name for this Application Registration.",
            disableVariables: true,
          },
          {
            type: "autoComplete",
            name: "Role",
            multiple: false,
            creatable: false,
            label: "Select Role",
            api: {
              url: "/api/ListCustomRole",
              queryKey: "CustomRoleList",
              labelField: "RoleName",
              valueField: "RoleName",
              showRefresh: true,
            },
            placeholder: "Choose a role from the CIPP Role list.",
          },
          {
            type: "autoComplete",
            name: "IPRange",
            multiple: true,
            freeSolo: true,
            creatable: true,
            options: [],
            label: "Enter IP Ranges (Single hosts or CIDR notation)",
            placeholder: "Type in the IP addresses and hit enter.",
          },
          {
            type: "switch",
            name: "Enabled",
            label: "Enable this client",
          },
          {
            type: "switch",
            name: "MCPAllowed",
            label: "MCP Access Allowed",
          },
          {
            type: "alert",
            name: "mcpAccessWarning",
            severity: "warning",
            label:
              "Enabling MCP Access sets this client up as an MCP connector sign-in app — AI clients (Claude, ChatGPT, Copilot Studio, VS Code) sign in as it, and the shared CIPP-MCP resource app is created automatically. You can enable multiple MCP clients, each with its own role, IP range and Conditional Access. MCP is only supported on CIPP-NG.",
          },
          {
            name: "mcpRoleIpWarning",
            component: McpRoleIpWarning,
          },
        ]}
        api={{
          type: "POST",
          url: "/api/ExecApiClient",
          data: mergeApiDataWithRetry({ Action: "AddUpdate" }, addClientRetryPayload),
          relatedQueryKeys: [`ApiClients`],
        }}
      />
      <CippApiDialog
        createDialog={{
          open: openAddExistingAppDialog,
          handleClose: () => {
            setOpenAddExistingAppDialog(false);
          },
        }}
        title="Add Existing App"
        fields={[
          {
            type: "autoComplete",
            name: "ClientId",
            label: "Existing App",
            placeholder: "Select an existing API application.",
            api: {
              type: "GET",
              url: "/api/ExecApiClient",
              data: { Action: "ListAvailable" },
              queryKey: `AvailableApiApps`,
              dataKey: "Results",
              labelField: (app) => `${app.displayName} (${app.appId})`,
              valueField: "appId",
              addedField: {
                displayName: "displayName",
                createdDateTime: "createdDateTime",
              },
              showRefresh: true,
            },
            creatable: false,
            multiple: false,
          },
          {
            type: "autoComplete",
            name: "Role",
            multiple: false,
            creatable: false,
            label: "Select Role",
            placeholder: "Choose a role from the CIPP Role list.",
            api: {
              url: "/api/ListCustomRole",
              queryKey: "CustomRoleList",
              labelField: "RoleName",
              valueField: "RoleName",
              showRefresh: true,
            },
          },
          {
            type: "autoComplete",
            name: "IPRange",
            multiple: true,
            freeSolo: true,
            creatable: true,
            options: [],
            label: "Enter IP Ranges (Single hosts or CIDR notation)",
            placeholder: "Type in the IP addresses and hit enter.",
          },
          {
            type: "switch",
            name: "Enabled",
            label: "Enable this client",
          },
          {
            type: "switch",
            name: "MCPAllowed",
            label: "MCP Access Allowed",
          },
          {
            type: "alert",
            name: "mcpAccessWarning",
            severity: "warning",
            label:
              "Enabling MCP Access sets this client up as an MCP connector sign-in app — AI clients (Claude, ChatGPT, Copilot Studio, VS Code) sign in as it, and the shared CIPP-MCP resource app is created automatically. You can enable multiple MCP clients, each with its own role, IP range and Conditional Access. MCP is only supported on CIPP-NG.",
          },
          {
            name: "mcpRoleIpWarning",
            component: McpRoleIpWarning,
          },
        ]}
        api={{
          type: "POST",
          url: "/api/ExecApiClient",
          data: { Action: "!AddUpdate", CIPPAPI: { ResetSecret: true } },
          relatedQueryKeys: [`ApiClients`],
        }}
      />
    </>
  );
};

export default CippApiClientManagement;
