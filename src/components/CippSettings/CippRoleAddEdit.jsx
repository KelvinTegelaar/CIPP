import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Alert,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  SvgIcon,
  Skeleton,
} from "@mui/material";

import { Grid } from "@mui/system";
import { ApiGetCall, ApiGetCallWithPagination, ApiPostCall } from "../../api/ApiCall";
import { CippOffCanvas } from "/src/components/CippComponents/CippOffCanvas";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import { Save, WarningOutlined } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { CippApiResults } from "../CippComponents/CippApiResults";
import cippRoles from "../../data/cipp-roles.json";
import { GroupHeader, GroupItems } from "../CippComponents/CippAutocompleteGrouping";

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

  const formControl = useForm({
    mode: "onChange",
  });

  const formState = useFormState({ control: formControl.control });

  const validateRoleName = (value) => {
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

  const { data: { pages = [] } = {}, isSuccess: tenantsSuccess } = ApiGetCallWithPagination({
    url: "/api/ListTenants?AllTenantSelector=true",
    queryKey: "ListTenants-AllTenantSelector",
  });
  const tenants = pages[0] || [];

  const matchPattern = (pattern, value) => {
    const regex = new RegExp(`^${pattern.replace("*", ".*")}$`);
    return regex.test(value);
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
          var tenantInfo = tenants.find((t) => t.customerId === item);
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
          var tenantInfo = tenants.find((t) => t.customerId === item);
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

      formControl.reset({
        Permissions:
          basePermissions && Object.keys(basePermissions).length > 0
            ? basePermissions
            : processPermissions(currentPermissions?.Permissions),
        RoleName: selectedRole ?? currentPermissions?.RowKey,
        allowedTenants: newAllowedTenants,
        blockedTenants: newBlockedTenants,
        BlockedEndpoints: processedBlockedEndpoints,
        EntraGroup: currentPermissions?.EntraGroup,
      });
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

    updatePermissions.mutate({
      url: "/api/ExecCustomRole?Action=AddUpdate",
      data: {
        RoleName: values?.["RoleName"],
        Permissions: selectedPermissions,
        EntraGroup: selectedEntraGroup,
        AllowedTenants: processedAllowedTenants,
        BlockedTenants: processedBlockedTenants,
        BlockedEndpoints: processedBlockedEndpoints,
      },
    });
  };

  const ApiPermissionRow = ({ obj, cat, readOnly }) => {
    const [offcanvasVisible, setOffcanvasVisible] = useState(false);

    var items = [];
    for (var key in apiPermissions[cat][obj])
      for (var key2 in apiPermissions[cat][obj][key]) {
        items.push({ heading: "", content: apiPermissions[cat][obj][key][key2] });
      }
    var group = [{ items: items }];

    return (
      <Stack
        direction="row"
        display="flex"
        alignItems="center"
        justifyContent={"space-between"}
        width={"100%"}
      >
        <Typography variant="h6">{obj}</Typography>
        <Stack direction="row" spacing={3} size={{ xl: 8 }}>
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
        <CippOffCanvas
          visible={offcanvasVisible}
          onClose={() => {
            setOffcanvasVisible(false);
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h3" sx={{ mx: 3 }}>
              {`${cat}.${obj}`}
            </Typography>
            <Typography variant="body1" sx={{ mx: 3 }}>
              Listed below are the available API endpoints based on permission level, ReadWrite
              level includes endpoints under Read.
            </Typography>
            {[apiPermissions[cat][obj]].map((permissions, key) => {
              var sections = Object.keys(permissions).map((type) => {
                var items = [];
                for (var api in permissions[type]) {
                  items.push({ heading: "", content: permissions[type][api] });
                }
                return (
                  <Stack key={key} spacing={2}>
                    <Typography variant="h4">{type}</Typography>
                    <Stack spacing={1}>
                      {items.map((item, idx) => (
                        <Stack key={idx} spacing={1}>
                          <Typography variant="body2">{item.content}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                );
              });
              return sections;
            })}
          </Stack>
        </CippOffCanvas>
      </Stack>
    );
  };

  return (
    <>
      <Stack spacing={3} direction="row">
        <Box width={"80%"}>
          <Stack spacing={1} sx={{ mb: 3 }}>
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
              }}
              formControl={formControl}
              fullWidth={true}
              sortOptions={true}
              multiple={false}
              creatable={false}
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
                  />
                </Box>
              )}

              {/* Blocked Endpoints */}
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
                                        allEndpoints.push({
                                          label: apiPermissions[cat][obj][type][apiKey],
                                          value: apiPermissions[cat][obj][type][apiKey],
                                          category: cat,
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
                />
              </Box>
            </>
          )}
          {apiPermissionFetching && <Skeleton variant="rectangle" height={500} />}
          {apiPermissionSuccess && (
            <>
              <Typography variant="h5">API Permissions</Typography>
              {!isBaseRole && (
                <Stack
                  direction="row"
                  display="flex"
                  alignItems="center"
                  justifyContent={"space-between"}
                  width={"100%"}
                  sx={{ my: 2 }}
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
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>{cat}</AccordionSummary>
                        <AccordionDetails>
                          {Object.keys(apiPermissions[cat])
                            .sort()
                            .map((obj, index) => {
                              const readOnly = baseRolePermissions?.[cat] ? true : false;
                              return (
                                <Grid container key={`row-${catIndex}-${index}`} className="mb-3">
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
        </Box>

        <Box size={{ md: 12, xl: 3 }} width="30%">
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
                  <li key={idx}>{tenant?.label}</li>
                ))}
              </ul>
            </>
          )}
          {blockedTenants?.length > 0 && (
            <>
              <h5>Blocked Tenants</h5>
              <ul>
                {blockedTenants.map((tenant, idx) => (
                  <li key={idx}>{tenant?.label}</li>
                ))}
              </ul>
            </>
          )}
          {blockedEndpoints?.length > 0 && (
            <>
              <h5>Blocked Endpoints</h5>
              <ul>
                {blockedEndpoints.map((endpoint, idx) => (
                  <li key={idx} style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    {endpoint?.label || endpoint?.value || endpoint}
                  </li>
                ))}
              </ul>
            </>
          )}
          {selectedPermissions && apiPermissionSuccess && (
            <>
              <h5>Selected Permissions</h5>
              <ul>
                {selectedPermissions &&
                  Object.keys(selectedPermissions)
                    ?.sort()
                    .map((cat, idx) => (
                      <>
                        {selectedPermissions?.[cat] &&
                          typeof selectedPermissions[cat] === "string" &&
                          !selectedPermissions[cat]?.includes("None") && (
                            <li key={idx}>{selectedPermissions[cat]}</li>
                          )}
                      </>
                    ))}
              </ul>
            </>
          )}
        </Box>
      </Stack>

      <CippApiResults apiObject={updatePermissions} />
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          className="me-2"
          type="submit"
          variant="contained"
          disabled={updatePermissions.isPending || customRoleListFetching || !formState.isValid}
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
