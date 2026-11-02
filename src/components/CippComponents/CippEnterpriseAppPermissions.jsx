import { useEffect, useMemo, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { CippIcons } from "../../utils/icon-registry";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { getListGraphBulkRequestRows } from "../../utils/getListGraphBulkRequestRows.js";
import riskyPermissionsJson from "../../data/RiskyPermissions.json";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "./CippApiDialog";
import CippFormComponent from "./CippFormComponent";

const normalizeApiLabel = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();

const apiLabelsMatch = (resourceDisplayName, jsonApi) => {
  if (!jsonApi || !resourceDisplayName) return true;
  const a = normalizeApiLabel(resourceDisplayName);
  const b = normalizeApiLabel(jsonApi);
  if (a === b) return true;
  return a.includes(b) || b.includes(a);
};

const buildRiskyPermissionLookup = (rows) => {
  const map = new Map();
  for (const row of rows) {
    const key = `${String(row.id).toLowerCase()}|${row.type}`;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(row);
  }
  return map;
};

const RISKY_BY_ID_AND_TYPE = buildRiskyPermissionLookup(riskyPermissionsJson);

const lookupApplicationRisk = (appRoleId, apiDisplayHint) => {
  const key = `${String(appRoleId).toLowerCase()}|Application`;
  const candidates = RISKY_BY_ID_AND_TYPE.get(key);
  if (!candidates?.length) {
    return null;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }
  const byApi = candidates.find((c) => apiLabelsMatch(apiDisplayHint, c.api));
  return byApi || candidates[0];
};

const lookupDelegatedRiskByScopeName = (scopeName, apiDisplayHint) =>
  riskyPermissionsJson.find(
    (r) => r.type === "Delegated" && r.name === scopeName && apiLabelsMatch(apiDisplayHint, r.api),
  ) ?? null;

const riskChipColor = (risk) => {
  switch (risk) {
    case "Critical":
      return "error";
    case "High":
      return "warning";
    case "Medium":
      return "info";
    case "Low":
      return "default";
    default:
      return "default";
  }
};

const riskAccentColor = (risk, theme) => {
  switch (risk) {
    case "Critical":
      return theme.palette.error.main;
    case "High":
      return theme.palette.warning.main;
    case "Medium":
      return theme.palette.info.main;
    case "Low":
      return theme.palette.text.secondary;
    default:
      return "transparent";
  }
};

const RISK_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };

const summariseAccordionRisk = (metas) => {
  const list = metas.filter(Boolean);
  if (list.length === 0) return null;
  const worst = list.reduce((acc, m) =>
    (RISK_ORDER[m.suspicion] ?? 0) > (RISK_ORDER[acc.suspicion] ?? 0) ? m : acc
  );
  return { count: list.length, worst: worst.suspicion };
};

const parseBulkSpBody = (entry) => {
  const body = entry?.body;
  if (!body) return null;
  if (body.value && Array.isArray(body.value)) {
    return body.value[0] || null;
  }
  if (body.id) {
    return body;
  }
  return null;
};

