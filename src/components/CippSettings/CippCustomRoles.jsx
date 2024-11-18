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
} from "@mui/material";

import Grid from "@mui/material/Grid2";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippOffCanvas } from "/src/components/CippComponents/CippOffCanvas";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import { Save } from "@mui/icons-material";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { useForm, useWatch } from "react-hook-form";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

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
  const currentRole = useWatch({ control: formControl.control, name: "RoleName" });
  const selectedTenant = useWatch({ control: formControl.control, name: "allowedTenants" });
  const blockedTenants = useWatch({ control: formControl.control, name: "blockedTenants" });
  const setDefaults = useWatch({ control: formControl.control, name: "Defaults" });
  const selectedPermissions = useWatch({ control: formControl.control, name: "Permissions" });

  const {
    data: apiPermissions = [],
    isFetching,
    isSuccess,
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

  const {
    data: tenants = [],
    isFetching: tenantsFetching,
    isSuccess: tenantsSuccess,
  } = ApiGetCall({
    url: "/api/ListTenants?AllTenantSelector=true",
    queryKey: "ListTenants-AllTenantSelector",
  });

  useEffect(() => {
    if (customRoleListSuccess && tenantsSuccess && selectedRole !== currentRole?.value) {
      setSelectedRole(currentRole?.value);
      if (currentRole?.value === "cipp-api") {
        setCippApiRoleSelected(true);
      } else {
        setCippApiRoleSelected(false);
      }

      var currentPermissions = customRoleList.find((role) => role.RowKey === currentRole?.value);
      formControl.reset({
        Permissions: currentPermissions?.Permissions,
        RoleName: currentRole,
        allowedTenants: currentPermissions?.AllowedTenants.map((tenant) => {
          var tenantInfo = tenants.find((t) => t.customerId === tenant);
          var label = `${tenantInfo?.displayName} (${tenantInfo?.defaultDomainName})`;
          if (tenantInfo) {
            return {
              label: label,
              value: tenantInfo.defaultDomainName,
            };
          }
        }),
        blockedTenants: currentPermissions?.BlockedTenants.map((tenant) => {
          var tenantInfo = tenants.find((t) => t.customerId === tenant);
          var label = `${tenantInfo?.displayName} (${tenantInfo?.defaultDomainName})`;

          if (tenantInfo) {
            return {
              label: label,
              value: tenant,
            };
          }
        }),
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
      console.log(newPermissions);
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
    if (alltenant && (blockedTenants?.length === 0 || !blockedTenants)) {
      setAllTenantSelected(true);
    } else {
      setAllTenantSelected(false);
    }
  }, [selectedTenant, blockedTenants]);

  const handleSubmit = async (values) => {
    //filter on only objects that are 'true'
    /*genericPostRequest({
      path: "/api/ExecCustomRole?Action=AddUpdate",
      values: {
        RoleName: values.RoleName.value,
        Permissions: values.Permissions,
        AllowedTenants: selectedTenant.map((tenant) => tenant.value),
        BlockedTenants: blockedTenants.map((tenant) => tenant.value),
      },
    }).then(() => {
      refetchCustomRoleList();
    });*/

    var allowedTenantIds = allowedTenants.map((tenant) => {
      var tenant = tenants.find((t) => t.defaultDomainName === tenant.value);
      return tenant.customerId;
    });

    var blockedTenantIds = blockedTenants.map((tenant) => {
      var tenant = tenants.find((t) => t.defaultDomainName === tenant.value);
      return tenant.customerId;
    });

    updatePermissions.mutate({
      url: "/api/ExecCustomRole?Action=AddUpdate",
      data: {
        RoleName: values.RoleName.value,
        Permissions: values.Permissions,
        AllowedTenants: allowedTenantIds,
        BlockedTenants: blockedTenantIds,
      },
    });
  };
  const handleDelete = async (values) => {
    /*ModalService.confirm({
      title: "Delete Custom Role",
      body: "Are you sure you want to delete this custom role? Any users with this role will have their permissions reset to the default for their base role.",
      onConfirm: () => {
        genericPostRequest({
          path: "/api/ExecCustomRole?Action=Delete",
          values: {
            RoleName: values.RoleName.value,
          },
        }).then(() => {
          refetchCustomRoleList();
        });
      },
    });*/
  };

  /*const WhenFieldChanges = ({ field, set }) => (
    <Field name={set} subscription={{}}>
      {(
        // No subscription. We only use Field to get to the change function
        { input: { onChange } }
      ) => (
        <FormSpy subscription={{}}>
          {({ form }) => (
            <OnChange name={field}>
              {(value) => {
                if (field === "RoleName" && value?.value) {
                  let customRole = customRoleList.filter(function (obj) {
                    return obj.RowKey === value.value;
                  });
                  if (customRole[0]?.RowKey === "CIPP-API") {
                    setCippApiRoleSelected(true);
                  } else {
                    setCippApiRoleSelected(false);
                  }

                  if (customRole === undefined || customRole === null || customRole.length === 0) {
                    return false;
                  } else {
                    if (set === "AllowedTenants") {
                      setSelectedTenant(customRole[0][set]);
                      var selectedTenantList = [];
                      tenants.map((tenant) => {
                        if (customRole[0][set].includes(tenant.customerId)) {
                          selectedTenantList.push({
                            label: tenant.displayName,
                            value: tenant.customerId,
                          });
                        }
                      });

                      tenantSelectorRef.current.setValue(selectedTenantList);
                    } else if (set === "BlockedTenants") {
                      setBlockedTenants(customRole[0][set]);
                      var blockedTenantList = [];
                      tenants.map((tenant) => {
                        if (customRole[0][set].includes(tenant.customerId)) {
                          blockedTenantList.push({
                            label: tenant.displayName,
                            value: tenant.customerId,
                          });
                        }
                      });

                      blockedTenantSelectorRef.current.setValue(blockedTenantList);
                    } else {
                      onChange(customRole[0][set]);
                    }
                  }
                }
                if (field === "Defaults") {
                  let newPermissions = {};
                  Object.keys(apiPermissions).forEach((cat) => {
                    Object.keys(apiPermissions[cat]).forEach((obj) => {
                      var newval = "";
                      if (cat == "CIPP" && obj == "Core" && value == "None") {
                        newval = "Read";
                      } else {
                        newval = value;
                      }
                      newPermissions[`${cat}${obj}`] = `${cat}.${obj}.${newval}`;
                    });
                  });
                  onChange(newPermissions);
                }
              }}
            </OnChange>
          )}
        </FormSpy>
      )}
    </Field>
  );
  WhenFieldChanges.propTypes = {
    field: PropTypes.node,
    set: PropTypes.string,
  };*/

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

        <Stack direction="row" spacing={1} xl={8}>
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
        {/*<CippOffCanvas visible={offcanvasVisible} hideFunction={() => setOffcanvasVisible(false)}>
          <h4 className="mt-2">{`${cat}.${obj}`}</h4>
          <p>
            Listed below are the available API endpoints based on permission level, ReadWrite level
            includes endpoints under Read.
          </p>
          {[apiPermissions[cat][obj]].map((permissions, key) => {
            var sections = Object.keys(permissions).map((type) => {
              var items = [];
              for (var api in permissions[type]) {
                items.push({ heading: "", content: permissions[type][api] });
              }
              return (
                <OffcanvasListSection items={items} key={key} title={type} showCardTitle={false} />
              );
            });
            return sections;
          })}
        </CippOffCanvas>*/}
      </Stack>
    );
  };

  return (
    <>
      <Stack spacing={3} xl={8} md={12} direction="row">
        <Box>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <CippFormComponent
              type="autoComplete"
              name="RoleName"
              label="Custom Role"
              options={customRoleList.map((role) => ({
                label: role.RowKey,
                value: role.RowKey,
              }))}
              isLoading={customRoleListFetching}
              refreshFunction={() => refetchCustomRoleList()}
              creatable={true}
              formControl={formControl}
              multiple={false}
              fullWidth={true}
            />
            {cippApiRoleSelected && (
              <Alert color="info">
                This role will limit access for the CIPP-API integration. It is not intended to be
                used for users.
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
            {allTenantSelected && (
              <Alert color="warning">
                All tenants selected, no tenant restrictions will be applied.
              </Alert>
            )}
          </Stack>
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

            <Box sx={{ pr: 3 }}>
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
                    <AccordionSummary>{cat}</AccordionSummary>
                    <AccordionDetails>
                      {Object.keys(apiPermissions[cat])
                        .sort()
                        .map((obj, index) => {
                          return (
                            <Grid container key={`row-${catIndex}-${index}`} className="mb-3">
                              <ApiPermissionRow obj={obj} cat={cat} />
                            </Grid>
                          );
                        })}
                    </AccordionDetails>
                  </Accordion>
                ))}
            </>
          </Box>
        </Box>

        <Box xl={4} md={12}>
          {selectedRole && selectedTenant?.length > 0 && (
            <>
              <h5>Allowed Tenants</h5>
              <ul>
                {selectedTenant.map((tenant, idx) => (
                  <li key={idx}>{tenant.label}</li>
                ))}
              </ul>
            </>
          )}
          {selectedRole && blockedTenants?.length > 0 && (
            <>
              <h5>Blocked Tenants</h5>
              <ul>
                {blockedTenants.map((tenant, idx) => (
                  <li key={idx}>{tenant.label}</li>
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
                        {!selectedPermissions[cat].includes("None") && (
                          <li key={idx}>{selectedPermissions[cat]}</li>
                        )}
                      </>
                    ))}
              </ul>
            </>
          )}
        </Box>
      </Stack>

      <Grid container className="mb-3">
        <Grid item xl={4} md={12}>
          <Button
            className="me-2"
            type="submit"
            variant="contained"
            startIcon={
              <SvgIcon fontSize="small">
                <Save />
              </SvgIcon>
            }
          >
            Save
          </Button>
          {/*<FormSpy subscription={{ values: true }}>
                {({ values }) => {
                  return (
                    <CButton
                      className="me-1"
                      onClick={() => handleDelete(values)}
                      disabled={!values["RoleName"]}
                    >
                      <FontAwesomeIcon
                        icon={postResults.isFetching ? "circle-notch" : "trash"}
                        spin={postResults.isFetching}
                        className="me-2"
                      />
                      Delete
                    </CButton>
                  );
                }}
              </FormSpy>*/}
        </Grid>
      </Grid>
    </>
  );
};

export default CippCustomRoles;
