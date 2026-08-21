import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Alert,
  Chip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  SvgIcon,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import { Grid } from "@mui/system";
import { ApiGetCall, ApiGetCallWithPagination, ApiPostCall } from "../../api/ApiCall";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { CippFormTenantSelector } from "../CippComponents/CippFormTenantSelector";
import { Save, WarningOutlined } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { CippApiResults } from "../CippComponents/CippApiResults";
import cippRoles from "../../data/cipp-roles.json";
import { GroupHeader, GroupItems } from "../CippComponents/CippAutocompleteGrouping";
import {
  matchPattern,
  flattenPermissionTree,
  expandRules,
  rulesToFlatMap,
  flatMapToRules,
  validateRulePattern,
  buildRuleSuggestions,
} from "../../utils/permission-rules";

export const CippRoleAddEdit = ({ selectedRole }) => {
  const updatePermissions = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["customRoleList", "customRoleTable"],
  });

  const [allTenantSelected, setAllTenantSelected] = useState(false);
  const [cippApiRoleSelected, setCippApiRoleSelected] = useState(false);
  const [selectedRoleState, setSelectedRoleState] = useState(null);
  const [updateDefaults, setUpdateDefaults] = useState(false);
  const [baseRolePermissions, setBaseRolePermissions] = useState({});
  const [isBaseRole, setIsBaseRole] = useState(false);
  // New roles start in simple (pattern) mode; existing roles pick their mode in the
  // reset effect based on whether their stored rules contain wildcards.
  const [permissionMode, setPermissionMode] = useState(selectedRole ? "advanced" : "simple");
  const [gridDiverged, setGridDiverged] = useState(false);
  const [rulePreviewVisible, setRulePreviewVisible] = useState(false);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      allowedTenants: [],
      blockedTenants: [],
      BlockedEndpoints: [],
      IPRange: [],
      Permissions: {},
      PermissionRulesInclude: [],
      PermissionRulesExclude: [],
    },
  });

  const formState = useFormState({ control: formControl.control });

  const validateRoleName = (value) => {
    const alphaNumRegex = /^[A-Za-z0-9]+$/;

    if (!alphaNumRegex.test(value)) {
      return "Role name must contain only letters and numbers, no spaces or special characters";
    }

    if (
      customRoleList?.pages?.[0]?.some(
        (role) => role?.RowKey?.toLowerCase() === value?.toLowerCase()
      )
    ) {
      return `Role '${value}' already exists`;
    }
    return true;
  };

  const selectedTenant = useWatch({ control: formControl.control, name: "allowedTenants" });
  const blockedTenants = useWatch({ control: formControl.control, name: "blockedTenants" });
  const blockedEndpoints = useWatch({ control: formControl.control, name: "BlockedEndpoints" });
  const setDefaults = useWatch({ control: formControl.control, name: "Defaults" });
  const selectedPermissions = useWatch({ control: formControl.control, name: "Permissions" });
  const selectedEntraGroup = useWatch({ control: formControl.control, name: "EntraGroup" });
  const ipRanges = useWatch({ control: formControl.control, name: "IPRange" });
  const includeRules = useWatch({ control: formControl.control, name: "PermissionRulesInclude" });
  const excludeRules = useWatch({ control: formControl.control, name: "PermissionRulesExclude" });
  const baseRoleTemplate = useWatch({ control: formControl.control, name: "BaseRoleTemplate" });

  // "Start from a built-in role": copy its patterns into the rule fields as an
  // editable starting point, then clear the picker so it acts as a one-shot action.
  useEffect(() => {
    const roleName = baseRoleTemplate?.value;
    if (!roleName || !cippRoles[roleName]) return;
    const toOptions = (list) => (list || []).map((pattern) => ({ label: pattern, value: pattern }));
    formControl.setValue("PermissionRulesInclude", toOptions(cippRoles[roleName].include));
    formControl.setValue("PermissionRulesExclude", toOptions(cippRoles[roleName].exclude));
    formControl.setValue("BaseRoleTemplate", null);
  }, [baseRoleTemplate]);

  const {
    data: apiPermissions = [],
    isFetching: apiPermissionFetching,
    isSuccess: apiPermissionSuccess,
  } = ApiGetCall({
    url: "/api/ExecAPIPermissionList",
    queryKey: "apiPermissions",
  });

  const {
    data: customRoleList = [],
    isFetching: customRoleListFetching,
    isSuccess: customRoleListSuccess,
  } = ApiGetCallWithPagination({
    url: "/api/ExecCustomRole",
    queryKey: "customRoleList",
  });

  const {
    data: { pages = [] } = {},
    isSuccess: tenantsSuccess,
    isFetching: tenantsFetching,
  } = ApiGetCallWithPagination({
    url: "/api/ListTenants?AllTenantSelector=true",
    queryKey: "ListTenants-All",
  });
  const tenants = pages[0] || [];

  const permissionUniverse = useMemo(() => flattenPermissionTree(apiPermissions), [apiPermissions]);
  const ruleSuggestions = useMemo(() => buildRuleSuggestions(apiPermissions), [apiPermissions]);
  const currentRules = useMemo(
    () => ({
      Include: (includeRules || []).map((o) => o?.value || o).filter(Boolean),
      Exclude: (excludeRules || []).map((o) => o?.value || o).filter(Boolean),
    }),
    [includeRules, excludeRules]
  );
  const ruleExpansion = useMemo(
    () => expandRules(currentRules, permissionUniverse),
    [currentRules, permissionUniverse]
  );
  // Login breaks without CIPP.Core.Read; save auto-adds it when rules miss it.
  const coreCovered = ruleExpansion.matched.some((p) => p.startsWith("CIPP.Core."));

  const handleModeChange = (_event, newMode) => {
    if (!newMode || newMode === permissionMode) return;
    if (newMode === "advanced") {
      // Expand rules into the grid so the advanced view reflects the same role.
      if (currentRules.Include.length > 0) {
        formControl.setValue("Permissions", rulesToFlatMap(currentRules, apiPermissions));
      }
      setGridDiverged(false);
    } else {
      const rulesGrid = rulesToFlatMap(currentRules, apiPermissions);
      const diverged =
        currentRules.Include.length > 0 &&
        Object.keys(rulesGrid).some((key) => (selectedPermissions?.[key] ?? null) !== rulesGrid[key]);
      setGridDiverged(diverged);
    }
    setPermissionMode(newMode);
  };

  const getFunctionDescriptionText = (description) => {
    if (!description) return null;

    if (Array.isArray(description)) {
      return description?.[0]?.Text || description?.[0]?.text || null;
    }

    if (typeof description === "string") {
      return description;
    }

    if (typeof description === "object") {
      return description?.Text || description?.text || null;
    }

    return null;
  };

  const getBaseRolePermissions = (role) => {
    const roleConfig = cippRoles[role];
    if (!roleConfig) return {};

    const permissions = {};
    Object.keys(apiPermissions).forEach((cat) => {
      Object.keys(apiPermissions[cat]).forEach((obj) => {
        const includeRead = roleConfig.include.some((pattern) =>
          matchPattern(pattern, `${cat}.${obj}.Read`)
        );
        const includeReadWrite = roleConfig.include.some((pattern) =>
          matchPattern(pattern, `${cat}.${obj}.ReadWrite`)
        );
        const excludeRead = roleConfig.exclude.some((pattern) =>
          matchPattern(pattern, `${cat}.${obj}.Read`)
        );
        const excludeReadWrite = roleConfig.exclude.some((pattern) =>
          matchPattern(pattern, `${cat}.${obj}.ReadWrite`)
        );

        if ((includeRead || includeReadWrite) && !(excludeRead || excludeReadWrite)) {
          if (!permissions[cat]) permissions[cat] = {};
          permissions[cat][obj] = includeReadWrite ? `ReadWrite` : `Read`;
        }
        if (!permissions[cat] || !permissions[cat][obj]) {
          if (!permissions[cat]) permissions[cat] = {};
          permissions[cat][obj] = `None`;
        }
      });
    });
    return permissions;
  };

  useEffect(() => {
    if (selectedRole && cippRoles[selectedRole]) {
      setBaseRolePermissions(getBaseRolePermissions(selectedRole));
      setIsBaseRole(true);
    } else {
      setBaseRolePermissions({});
      setIsBaseRole(false);
    }
  }, [selectedRole, apiPermissions]);

  useEffect(() => {
    if (
      (customRoleListSuccess &&
        tenantsSuccess &&
        selectedRole &&
        selectedRoleState !== selectedRole) ||
      baseRolePermissions
    ) {
      setSelectedRoleState(selectedRole);
      const isApiRole = selectedRole === "api-role";
      setCippApiRoleSelected(isApiRole);

      const currentPermissions = customRoleList?.pages?.[0]?.find(
        (role) => role.RowKey === selectedRole
      );

      // Process allowed tenants - handle both groups and tenant IDs
      var newAllowedTenants = [];
      currentPermissions?.AllowedTenants?.forEach((item) => {
        if (typeof item === "object" && item.type === "Group") {
          // Handle group objects
          newAllowedTenants.push({
            label: item.label,
            value: item.value,
            type: "Group",
          });
        } else {
          // Handle tenant customer IDs (legacy format)
          var tenantInfo = tenants.find((t) => t?.customerId === item);
          if (tenantInfo?.displayName) {
            var label = `${tenantInfo.displayName} (${tenantInfo.defaultDomainName})`;
            newAllowedTenants.push({
              label: label,
              value: tenantInfo.defaultDomainName,
              type: "Tenant",
              addedFields: {
                defaultDomainName: tenantInfo.defaultDomainName,
                displayName: tenantInfo.displayName,
                customerId: tenantInfo.customerId,
              },
            });
          }
        }
      });

      // Process blocked tenants - handle both groups and tenant IDs
      var newBlockedTenants = [];
      currentPermissions?.BlockedTenants?.forEach((item) => {
        if (typeof item === "object" && item.type === "Group") {
          // Handle group objects
          newBlockedTenants.push({
            label: item.label,
            value: item.value,
            type: "Group",
          });
        } else {
          // Handle tenant customer IDs (legacy format)
          var tenantInfo = tenants.find((t) => t?.customerId === item);
          if (tenantInfo?.displayName) {
            var label = `${tenantInfo.displayName} (${tenantInfo.defaultDomainName})`;
            newBlockedTenants.push({
              label: label,
              value: tenantInfo.defaultDomainName,
              type: "Tenant",
              addedFields: {
                defaultDomainName: tenantInfo.defaultDomainName,
                displayName: tenantInfo.displayName,
                customerId: tenantInfo.customerId,
              },
            });
          }
        }
      });

      const basePermissions = {};
      Object.entries(getBaseRolePermissions(selectedRole)).forEach(([cat, objects]) => {
        Object.entries(objects).forEach(([obj, permission]) => {
          basePermissions[`${cat}${obj}`] = `${cat}.${obj}.${permission}`;
        });
      });
      const processPermissions = (permissions) => {
        const processed = {};
        Object.keys(apiPermissions).forEach((cat) => {
          Object.keys(apiPermissions[cat]).forEach((obj) => {
            const key = `${cat}${obj}`;
            const existingPerm = permissions?.[key];
            processed[key] = existingPerm || `${cat}.${obj}.None`;
          });
        });
        return processed;
      };

      // Process blocked endpoints
      const processedBlockedEndpoints =
        currentPermissions?.BlockedEndpoints?.map((endpoint) => ({
          label: endpoint,
          value: endpoint,
        })) || [];

      // Process IP ranges
      const processedIPRanges =
        currentPermissions?.IPRange?.map((ip) => ({
          label: ip,
          value: ip,
        })) || [];

      const storedRules = currentPermissions?.PermissionRules;
      const toRuleOptions = (list) =>
        Array.isArray(list) ? list.map((pattern) => ({ label: pattern, value: pattern })) : [];

      formControl.reset({
        Permissions:
          basePermissions && Object.keys(basePermissions).length > 0
            ? basePermissions
            : processPermissions(currentPermissions?.Permissions),
        RoleName: selectedRole ?? currentPermissions?.RowKey,
        allowedTenants: newAllowedTenants,
        blockedTenants: newBlockedTenants,
        BlockedEndpoints: processedBlockedEndpoints,
        IPRange: processedIPRanges,
        EntraGroup: currentPermissions?.EntraGroup,
        PermissionRulesInclude: toRuleOptions(storedRules?.Include),
        PermissionRulesExclude: toRuleOptions(storedRules?.Exclude),
      });
      if (currentPermissions) {
        // Wildcard roles open in simple mode; migrated concrete-string roles open in
        // the grid, which is the friendlier view of an explicit list.
        const hasWildcards = storedRules?.Include?.some((pattern) => pattern.includes("*"));
        setPermissionMode(hasWildcards ? "simple" : "advanced");
        setGridDiverged(false);
      }
    }
  }, [customRoleList, customRoleListSuccess, tenantsSuccess, baseRolePermissions]);

  useEffect(() => {
    if (updateDefaults !== setDefaults) {
      setUpdateDefaults(setDefaults);
      var newPermissions = {};
      Object.keys(apiPermissions).forEach((cat) => {
        Object.keys(apiPermissions[cat]).forEach((obj) => {
          var newval = "";
          if (cat == "CIPP" && obj == "Core" && setDefaults == "None") {
            newval = "Read";
          } else {
            newval = setDefaults;
          }
          newPermissions[`${cat}${obj}`] = `${cat}.${obj}.${newval}`;
        });
      });
      formControl.setValue("Permissions", newPermissions);
    }
  }, [setDefaults, updateDefaults]);

  useEffect(() => {
    var alltenant = false;
    selectedTenant?.map((tenant) => {
      if (tenant?.value === "AllTenants") {
        alltenant = true;
      }
    });
    if (alltenant) {
      setAllTenantSelected(true);
    } else {
      setAllTenantSelected(false);
    }
  }, [selectedTenant, blockedTenants]);

  useEffect(() => {
    if (selectedRole) {
      formControl.setValue("RoleName", selectedRole);
    }
  }, [selectedRole]);

  const handleSubmit = () => {
    let values = formControl.getValues();

    // Process allowed tenants - preserve groups and convert tenants to IDs
    const processedAllowedTenants =
      selectedTenant
        ?.map((tenant) => {
          if (tenant.type === "Group") {
            // Keep groups as-is for backend processing
            return {
              type: "Group",
              value: tenant.value,
              label: tenant.label,
            };
          } else {
            // Convert tenant domain names to customer IDs
            const tenantInfo = tenants.find((t) => t.defaultDomainName === tenant.value);
            return tenantInfo?.customerId;
          }
        })
        .filter(Boolean) || [];

    // Process blocked tenants - preserve groups and convert tenants to IDs
    const processedBlockedTenants =
      blockedTenants
        ?.map((tenant) => {
          if (tenant.type === "Group") {
            // Keep groups as-is for backend processing
            return {
              type: "Group",
              value: tenant.value,
              label: tenant.label,
            };
          } else {
            // Convert tenant domain names to customer IDs
            const tenantInfo = tenants.find((t) => t.defaultDomainName === tenant.value);
            return tenantInfo?.customerId;
          }
        })
        .filter(Boolean) || [];

    const processedBlockedEndpoints =
      values?.["BlockedEndpoints"]?.map((endpoint) => {
        // Extract the endpoint value
        return endpoint.value || endpoint;
      }) || [];

    const processedIPRanges =
      ipRanges?.map((ip) => {
        return ip?.value || ip;
      }) || [];

    // PermissionRules is the canonical format for both modes: simple mode sends the
    // authored patterns, advanced mode sends concrete strings derived from the grid.
    // Permissions stays as a flat snapshot for older backends.
    const activeRules =
      permissionMode === "simple"
        ? {
            Include:
              coreCovered || currentRules.Include.length === 0
                ? currentRules.Include
                : [...currentRules.Include, "CIPP.Core.Read"],
            Exclude: currentRules.Exclude,
          }
        : flatMapToRules(selectedPermissions);
    const snapshotPermissions =
      permissionMode === "simple" ? rulesToFlatMap(activeRules, apiPermissions) : selectedPermissions;

    updatePermissions.mutate({
      url: "/api/ExecCustomRole?Action=AddUpdate",
      data: {
        RoleName: values?.["RoleName"],
        Permissions: snapshotPermissions,
        PermissionRules: activeRules,
        EntraGroup: selectedEntraGroup,
        AllowedTenants: processedAllowedTenants,
        BlockedTenants: processedBlockedTenants,
        BlockedEndpoints: processedBlockedEndpoints,
        IPRange: processedIPRanges,
      },
    });
  };

  const ApiPermissionRow = ({ obj, cat, readOnly }) => {
    const [offcanvasVisible, setOffcanvasVisible] = useState(false);
    const [descriptionOffcanvasVisible, setDescriptionOffcanvasVisible] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState({ name: "", description: "" });

    const handleDescriptionClick = (name, description) => {
      setSelectedDescription({ name, description });
      setDescriptionOffcanvasVisible(true);
    };

    return (
      <Stack
        // The None/Read/ReadWrite radio row is wider than a phone leaves beside the object
        // name, so the controls drop below it there.
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent={"space-between"}
        width={"100%"}
      >
        <Typography variant="h6">{obj}</Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          <Button onClick={() => setOffcanvasVisible(true)} size="sm" color="info">
            <SvgIcon fontSize="small">
              <InformationCircleIcon />
            </SvgIcon>
          </Button>
          <CippFormComponent
            type="radio"
            row={true}
            name={`Permissions.${cat}${obj}`}
            options={[
              {
                label: "None",
                value: `${cat}.${obj}.None`,
                disabled: cat === "CIPP" && obj === "Core",
              },
              { label: "Read", value: `${cat}.${obj}.Read`, disabled: readOnly },
              {
                label: "Read / Write",
                value: `${cat}.${obj}.ReadWrite`,
              },
            ]}
            formControl={formControl}
            disabled={readOnly}
          />
        </Stack>
        {/* Main offcanvas */}
        <CippOffCanvas
          visible={offcanvasVisible}
          onClose={() => setOffcanvasVisible(false)}
          title={`${cat}.${obj} Endpoints`}
        >
          <Stack spacing={2}>
            <Typography variant="body1" sx={{ mx: 3 }}>
              Listed below are the available API endpoints based on permission level. ReadWrite
              level includes endpoints under Read.
            </Typography>
            {Object.keys(apiPermissions[cat][obj]).map((type, typeIndex) => {
              var items = [];
              for (var api in apiPermissions[cat][obj][type]) {
                const apiFunction = apiPermissions[cat][obj][type][api];
                items.push({
                  name: apiFunction.Name,
                  description: getFunctionDescriptionText(apiFunction.Description),
                });
              }
              return (
                <Stack key={`${type}-${typeIndex}`} spacing={2}>
                  <Typography variant="h4">{type}</Typography>
                  <Stack spacing={1}>
                    {items.map((item, idx) => (
                      <Stack key={`${type}-${idx}`} direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", flexGrow: 1 }}>
                          {item.name}
                        </Typography>
                        {item.description && (
                          <Button
                            size="small"
                            onClick={() => handleDescriptionClick(item.name, item.description)}
                            sx={{ minWidth: "auto", p: 0.5 }}
                          >
                            <SvgIcon fontSize="small" color="info">
                              <InformationCircleIcon />
                            </SvgIcon>
                          </Button>
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </CippOffCanvas>

        {/* Description offcanvas */}
        <CippOffCanvas
          visible={descriptionOffcanvasVisible}
          onClose={() => setDescriptionOffcanvasVisible(false)}
          title="Function Description"
        >
          <Stack spacing={2} sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {selectedDescription.name}
            </Typography>
            <Typography variant="body1">{selectedDescription.description}</Typography>
          </Stack>
        </CippOffCanvas>
      </Stack>
    );
  };

  return (
    <>
      {/* The summary pane rides beside the form only where there is room for both; below xl
          it follows the form instead of squeezing it (the old 80%/30% flex split shrank both
          panes at every width and pushed the summary off a phone screen entirely). */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, xl: 9 }}>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Role Options
            </Typography>
            {!selectedRole && (
              <CippFormComponent
                type="textField"
                name="RoleName"
                label="Custom Role"
                placeholder="Enter a unique role name"
                formControl={formControl}
                validators={{ validate: validateRoleName }}
                fullWidth={true}
                required={true}
              />
            )}
            {selectedRole && isBaseRole && ["admin", "superadmin"].includes(selectedRole) && (
              <Alert color="warning" icon={<WarningOutlined />}>
                This is a highly privileged role and overrides any custom role restrictions.
              </Alert>
            )}
            {cippApiRoleSelected && (
              <Alert color="info">
                This is the default role for all API clients in the CIPP-API integration. If you
                would like different permissions for specific applications, create a role per
                application and select it from the CIPP-API integrations page.
              </Alert>
            )}
            <CippFormComponent
              type="autoComplete"
              name="EntraGroup"
              label="Entra Group Assignment"
              placeholder="Select an Entra Group to assign this role to, leave blank for none."
              api={{
                url: "/api/ExecCustomRole",
                data: { Action: "ListEntraGroups" },
                type: "GET",
                queryKey: "PartnerEntraGroups",
                dataKey: "Results",
                labelField: "displayName",
                valueField: "id",
                showRefresh: true,
              }}
              formControl={formControl}
              fullWidth={true}
              sortOptions={true}
              multiple={false}
              creatable={false}
              helperText="Assigning an Entra group will automatically assign this role to all users in that group. This does not work with users invited directly to Static Web App."
            />
          </Stack>
          {!isBaseRole && (
            <>
              <Stack spacing={1} sx={{ my: 3 }}>
                <CippFormTenantSelector
                  label="Allowed Tenants"
                  formControl={formControl}
                  type="multiple"
                  allTenants={true}
                  name="allowedTenants"
                  fullWidth={true}
                  includeGroups={true}
                  helperText="Select the tenants that users should have access to with this role."
                />
                {allTenantSelected && blockedTenants?.length == 0 && (
                  <Alert color="warning">
                    All tenants selected, no tenant restrictions will be applied unless blocked
                    tenants are specified.
                  </Alert>
                )}
              </Stack>
              {allTenantSelected && (
                <Box sx={{ mb: 3 }}>
                  <CippFormTenantSelector
                    label="Blocked Tenants"
                    formControl={formControl}
                    type="multiple"
                    allTenants={false}
                    name="blockedTenants"
                    fullWidth={true}
                    includeGroups={true}
                    helperText="Select tenants that this role should not have access to."
                  />
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <CippFormComponent
                  type="autoComplete"
                  name="BlockedEndpoints"
                  label="Blocked Endpoints"
                  placeholder="Select API endpoints to block for this role"
                  options={
                    apiPermissionSuccess
                      ? (() => {
                          const allEndpoints = [];
                          Object.keys(apiPermissions)
                            .sort()
                            .forEach((cat) => {
                              Object.keys(apiPermissions[cat])
                                .sort()
                                .forEach((obj) => {
                                  Object.keys(apiPermissions[cat][obj]).forEach((type) => {
                                    Object.keys(apiPermissions[cat][obj][type]).forEach(
                                      (apiKey) => {
                                        const apiFunction = apiPermissions[cat][obj][type][apiKey];
                                        const descriptionText = getFunctionDescriptionText(
                                          apiFunction.Description
                                        );
                                        allEndpoints.push({
                                          label: descriptionText
                                            ? `${apiFunction.Name} - ${descriptionText}`
                                            : apiFunction.Name,
                                          value: apiFunction.Name,
                                          category: `${cat}.${obj}.${type}`,
                                        });
                                      }
                                    );
                                  });
                                });
                            });
                          // Sort endpoints alphabetically within each category
                          return allEndpoints.sort((a, b) => {
                            if (a.category !== b.category) {
                              return a.category.localeCompare(b.category);
                            }
                            return a.label.localeCompare(b.label);
                          });
                        })()
                      : []
                  }
                  formControl={formControl}
                  fullWidth={true}
                  multiple={true}
                  creatable={false}
                  groupBy={(option) => option.category}
                  renderGroup={(params) => (
                    <li key={params.key}>
                      <GroupHeader>{params.group}</GroupHeader>
                      <GroupItems>{params.children}</GroupItems>
                    </li>
                  )}
                  helperText="Select specific API endpoints to block for this role, this overrides permission settings below."
                />
              </Box>
            </>
          )}
          <Box sx={{ mb: 3 }}>
            <CippFormComponent
              type="autoComplete"
              name="IPRange"
              label="Allowed IP Range (Single hosts or CIDR notation)"
              formControl={formControl}
              multiple={true}
              freeSolo={true}
              creatable={true}
              options={[]}
              placeholder="Type in the IP addresses and hit enter"
              helperText={
                selectedRole === "superadmin"
                  ? "IP restrictions are disabled for superadmin role to prevent lockout issues"
                  : "Leave empty to allow all IP addresses. Supports IPv4/IPv6 in CIDR notation (e.g., 192.168.1.0/24, 2001:db8::/32)"
              }
              fullWidth={true}
              disabled={selectedRole === "superadmin"}
            />
          </Box>
          {apiPermissionFetching && (
            <>
              <Typography variant="h5">
                <Skeleton width={150} />
              </Typography>
              <Stack
                direction="row"
                display="flex"
                alignItems="center"
                justifyContent={"space-between"}
                width={"100%"}
                sx={{ my: 2 }}
              >
                <Skeleton width={180} />
                <Box sx={{ pr: 5 }}>
                  <Skeleton width={300} height={40} />
                </Box>
              </Stack>
              {[...Array(5)].map((_, index) => (
                <Accordion variant="outlined" key={`skeleton-accordion-${index}`} disabled>
                  <AccordionSummary>
                    <Skeleton width={100} />
                  </AccordionSummary>
                </Accordion>
              ))}
            </>
          )}
          {apiPermissionSuccess && (
            <>
              {/* Display include/exclude patterns for base roles */}
              {isBaseRole && selectedRole && cippRoles[selectedRole]?.include && (
                <>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Defined Permissions
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: "bold", color: "success.main" }}
                    >
                      Include Patterns:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      These patterns define which permissions are included for this base role:
                    </Typography>
                    <Box sx={{ fontFamily: "monospace", fontSize: "0.875rem", mb: 2 }}>
                      {cippRoles[selectedRole].include.map((pattern, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            py: 0.5,
                            px: 1,
                            backgroundColor: "success.main",
                            color: "success.contrastText",
                            mb: 1,
                            borderRadius: 1,
                            opacity: 0.8,
                            display: "inline-block",
                            mr: 1,
                          }}
                        >
                          {pattern}
                        </Box>
                      ))}
                    </Box>

                    {cippRoles[selectedRole]?.exclude &&
                      cippRoles[selectedRole].exclude.length > 0 && (
                        <>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: "bold", color: "error.main" }}
                          >
                            Exclude Patterns:
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            These patterns define which permissions are explicitly excluded from
                            this base role:
                          </Typography>
                          <Box sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
                            {cippRoles[selectedRole].exclude.map((pattern, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  py: 0.5,
                                  px: 1,
                                  backgroundColor: "error.main",
                                  color: "error.contrastText",
                                  mb: 1,
                                  borderRadius: 1,
                                  opacity: 0.8,
                                  display: "inline-block",
                                  mr: 1,
                                }}
                              >
                                {pattern}
                              </Box>
                            ))}
                          </Box>
                        </>
                      )}
                  </Box>
                </>
              )}

              <Typography variant="h5" sx={{ mb: 2 }}>
                API Permissions
              </Typography>
              {!isBaseRole && (
                <ToggleButtonGroup
                  exclusive
                  value={permissionMode}
                  onChange={handleModeChange}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="simple">Simple (patterns)</ToggleButton>
                  <ToggleButton value="advanced">Advanced (per-category)</ToggleButton>
                </ToggleButtonGroup>
              )}
              {!isBaseRole && permissionMode === "simple" && (
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Alert color="info">
                    Simple mode works like CIPP's built-in roles: pick what to include, then carve
                    out exclusions. Wildcards (*) match anything, so rules automatically cover new
                    features added in future CIPP releases.
                  </Alert>
                  {gridDiverged && (
                    <Alert color="warning">
                      Changes made in Advanced mode are not reflected in these patterns. Saving in
                      Simple mode will replace the role's permissions with the patterns below.
                    </Alert>
                  )}
                  <CippFormComponent
                    type="autoComplete"
                    name="BaseRoleTemplate"
                    label="Start from a built-in role (optional)"
                    placeholder="Copy a built-in role's patterns as a starting point"
                    options={Object.keys(cippRoles).map((role) => ({
                      label: `${role} — include: ${cippRoles[role].include.join(", ") || "none"}${
                        cippRoles[role].exclude.length
                          ? `, exclude: ${cippRoles[role].exclude.join(", ")}`
                          : ""
                      }`,
                      value: role,
                    }))}
                    formControl={formControl}
                    fullWidth={true}
                    multiple={false}
                    creatable={false}
                    helperText="Replaces the patterns below with the selected role's include/exclude rules — edit them freely afterwards."
                  />
                  <CippFormComponent
                    type="autoComplete"
                    name="PermissionRulesInclude"
                    label="Include — grant access matching any of these"
                    placeholder="Pick a pattern or type your own, e.g. Identity.User.*"
                    options={ruleSuggestions}
                    formControl={formControl}
                    fullWidth={true}
                    multiple={true}
                    freeSolo={true}
                    creatable={true}
                    groupBy={(option) => option.category}
                    renderGroup={(params) => (
                      <li key={params.key}>
                        <GroupHeader>{params.group}</GroupHeader>
                        <GroupItems>{params.children}</GroupItems>
                      </li>
                    )}
                    helperText="Patterns match Category.Object.Level permission names. * matches anything."
                  />
                  <CippFormComponent
                    type="autoComplete"
                    name="PermissionRulesExclude"
                    label="Exclude — then deny anything matching these"
                    placeholder="e.g. Tenant.Administration.*"
                    options={ruleSuggestions}
                    formControl={formControl}
                    fullWidth={true}
                    multiple={true}
                    freeSolo={true}
                    creatable={true}
                    groupBy={(option) => option.category}
                    renderGroup={(params) => (
                      <li key={params.key}>
                        <GroupHeader>{params.group}</GroupHeader>
                        <GroupItems>{params.children}</GroupItems>
                      </li>
                    )}
                    helperText="Exclusions always win over inclusions, exactly like built-in roles."
                  />
                  {[...currentRules.Include, ...currentRules.Exclude]
                    .filter((pattern) => !validateRulePattern(pattern))
                    .map((pattern) => (
                      <Alert color="error" key={`invalid-${pattern}`}>
                        "{pattern}" is not a valid pattern. Use up to three dot-separated segments
                        of letters, numbers and *, e.g. Identity.User.Read or Exchange.*.
                      </Alert>
                    ))}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Live result
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
                      {currentRules.Include.map((pattern) => (
                        <Chip
                          key={`inc-${pattern}`}
                          size="small"
                          label={`${pattern} — ${ruleExpansion.includeCounts[pattern] ?? 0} match${
                            (ruleExpansion.includeCounts[pattern] ?? 0) === 1 ? "" : "es"
                          }`}
                          color={
                            (ruleExpansion.includeCounts[pattern] ?? 0) > 0 ? "success" : "warning"
                          }
                          icon={
                            (ruleExpansion.includeCounts[pattern] ?? 0) === 0 ? (
                              <WarningOutlined />
                            ) : undefined
                          }
                        />
                      ))}
                      {currentRules.Exclude.map((pattern) => (
                        <Chip
                          key={`exc-${pattern}`}
                          size="small"
                          label={`${pattern} — removes ${ruleExpansion.excludeCounts[pattern] ?? 0}`}
                          color={
                            (ruleExpansion.excludeCounts[pattern] ?? 0) > 0 ? "error" : "warning"
                          }
                          icon={
                            (ruleExpansion.excludeCounts[pattern] ?? 0) === 0 ? (
                              <WarningOutlined />
                            ) : undefined
                          }
                        />
                      ))}
                    </Stack>
                    {currentRules.Include.length === 0 ? (
                      <Alert color="warning">
                        Add at least one include pattern — a role with no inclusions grants no
                        access and cannot be saved.
                      </Alert>
                    ) : (
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2">
                          <strong>{ruleExpansion.matched.length}</strong> of{" "}
                          {permissionUniverse.length} permissions granted
                        </Typography>
                        <Button size="small" onClick={() => setRulePreviewVisible(true)}>
                          Preview effective permissions
                        </Button>
                      </Stack>
                    )}
                    {currentRules.Include.length > 0 && !coreCovered && (
                      <Alert color="info" sx={{ mt: 1 }}>
                        CIPP.Core.Read is required to sign in and will be added automatically when
                        you save.
                      </Alert>
                    )}
                  </Box>
                  <CippOffCanvas
                    visible={rulePreviewVisible}
                    onClose={() => setRulePreviewVisible(false)}
                    title="Effective Permissions"
                    size="lg"
                  >
                    <Stack spacing={1} sx={{ mx: 3 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Permissions granted by the current patterns — expand one to see the API
                        endpoints it serves. Struck-through entries were matched by an include
                        pattern but removed by an exclusion.
                      </Typography>
                      {ruleExpansion.matched.map((permission) => {
                        const [permCat, permObj, permType] = permission.split(".");
                        // A ReadWrite grant also serves the Read endpoints (enforcement
                        // matches loosely), so show them unless Read is granted separately.
                        const sections = [
                          { type: permType, endpoints: apiPermissions?.[permCat]?.[permObj]?.[permType] },
                        ];
                        if (
                          permType === "ReadWrite" &&
                          apiPermissions?.[permCat]?.[permObj]?.Read &&
                          !ruleExpansion.matched.includes(`${permCat}.${permObj}.Read`)
                        ) {
                          sections.push({
                            type: "Read (included by ReadWrite)",
                            endpoints: apiPermissions[permCat][permObj].Read,
                          });
                        }
                        const endpointCount = sections.reduce(
                          (total, section) => total + Object.keys(section.endpoints || {}).length,
                          0
                        );
                        return (
                          <Accordion variant="outlined" disableGutters key={permission}>
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{ "& .MuiAccordionSummary-content": { minWidth: 0 } }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                useFlexGap
                                flexWrap="wrap"
                                sx={{ minWidth: 0, width: "100%" }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: "monospace",
                                    wordBreak: "break-all",
                                    flexGrow: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  {permission}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={`${endpointCount} endpoint${endpointCount === 1 ? "" : "s"}`}
                                  sx={{ flexShrink: 0 }}
                                />
                              </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Stack spacing={1}>
                                {sections.map((section) => (
                                  <React.Fragment key={section.type}>
                                    {sections.length > 1 && (
                                      <Typography variant="subtitle2">{section.type}</Typography>
                                    )}
                                    {Object.keys(section.endpoints || {}).map((apiKey) => {
                                      const apiFunction = section.endpoints[apiKey];
                                      const description = getFunctionDescriptionText(
                                        apiFunction.Description
                                      );
                                      return (
                                        <Box key={apiKey}>
                                          <Typography
                                            variant="body2"
                                            sx={{ fontWeight: "bold" }}
                                          >
                                            {apiFunction.Name}
                                          </Typography>
                                          {description && (
                                            <Typography variant="caption" color="text.secondary">
                                              {description}
                                            </Typography>
                                          )}
                                        </Box>
                                      );
                                    })}
                                  </React.Fragment>
                                ))}
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                      {Object.entries(ruleExpansion.excludedBy).map(([permission, pattern]) => (
                        <Typography
                          key={permission}
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            textDecoration: "line-through",
                            color: "error.main",
                          }}
                        >
                          {permission} (excluded by {pattern})
                        </Typography>
                      ))}
                    </Stack>
                  </CippOffCanvas>
                </Stack>
              )}
              {(isBaseRole || permissionMode === "advanced") && (
                <>
                  {!isBaseRole && (
                    <Stack
                      direction="row"
                      display="flex"
                      alignItems="center"
                      justifyContent={"space-between"}
                      width={"100%"}
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2">Set All Permissions</Typography>

                      <Box sx={{ pr: 5 }}>
                        <CippFormComponent
                          type="radio"
                          name="Defaults"
                          options={[
                            {
                              label: "None",
                              value: "None",
                            },
                            { label: "Read", value: "Read" },
                            {
                              label: "Read / Write",
                              value: "ReadWrite",
                            },
                          ]}
                          formControl={formControl}
                          row={true}
                        />
                      </Box>
                    </Stack>
                  )}
                  <Box>
                    <>
                      {Object.keys(apiPermissions)
                        .sort()
                        .map((cat, catIndex) => (
                          <Accordion variant="outlined" key={`accordion-item-${catIndex}`}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              {cat}
                            </AccordionSummary>
                            <AccordionDetails>
                              {Object.keys(apiPermissions[cat])
                                .sort()
                                .map((obj, index) => {
                                  const readOnly = baseRolePermissions?.[cat] ? true : false;
                                  return (
                                    <Grid
                                      container
                                      key={`row-${catIndex}-${index}`}
                                      className="mb-3"
                                    >
                                      <ApiPermissionRow obj={obj} cat={cat} readOnly={readOnly} />
                                    </Grid>
                                  );
                                })}
                            </AccordionDetails>
                          </Accordion>
                        ))}
                    </>
                  </Box>
                </>
              )}
            </>
          )}
        </Grid>

        <Grid size={{ xs: 12, xl: 3 }}>
          {selectedEntraGroup && (
            <Alert color="info">
              This role will be assigned to the Entra Group:{" "}
              <strong>{selectedEntraGroup.label}</strong>
            </Alert>
          )}
          {selectedTenant?.length > 0 && (
            <>
              <h5>Allowed Tenants</h5>
              <ul>
                {selectedTenant.map((tenant, idx) => (
                  <li key={`allowed-tenant-${idx}`}>{tenant?.label}</li>
                ))}
              </ul>
            </>
          )}
          {blockedTenants?.length > 0 && (
            <>
              <h5>Blocked Tenants</h5>
              <ul>
                {blockedTenants.map((tenant, idx) => (
                  <li key={`blocked-tenant-${idx}`}>{tenant?.label}</li>
                ))}
              </ul>
            </>
          )}
          {blockedEndpoints?.length > 0 && (
            <>
              <h5>Blocked Endpoints</h5>
              <ul>
                {blockedEndpoints.map((endpoint, idx) => (
                  <li
                    key={`blocked-endpoint-${idx}`}
                    style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}
                  >
                    {endpoint?.label || endpoint?.value || endpoint}
                  </li>
                ))}
              </ul>
            </>
          )}
          {ipRanges?.length > 0 && (
            <>
              <h5>Allowed IP Ranges</h5>
              <ul>
                {ipRanges.map((ip, idx) => (
                  <li key={`ip-range-${idx}`}>{ip?.value || ip?.label || ip}</li>
                ))}
              </ul>
            </>
          )}
          {!isBaseRole && permissionMode === "simple" && currentRules.Include.length > 0 && (
            <>
              <h5>Permission Rules</h5>
              <ul>
                {currentRules.Include.map((pattern) => (
                  <li key={`summary-inc-${pattern}`} style={{ fontFamily: "monospace" }}>
                    + {pattern}
                  </li>
                ))}
                {currentRules.Exclude.map((pattern) => (
                  <li key={`summary-exc-${pattern}`} style={{ fontFamily: "monospace" }}>
                    − {pattern}
                  </li>
                ))}
              </ul>
              <Typography variant="body2">
                {ruleExpansion.matched.length} permissions granted
              </Typography>
            </>
          )}
          {(isBaseRole || permissionMode === "advanced") && selectedPermissions && apiPermissionSuccess && (
            <>
              <h5>Selected Permissions</h5>
              <ul>
                {selectedPermissions &&
                  Object.keys(selectedPermissions)
                    ?.sort()
                    .map((cat, idx) => (
                      <React.Fragment key={`permission-${idx}`}>
                        {selectedPermissions?.[cat] &&
                          typeof selectedPermissions[cat] === "string" &&
                          !selectedPermissions[cat]?.includes("None") && (
                            <li>{selectedPermissions[cat]}</li>
                          )}
                      </React.Fragment>
                    ))}
              </ul>
            </>
          )}
        </Grid>
      </Grid>

      <CippApiResults apiObject={updatePermissions} />
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          className="me-2"
          type="submit"
          variant="contained"
          disabled={
            updatePermissions.isPending ||
            customRoleListFetching ||
            apiPermissionFetching ||
            tenantsFetching ||
            !formState.isValid ||
            (!isBaseRole &&
              permissionMode === "simple" &&
              (currentRules.Include.length === 0 ||
                [...currentRules.Include, ...currentRules.Exclude].some(
                  (pattern) => !validateRulePattern(pattern)
                )))
          }
          startIcon={
            <SvgIcon fontSize="small">
              <Save />
            </SvgIcon>
          }
          onClick={handleSubmit}
        >
          Save
        </Button>
      </Stack>
    </>
  );
};

export default CippRoleAddEdit;