const PermissionLine = ({
  primary,
  secondary,
  riskMeta,
  onRemove,
}) => {
  const theme = useTheme();
  const accent = riskMeta ? riskAccentColor(riskMeta.suspicion, theme) : null;
  return (
    <ListItem
      sx={{
        py: 0.5,
        alignItems: "flex-start",
        pl: riskMeta ? 1 : 0,
        pr: 0,
        borderLeft: riskMeta ? 3 : 0,
        borderLeftColor: accent || "transparent",
        borderLeftStyle: riskMeta ? "solid" : "none",
      }}
    >
      <ListItemText
        primary={primary}
        secondary={secondary || undefined}
        slotProps={{
          primary: { variant: "body2", fontWeight: "medium" },
          secondary: { variant: "caption" }
        }} />
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0, ml: 1 }}>
        {riskMeta && (
          <Tooltip
            arrow
            placement="left"
            title={
              <Box sx={{ maxWidth: 380, py: 0.25 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {`Suspicion ${riskMeta.suspicion}, impact ${riskMeta.impact}`}
                  {riskMeta.name ? ` — ${riskMeta.name}` : ""}
                </Typography>
                <Typography variant="body2" component="p" sx={{ m: 0 }}>
                  {riskMeta.reason}
                </Typography>
              </Box>
            }
          >
            <span>
              <Chip
                size="small"
                label={riskMeta.suspicion}
                color={riskChipColor(riskMeta.suspicion)}
                variant={riskMeta.suspicion === "Low" ? "outlined" : "filled"}
                sx={{ cursor: "help", maxWidth: 120 }}
              />
            </span>
          </Tooltip>
        )}
        {onRemove && (
          <Tooltip title={`Remove ${primary}`}>
            <IconButton size="small" color="error" onClick={onRemove}>
              <CippIcons.Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </ListItem>
  );
};

const AddPermissionFields = ({ formHook, type, tenantFilter, allowedApis }) => {
  const resource = useWatch({ control: formHook.control, name: "Resource" });
  const resourceId = resource?.value;
  const resourceRequest = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: `servicePrincipals/${resourceId}`,
      $select: "id,displayName,appRoles,publishedPermissionScopes",
      tenantFilter,
    },
    queryKey: `EnterpriseApp-resource-${tenantFilter}-${resourceId}`,
    waiting: !!resourceId,
  });

  const results = resourceRequest.data?.Results;
  const resourceSp = Array.isArray(results) ? results[0] : results;
  const options = useMemo(() => {
    const items =
      type === "Application"
        ? (resourceSp?.appRoles || [])
            .filter((r) => r.allowedMemberTypes?.includes("Application"))
            .map((r) => ({ label: `${r.value} - ${r.displayName}`, value: r.id, sort: r.value }))
        : (resourceSp?.publishedPermissionScopes || resourceSp?.oauth2PermissionScopes || []).map(
            (s) => ({ label: `${s.value} - ${s.adminConsentDisplayName}`, value: s.value, sort: s.value }),
          );
    return items
      .filter((o) => o.sort)
      .sort((a, b) => a.sort.localeCompare(b.sort, undefined, { sensitivity: "base" }))
      .map(({ label, value }) => ({ label, value }));
  }, [resourceSp, type]);

  useEffect(() => {
    formHook.setValue("Permissions", []);
  }, [resourceId]);

  return (
    <>
      <CippFormComponent
        type="autoComplete"
        name="Resource"
        label="Resource API"
        multiple={false}
        creatable={false}
        formControl={formHook}
        validators={{ required: "Select the API to grant permissions on" }}
        helperText="Only APIs listed in the permissions translator are shown."
        api={{
          tenantFilter,
          url: "/api/ListGraphRequest",
          dataKey: "Results",
          labelField: (option) => `${option.displayName} (${option.appId})`,
          valueField: "id",
          queryKey: `EnterpriseApp-resourceApis-${tenantFilter}`,
          dataFilter: (options) =>
            options.filter((o) =>
              allowedApis.has(String(o.rawData?.displayName || "").toLowerCase()),
            ),
          data: {
            Endpoint: "servicePrincipals",
            manualPagination: true,
            $select: "id,appId,displayName",
            $count: true,
            $orderby: "displayName",
            $top: 999,
          },
        }}
      />
      <CippFormComponent
        key={resourceId ?? "none"}
        type="autoComplete"
        name="Permissions"
        label={`${type} permissions`}
        multiple
        creatable={false}
        disabled={!resourceId}
        isFetching={resourceRequest.isFetching}
        options={options}
        formControl={formHook}
        validators={{
          validate: (value) => value?.length > 0 || "Select at least one permission",
        }}
      />
      {resourceRequest.isSuccess && options.length === 0 && (
        <Alert severity="info">
          {`This API publishes no ${type.toLowerCase()} permissions.`}
        </Alert>
      )}
    </>
  );
};

