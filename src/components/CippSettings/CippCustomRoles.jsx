import React, { useEffect, useRef, useState } from "react";

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

import Grid from "@mui/material/Grid2";
import { ApiGetCall, ApiGetCallWithPagination, ApiPostCall } from "../../api/ApiCall";
import { CippOffCanvas } from "/src/components/CippComponents/CippOffCanvas";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import { Save } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { useForm, useWatch } from "react-hook-form";
import { InformationCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiResults } from "../CippComponents/CippApiResults";

export const CippCustomRoles = () => {
  const updatePermissions = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["customRoleList"],
  });

  const [allTenantSelected, setAllTenantSelected] = useState(false);
  const [cippApiRoleSelected, setCippApiRoleSelected] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [updateDefaults, setUpdateDefaults] = useState(false);

  const formControl = useForm({
    mode: "onBlur",
  });

  const createDialog = useDialog();
  const currentRole = useWatch({ control: formControl.control, name: "RoleName" });
  const selectedTenant = useWatch({ control: formControl.control, name: "allowedTenants" });
  const blockedTenants = useWatch({ control: formControl.control, name: "blockedTenants" });
  const setDefaults = useWatch({ control: formControl.control, name: "Defaults" });
  const selectedPermissions = useWatch({ control: formControl.control, name: "Permissions" });

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
    refetch: refetchCustomRoleList,
  } = ApiGetCall({
    url: "/api/ExecCustomRole",
    queryKey: "customRoleList",
  });

  const { data: { pages = [] } = {}, isSuccess: tenantsSuccess } = ApiGetCallWithPagination({
    url: "/api/ListTenants?AllTenantSelector=true",
    queryKey: "ListTenants-AllTenantSelector",
  });
  const tenants = pages[0] || [];

  useEffect(() => {
    if (customRoleListSuccess && tenantsSuccess && selectedRole !== currentRole?.value) {
      setSelectedRole(currentRole?.value);
      if (currentRole?.value === "cipp-api") {
        setCippApiRoleSelected(true);
      } else {
        setCippApiRoleSelected(false);
      }

      var currentPermissions = customRoleList.find((role) => role.RowKey === currentRole?.value);

      var newAllowedTenants = [];
      currentPermissions?.AllowedTenants.map((tenant) => {
        var tenantInfo = tenants.find((t) => t.customerId === tenant);
        var label = `${tenantInfo?.displayName} (${tenantInfo?.defaultDomainName})`;
        if (tenantInfo?.displayName) {
          newAllowedTenants.push({
            label: label,
            value: tenantInfo.defaultDomainName,
          });
        }
      });

      var newBlockedTenants = [];
      currentPermissions?.BlockedTenants.map((tenant) => {
        var tenantInfo = tenants.find((t) => t.customerId === tenant);
        var label = `${tenantInfo?.displayName} (${tenantInfo?.defaultDomainName})`;
        if (tenantInfo?.displayName) {
          newBlockedTenants.push({
            label: label,
            value: tenantInfo.defaultDomainName,
          });
        }
      });

      formControl.reset({
        Permissions: currentPermissions?.Permissions,
        RoleName: currentRole,
        allowedTenants: newAllowedTenants,
        blockedTenants: newBlockedTenants,
      });
    }
  }, [currentRole, customRoleList, customRoleListSuccess, tenantsSuccess]);

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

  const handleSubmit = () => {
    var allowedTenantIds = [];
    selectedTenant.map((tenant) => {
      var tenant = tenants.find((t) => t.defaultDomainName === tenant?.value);
      if (tenant?.customerId) {
        allowedTenantIds.push(tenant.customerId);
      }
    });

    var blockedTenantIds = [];
    blockedTenants.map((tenant) => {
      var tenant = tenants.find((t) => t.defaultDomainName === tenant?.value);
      if (tenant?.customerId) {
        blockedTenantIds.push(tenant.customerId);
      }
    });

    updatePermissions.mutate({
      url: "/api/ExecCustomRole?Action=AddUpdate",
      data: {
        RoleName: currentRole.value,
        Permissions: selectedPermissions,
        AllowedTenants: allowedTenantIds,
        BlockedTenants: blockedTenantIds,
      },
    });
  };

  const ApiPermissionRow = ({ obj, cat }) => {
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

        <Stack direction="row" spacing={3} xl={8}>
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
              { label: "Read", value: `${cat}.${obj}.Read` },
              {
                label: "Read / Write",
                value: `${cat}.${obj}.ReadWrite`,
              },
            ]}
            formControl={formControl}
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
            <CippFormComponent
              type="autoComplete"
              name="RoleName"
              label="Custom Role"
              options={customRoleList.map((role) => ({
                label: role.RowKey,
                value: role.RowKey,
              }))}
              isFetching={customRoleListFetching}
              refreshFunction={() => refetchCustomRoleList()}
              creatable={true}
              formControl={formControl}
              multiple={false}
              fullWidth={true}
            />
            {cippApiRoleSelected && (
              <Alert color="info">
                This is the default role for all API clients in the CIPP-API integration. If you
                would like different permissions for specific applications, create a role per
                application and select it from the CIPP-API integrations page.
              </Alert>
            )}
          </Stack>
          <Stack spacing={1} sx={{ my: 3 }}>
            <CippFormTenantSelector
              label="Allowed Tenants"
              formControl={formControl}
              type="multiple"
              allTenants={true}
              name="allowedTenants"
              fullWidth={true}
            />
            {allTenantSelected && blockedTenants?.length == 0 && (
              <Alert color="warning">
                All tenants selected, no tenant restrictions will be applied unless blocked tenants
                are specified.
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
              />
            </Box>
          )}

          {currentRole && (
            <>
              {apiPermissionFetching && <Skeleton height={500} />}
              {apiPermissionSuccess && (
                <>
                  <Typography variant="h5">API Permissions</Typography>
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
                                  return (
                                    <Grid
                                      container
                                      key={`row-${catIndex}-${index}`}
                                      className="mb-3"
                                    >
                                      <ApiPermissionRow obj={obj} cat={cat} />
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
        </Box>

        <Box xl={3} md={12} width="30%">
          {selectedRole && selectedTenant?.length > 0 && (
            <>
              <h5>Allowed Tenants</h5>
              <ul>
                {selectedTenant.map((tenant, idx) => (
                  <li key={idx}>{tenant?.label}</li>
                ))}
              </ul>
            </>
          )}
          {selectedRole && blockedTenants?.length > 0 && (
            <>
              <h5>Blocked Tenants</h5>
              <ul>
                {blockedTenants.map((tenant, idx) => (
                  <li key={idx}>{tenant?.label}</li>
                ))}
              </ul>
            </>
          )}
          {selectedRole && selectedPermissions && (
            <>
              <h5>Selected Permissions</h5>
              <ul>
                {selectedPermissions &&
                  Object.keys(selectedPermissions)
                    ?.sort()
                    .map((cat, idx) => (
                      <>
                        {selectedPermissions?.[cat] &&
                          !selectedPermissions?.[cat]?.includes("None") && (
                            <li key={idx}>{selectedPermissions[cat]}</li>
                          )}
                      </>
                    ))}
              </ul>
            </>
          )}
        </Box>
      </Stack>

      <CippApiDialog
        createDialog={createDialog}
        title="Delete Custom Role"
        api={{
          confirmText:
            "Are you sure you want to delete this custom role? Any users with this role will have their permissions reset to the default for their base role.",
          url: "/api/ExecCustomRole?Action=Delete",
          type: "POST",
          data: {
            RoleName: `!${currentRole?.value}`,
          },
          relatedQueryKeys: ["customRoleList"],
        }}
        row={{}}
        formControl={formControl}
        relatedQueryKeys={"customRoleList"}
      />
      <CippApiResults apiObject={updatePermissions} />
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        {currentRole && (
          <Button
            className="me-2"
            type="button"
            variant="outlined"
            onClick={createDialog.handleOpen}
            startIcon={
              <SvgIcon fontSize="small">
                <TrashIcon />
              </SvgIcon>
            }
          >
            Delete
          </Button>
        )}
        <Button
          className="me-2"
          type="submit"
          variant="contained"
          disabled={updatePermissions.isPending || customRoleListFetching || !currentRole}
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

export default CippCustomRoles;