const ResourceAccordion = ({
  title,
  resourceId,
  chipLabel,
  children,
  riskSummary,
  onRemoveAll,
}) => {
  const theme = useTheme();
  return (
    <Accordion
      variant="outlined"
      sx={{
        mb: 1,
        ...(riskSummary && {
          borderLeftWidth: 3,
          borderLeftStyle: "solid",
          borderLeftColor: riskAccentColor(riskSummary.worst, theme),
        }),
      }}
      disableGutters
    >
      <AccordionSummary
        expandIcon={<CippIcons.ExpandMore />}
        // summary is a centered ButtonBase, an unshrinkable row spills both edges
        sx={{ "& .MuiAccordionSummary-content": { minWidth: 0 } }}
      >
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{
            alignItems: "center",
            width: "100%",
            pr: 1,
            flexWrap: "wrap",
            rowGap: 1
          }}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {riskSummary && (
            <Tooltip
              title={`This API includes ${riskSummary.count} permission(s) listed in the risky-permissions set (highest suspicion: ${riskSummary.worst}).`}
            >
              <Chip
                size="small"
                icon={<CippIcons.WarningAmber sx={{ fontSize: 18 }} />}
                label={`${riskSummary.worst} (${riskSummary.count})`}
                color={riskChipColor(riskSummary.worst)}
                variant={riskSummary.worst === "Low" ? "outlined" : "filled"}
                sx={{ flexShrink: 0, cursor: "help", maxWidth: 160 }}
              />
            </Tooltip>
          )}
          <Chip
            size="small"
            label={resourceId}
            variant="outlined"
            sx={{ maxWidth: 260, minWidth: 0 }}
          />
          {chipLabel != null && <Chip size="small" label={String(chipLabel)} />}
          {onRemoveAll && (
            <Tooltip title={`Remove all permissions on ${title}`}>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAll();
                }}
                onFocus={(e) => e.stopPropagation()}
              >
                <CippIcons.DeleteSweep fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

const CippEnterpriseAppPermissions = ({ servicePrincipalId, tenantFilter, canEdit = false }) => {
  const permissionsBulk = ApiPostCall({ urlFromData: true });
  const resourcesBulk = ApiPostCall({ urlFromData: true });
  const fetchedResourceKey = useRef("");
  const actionDialog = useDialog();
  const [dialogAction, setDialogAction] = useState(null);
  // Copy of backend/Config/PermissionsTranslator.json, kept in sync by build/tools/Update-PermissionsTranslator.ps1.
  const translatorRequest = ApiGetCall({
    url: "/permissionsTranslator.json",
    queryKey: "permissionsTranslator",
    staleTime: Infinity,
  });

  const translator = useMemo(() => {
    const byId = new Map();
    const byOriginAndValue = new Map();
    const delegatedByValue = new Map();
    // origin is "Application (Microsoft Graph)" / "Delegated (Microsoft Graph)"
    const apisByType = { Application: new Set(), Delegated: new Set() };
    const rows = Array.isArray(translatorRequest.data) ? translatorRequest.data : [];
    for (const row of rows) {
      if (!row?.id) continue;
      byId.set(String(row.id).toLowerCase(), row);
      const originMatch = /^(Application|Delegated) \((.+)\)$/.exec(String(row.origin || ""));
      if (originMatch) apisByType[originMatch[1]].add(originMatch[2].toLowerCase());
      const value = String(row.value || "").toLowerCase();
      const origin = String(row.origin || "").toLowerCase();
      if (!value) continue;
      byOriginAndValue.set(`${origin}|${value}`, row);
      if (origin.startsWith("delegated")) {
        if (!delegatedByValue.has(value)) delegatedByValue.set(value, []);
        delegatedByValue.get(value).push(row);
      }
    }
    return { byId, byOriginAndValue, delegatedByValue, apisByType };
  }, [translatorRequest.data]);

  useEffect(() => {
    fetchedResourceKey.current = "";
  }, [servicePrincipalId]);

  const loadPermissions = () => {
    if (!servicePrincipalId || !tenantFilter) {
      return;
    }
    permissionsBulk.mutate({
      url: "/api/ListGraphBulkRequest",
      data: {
        tenantFilter,
        Requests: [
          {
            id: "appRoleAssignments",
            url: `/servicePrincipals/${servicePrincipalId}/appRoleAssignments`,
            method: "GET",
          },
          {
            id: "oauth2Grants",
            url: `/oauth2PermissionGrants?$filter=clientId eq '${servicePrincipalId}'`,
            method: "GET",
          },
        ],
      },
    });
  };

  useEffect(() => {
    loadPermissions();
  }, [servicePrincipalId, tenantFilter]);

  const permBulkRows = getListGraphBulkRequestRows(permissionsBulk);
  const assignments =
    permBulkRows.find((r) => r.id === "appRoleAssignments")?.body?.value || [];
  const grants = permBulkRows.find((r) => r.id === "oauth2Grants")?.body?.value || [];

  const resourceIds = useMemo(() => {
    const s = new Set();
    assignments.forEach((a) => {
      if (a.resourceId) s.add(a.resourceId);
    });
    grants.forEach((g) => {
      if (g.resourceId) s.add(g.resourceId);
    });
    return [...s];
  }, [assignments, grants]);

  const resourceSpMap = useMemo(() => {
    const map = {};
    getListGraphBulkRequestRows(resourcesBulk).forEach((entry) => {
      const sp = parseBulkSpBody(entry);
      if (sp?.id) {
        map[sp.id] = sp;
      }
    });
    return map;
  }, [resourcesBulk?.data?.data]);

  useEffect(() => {
    if (!permissionsBulk.isSuccess || !tenantFilter) {
      return;
    }
    if (resourceIds.length === 0) {
      return;
    }
    // After a removal every resource is already resolved; only an added API needs a fetch.
    const key = resourceIds.join(",");
    if (fetchedResourceKey.current === key || resourceIds.every((rid) => resourceSpMap[rid])) {
      return;
    }
    fetchedResourceKey.current = key;
    resourcesBulk.mutate({
      url: "/api/ListGraphBulkRequest",
      data: {
        tenantFilter,
        Requests: resourceIds.map((rid) => ({
          id: `sp-res-${rid}`,
          // ListGraphBulkRequest calls beta, where the scopes are publishedPermissionScopes; selecting
          // the v1.0 name oauth2PermissionScopes fails the whole request.
          url: `/servicePrincipals/${rid}?$select=id,displayName,appId,appRoles,publishedPermissionScopes`,
          method: "GET",
        })),
      },
    });
  }, [permissionsBulk.isSuccess, tenantFilter, resourceIds.join(",")]);

  const scopesForResource = useMemo(() => {
    const m = {};
    grants.forEach((g) => {
      const rid = g.resourceId;
      if (!rid) return;
      if (!m[rid]) m[rid] = new Set();
      String(g.scope || "")
        .split(/\s+/)
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((sc) => m[rid].add(sc));
    });
    const out = {};
    Object.keys(m).forEach((k) => {
      out[k] = [...m[k]].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    });
    return out;
  }, [grants]);

  // The translator JSON leads; the resource service principal read from the tenant is the fallback.
  const resolveAppRole = (resourceId, appRoleId) => {
    const sp = resourceSpMap[resourceId];
    const role = sp?.appRoles?.find((r) => r.id === appRoleId);
    const known = translator.byId.get(String(appRoleId).toLowerCase());
    return {
      name: known?.value || role?.value || appRoleId,
      description:
        known?.description || known?.displayName || role?.description || role?.displayName || null,
    };
  };

  const resolveDelegatedScope = (resourceId, scopeValue, apiDisplayName) => {
    const sp = resourceSpMap[resourceId];
    const scopes = sp?.publishedPermissionScopes || sp?.oauth2PermissionScopes || [];
    const scope = scopes.find((s) => s.value === scopeValue);
    const value = String(scopeValue).toLowerCase();
    const candidates = translator.delegatedByValue.get(value) || [];
    const known =
      translator.byOriginAndValue.get(`delegated (${String(apiDisplayName || "").toLowerCase()})|${value}`) ||
      (candidates.length === 1 ? candidates[0] : null);
    return {
      name: scopeValue,
      description:
        known?.description ||
        known?.displayName ||
        scope?.adminConsentDescription ||
        scope?.userConsentDescription ||
        null,
    };
  };

  const assignmentsByResource = useMemo(() => {
    const m = {};
    assignments.forEach((a) => {
      const rid = a.resourceId;
      if (!rid) return;
      if (!m[rid]) m[rid] = [];
      m[rid].push(a);
    });
    return m;
  }, [assignments]);

  const sortedResourceIdsApp = useMemo(() => {
    return Object.keys(assignmentsByResource).sort((a, b) => {
      const nameA =
        resourceSpMap[a]?.displayName || assignmentsByResource[a][0]?.resourceDisplayName || a;
      const nameB =
        resourceSpMap[b]?.displayName || assignmentsByResource[b][0]?.resourceDisplayName || b;
      return String(nameA).localeCompare(String(nameB), undefined, { sensitivity: "base" });
    });
  }, [assignmentsByResource, resourceSpMap]);

  const sortedResourceIdsDelegated = useMemo(() => {
    return Object.keys(scopesForResource).sort((a, b) => {
      const nameA = resourceSpMap[a]?.displayName || a;
      const nameB = resourceSpMap[b]?.displayName || b;
      return String(nameA).localeCompare(String(nameB), undefined, { sensitivity: "base" });
    });
  }, [scopesForResource, resourceSpMap]);

  const permLoading =
    permissionsBulk.isPending ||
    permissionsBulk.isLoading ||
    (!permissionsBulk.isIdle && !permissionsBulk.isSuccess);
  const resLoading =
    resourceIds.length > 0 &&
    (resourcesBulk.isPending || resourcesBulk.isLoading);

  const openAction = (action) => {
    setDialogAction({ ...action, key: Date.now() });
    actionDialog.handleOpen();
  };

  const openAdd = (type) =>
    openAction({
      title: `Add ${type.toLowerCase()} permissions`,
      confirmText:
        type === "Application"
          ? "Application permissions are granted with admin consent and apply immediately, without a signed-in user."
          : "Delegated permissions are consented on behalf of all users in the tenant.",
      type,
      action: "Add",
      buildData: (formData) => ({
        ResourceId: formData.Resource?.value,
        [type === "Application" ? "AppRoleIds" : "Scopes"]: (formData.Permissions || []).map(
          (p) => p.value,
        ),
      }),
    });

  const openRemoveApplication = (title, assignmentsToRemove, label) =>
    openAction({
      title,
      confirmText: `Remove ${label}? The application loses this access immediately.`,
      type: "Application",
      action: "Remove",
      buildData: () => ({ AppRoleAssignmentIds: assignmentsToRemove.map((a) => a.id) }),
    });

  const openRemoveDelegated = (title, rid, scopes, label) =>
    openAction({
      title,
      confirmText: `Remove ${label}? This removes the consent for all users, including individual user consents.`,
      type: "Delegated",
      action: "Remove",
      buildData: () => ({ ResourceId: rid, Scopes: scopes }),
    });

  const sectionHeader = (heading, type) => (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: "center", justifyContent: "space-between", mb: 0.5 }}
    >
      <Typography variant="h6">{heading}</Typography>
      {canEdit && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<CippIcons.Add />}
          disabled={permLoading || !translatorRequest.isSuccess}
          onClick={() => openAdd(type)}
        >
          Add permission
        </Button>
      )}
    </Stack>
  );

  return (
    <Stack spacing={4} sx={{ py: 2 }}>
      <Box>
        {sectionHeader("Application permissions", "Application")}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 2
          }}>
          App roles assigned to this enterprise application (app-only), grouped by resource API.
        </Typography>
        {permLoading && <Skeleton variant="rectangular" height={80} />}
        {!permLoading && sortedResourceIdsApp.length === 0 && (
          <Alert severity="info">No application permissions are assigned.</Alert>
        )}
        {!permLoading &&
          sortedResourceIdsApp.map((rid) => {
            const title =
              resourceSpMap[rid]?.displayName ||
              assignmentsByResource[rid][0]?.resourceDisplayName ||
              `API (${rid})`;
            const list = assignmentsByResource[rid];
            const riskSummary = summariseAccordionRisk(
              list.map((a) => lookupApplicationRisk(a.appRoleId, title)),
            );
            return (
              <ResourceAccordion
                key={`app-${rid}`}
                title={title}
                resourceId={rid}
                chipLabel={list.length}
                riskSummary={riskSummary}
                onRemoveAll={
                  canEdit
                    ? () =>
                        openRemoveApplication(
                          "Remove application permissions",
                          list,
                          `all ${list.length} application permission(s) on ${title}`,
                        )
                    : undefined
                }
              >
                {resLoading && <Skeleton variant="rectangular" height={64} />}
                {!resLoading && (
                  <List dense disablePadding>
                    {list.map((a, idx) => {
                      const { name, description } = resolveAppRole(rid, a.appRoleId);
                      const riskMeta = lookupApplicationRisk(a.appRoleId, title);
                      return (
                        <PermissionLine
                          key={`${a.id || a.appRoleId}-${idx}`}
                          primary={name}
                          secondary={description}
                          riskMeta={riskMeta}
                          onRemove={
                            canEdit
                              ? () =>
                                  openRemoveApplication(
                                    "Remove application permission",
                                    [a],
                                    `the application permission ${name} on ${title}`,
                                  )
                              : undefined
                          }
                        />
                      );
                    })}
                  </List>
                )}
              </ResourceAccordion>
            );
          })}
      </Box>

      <Box>
        {sectionHeader("Delegated permissions", "Delegated")}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 2
          }}>
          OAuth2 delegated permission grants for this enterprise application, grouped by resource API.
        </Typography>
        {permLoading && <Skeleton variant="rectangular" height={80} />}
        {!permLoading && sortedResourceIdsDelegated.length === 0 && (
          <Alert severity="info">No delegated permission grants are present.</Alert>
        )}
        {!permLoading &&
          sortedResourceIdsDelegated.map((rid) => {
            const title = resourceSpMap[rid]?.displayName || `API (${rid})`;
            const scopeList = scopesForResource[rid] || [];
            const riskSummary = summariseAccordionRisk(
              scopeList.map((s) => lookupDelegatedRiskByScopeName(s, title)),
            );
            return (
              <ResourceAccordion
                key={`deleg-${rid}`}
                title={title}
                resourceId={rid}
                chipLabel={scopeList.length}
                riskSummary={riskSummary}
                onRemoveAll={
                  canEdit
                    ? () =>
                        openRemoveDelegated(
                          "Remove delegated permissions",
                          rid,
                          scopeList,
                          `all ${scopeList.length} delegated permission(s) on ${title}`,
                        )
                    : undefined
                }
              >
                {resLoading && <Skeleton variant="rectangular" height={64} />}
                {!resLoading && (
                  <List dense disablePadding>
                    {scopeList.map((scopeName, idx) => {
                      const { description } = resolveDelegatedScope(rid, scopeName, title);
                      const riskMeta = lookupDelegatedRiskByScopeName(scopeName, title);
                      return (
                        <PermissionLine
                          key={`${scopeName}-${idx}`}
                          primary={scopeName}
                          secondary={description}
                          riskMeta={riskMeta}
                          onRemove={
                            canEdit
                              ? () =>
                                  openRemoveDelegated(
                                    "Remove delegated permission",
                                    rid,
                                    [scopeName],
                                    `the delegated permission ${scopeName} on ${title}`,
                                  )
                              : undefined
                          }
                        />
                      );
                    })}
                  </List>
                )}
              </ResourceAccordion>
            );
          })}
      </Box>
      {dialogAction && (
        <CippApiDialog
          key={dialogAction.key}
          createDialog={actionDialog}
          title={dialogAction.title}
          relatedQueryKeys={[`EnterpriseApp-permissions-${servicePrincipalId}`]}
          dialogAfterEffect={loadPermissions}
          api={{
            type: "POST",
            url: "/api/ExecEnterpriseAppPermission",
            confirmText: dialogAction.confirmText,
            customDataformatter: (row, action, formData) => ({
              tenantFilter,
              ServicePrincipalId: servicePrincipalId,
              Action: dialogAction.action,
              Type: dialogAction.type,
              ...dialogAction.buildData(formData),
            }),
          }}
        >
          {dialogAction.action === "Add"
            ? ({ formHook }) => (
                <AddPermissionFields
                  formHook={formHook}
                  type={dialogAction.type}
                  tenantFilter={tenantFilter}
                  allowedApis={translator.apisByType[dialogAction.type]}
                />
              )
            : undefined}
        </CippApiDialog>
      )}
    </Stack>
  );
};

export default CippEnterpriseAppPermissions;
