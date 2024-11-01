import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Grid,
  Alert,
  Skeleton,
  IconButton,
  SvgIcon,
  Stack,
  Chip,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";

import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { CippDataTable } from "../CippTable/CippDataTable";
import { useDialog } from "../../hooks/use-dialog";
import { PlusIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import CippFormComponent from "./CippFormComponent";
import { Delete, Download, Save, Undo, Upload, WarningAmberOutlined } from "@mui/icons-material";
import { useWatch } from "react-hook-form";
import { CippCardTabPanel } from "./CippCardTabPanel";
import { CippApiResults } from "./CippApiResults";
import _ from "lodash";

const CippAppPermissionBuilder = ({
  onSubmit,
  updatePermissions,
  currentPermissions = {},
  removePermissionConfirm = false,
  appDisplayName = "CIPP-SAM",
  formControl,
}) => {
  const [selectedApp, setSelectedApp] = useState([]);
  const [permissionsImported, setPermissionsImported] = useState(false);
  const [newPermissions, setNewPermissions] = useState({});
  const [importedManifest, setImportedManifest] = useState(null);
  const [manifestVisible, setManifestVisible] = useState(false);
  const [calloutMessage, setCalloutMessage] = useState(null);
  const [initialPermissions, setInitialPermissions] = useState();
  const removePermissionDialog = useDialog();
  const resetPermissionDialog = useDialog();
  const additionalPermissionsDialog = useDialog();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const currentSelectedSp = useWatch({ control: formControl.control, name: "servicePrincipal" });
  const {
    data: servicePrincipals = [],
    isSuccess: spSuccess,
    isFetching: spFetching,
    isLoading: spLoading,
    refetch: refetchSpList,
  } = ApiGetCall({
    url: "/api/ExecServicePrincipals",
    queryKey: "execServicePrincipals",
    waiting: true,
  });

  const removeServicePrincipal = useCallback(
    (appId) => {
      const newServicePrincipals = selectedApp.filter((sp) => sp?.appId !== appId);

      if (removePermissionConfirm) {
        removePermissionDialog.handleOpen();
        return;
      }

      // Only update selectedApp if there is a change
      setSelectedApp((prevSelectedApp) => {
        if (prevSelectedApp.length !== newServicePrincipals.length) {
          return newServicePrincipals;
        }
        return prevSelectedApp;
      });

      // Update newPermissions by creating a shallow copy and deleting the entry
      setNewPermissions((prevPermissions) => {
        if (prevPermissions.Permissions[appId]) {
          const updatedPermissions = {
            ...prevPermissions,
            Permissions: { ...prevPermissions.Permissions },
          };
          delete updatedPermissions.Permissions[appId];
          return updatedPermissions;
        }
        return prevPermissions;
      });
    },
    [selectedApp, newPermissions, removePermissionConfirm, removePermissionDialog]
  );

  const createServicePrincipal = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["execServicePrincipals"],
  });

  const confirmReset = () => {
    if (removePermissionConfirm) {
      resetPermissionDialog.handleOpen();
    } else {
      setSelectedApp([]);
      setPermissionsImported(false);
      setManifestVisible(false);
      setCalloutMessage("Permissions reset to default.");
    }
  };

  const handleSubmit = (values) => {
    if (onSubmit) {
      var postBody = {
        Permissions: newPermissions.Permissions,
      };
      onSubmit(postBody);
    }
  };

  const onCreateServicePrincipal = (e, appId) => {
    if (typeof appId === "string") {
    }

    createServicePrincipal.mutate(
      {
        url: "api/ExecServicePrincipals?Action=Create&AppId=" + appId,
        data: {},
      },
      {
        onSuccess: () => {
          refetchSpList();
          setCalloutMessage(createServicePrincipal?.data?.Results);
        },
      }
    );
  };

  const savePermissionChanges = (
    servicePrincipal,
    applicationPermissions,
    delegatedPermissions
  ) => {
    setNewPermissions((prevPermissions) => {
      const updatedPermissions = {
        ...prevPermissions,
        Permissions: {
          ...prevPermissions.Permissions,
          [servicePrincipal]: {
            applicationPermissions,
            delegatedPermissions,
          },
        },
      };
      return updatedPermissions;
    });

    setExpanded(false);
  };

  const generateManifest = ({ appDisplayName = "CIPP-SAM", prompt = false }) => {
    if (prompt || appDisplayName === "") {
      ModalService.prompt({
        title: "Generate Manifest",
        body: "Please enter the display name for the application.",
        onConfirm: (value) => {
          generateManifest({ appDisplayName: value });
        },
      });
    } else {
      var manifest = {
        isFallbackPublicClient: true,
        signInAudience: "AzureADMultipleOrgs",
        displayName: appDisplayName,
        web: {
          redirectUris: [
            "https://login.microsoftonline.com/common/oauth2/nativeclient",
            "https://localhost",
            "http://localhost",
            "http://localhost:8400",
          ],
        },
        requiredResourceAccess: [],
      };

      var additionalPermissions = [];

      selectedApp.map((sp) => {
        var appRoles = newPermissions?.Permissions[sp.appId]?.applicationPermissions;
        var delegatedPermissions = newPermissions?.Permissions[sp.appId]?.delegatedPermissions;
        var requiredResourceAccess = {
          resourceAppId: sp.appId,
          resourceAccess: [],
        };
        var additionalRequiredResourceAccess = {
          resourceAppId: sp.appId,
          resourceAccess: [],
        };
        if (appRoles) {
          appRoles.map((role) => {
            requiredResourceAccess.resourceAccess.push({
              id: role.id,
              type: "Role",
            });
          });
        }
        if (delegatedPermissions) {
          delegatedPermissions.map((perm) => {
            // permission not a guid skip
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(perm.id)) {
              requiredResourceAccess.resourceAccess.push({
                id: perm.id,
                type: "Scope",
              });
            } else {
              additionalRequiredResourceAccess.resourceAccess.push({
                id: perm.id,
                type: "Scope",
              });
            }
          });
        }
        if (requiredResourceAccess.resourceAccess.length > 0) {
          manifest.requiredResourceAccess.push(requiredResourceAccess);
        }
        if (additionalRequiredResourceAccess.resourceAccess.length > 0) {
          additionalPermissions.push(additionalRequiredResourceAccess);
        }
      });

      var fileName = `${appDisplayName.replace(" ", "-")}.json`;
      if (appDisplayName === "CIPP-SAM") {
        fileName = "SAMManifest.json";
      }

      var blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}`;
      a.click();
      URL.revokeObjectURL(url);

      if (additionalPermissions.length > 0) {
        /*ModalService.confirm({
          title: "Additional Permissions",
          body: "Some permissions are not supported in the manifest. Would you like to download them?",
          confirmLabel: "Download",
          onConfirm: () => {
            var additionalBlob = new Blob([JSON.stringify(additionalPermissions, null, 2)], {
              type: "application/json",
            });
            var additionalUrl = URL.createObjectURL(additionalBlob);
            var additionalA = document.createElement("a");
            additionalA.href = additionalUrl;
            additionalA.download = "AdditionalPermissions.json";
            additionalA.click();
            URL.revokeObjectURL(additionalUrl);
          },
        });*/
        additionalPermissionsDialog.handleOpen();
      }
    }
  };

  const importManifest = () => {
    var updatedPermissions = { Permissions: {} };
    var manifest = importedManifest;
    var requiredResourceAccess = manifest.requiredResourceAccess;
    var selectedServicePrincipals = [];

    requiredResourceAccess.map((resourceAccess) => {
      var sp = servicePrincipals?.Results?.find((sp) => sp.appId === resourceAccess.resourceAppId);
      if (sp) {
        var appRoles = [];
        var delegatedPermissions = [];
        selectedServicePrincipals.push(sp);
        resourceAccess.resourceAccess.map((access) => {
          if (access.type === "Role") {
            var role = sp.appRoles.find((role) => role.id === access.id);
            if (role) {
              appRoles.push({
                id: role.id,
                value: role.value,
              });
            }
          } else if (access.type === "Scope") {
            var scope = sp.publishedPermissionScopes.find((scope) => scope.id === access.id);
            if (scope) {
              delegatedPermissions.push({
                id: scope.id,
                value: scope.value,
              });
            }
          }
        });
        updatedPermissions.Permissions[sp.appId] = {
          applicationPermissions: appRoles,
          delegatedPermissions: delegatedPermissions,
        };
      }
    });
    setNewPermissions(updatedPermissions);
    setSelectedApp(selectedServicePrincipals);
    setImportedManifest(null);
    setPermissionsImported(true);
    setManifestVisible(false);
    setCalloutMessage("Manifest imported successfully.");
  };

  const onManifestImport = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        try {
          var manifest = JSON.parse(reader.result);
          setImportedManifest(manifest);
        } catch {
          console.log("invalid manifest");
        }
      };
      reader.readAsText(file);
    });
  }, []);

  useEffect(() => {
    if (spSuccess) {
      try {
        var initialAppIds = Object.keys(currentPermissions?.Permissions);
      } catch {
        initialAppIds = [];
      }

      if (selectedApp.length == 0 && initialAppIds.length == 0) {
        var microsoftGraph = servicePrincipals?.Results?.find(
          (sp) => sp?.appId === "00000003-0000-0000-c000-000000000000"
        );
        setSelectedApp([microsoftGraph]);
        setNewPermissions({
          Permissions: {
            "00000003-0000-0000-c000-000000000000": {
              applicationPermissions: [],
              delegatedPermissions: [],
            },
          },
        });
      } else if (currentPermissions !== initialPermissions) {
        setSelectedApp([]);
        setNewPermissions(currentPermissions);
        setInitialPermissions(currentPermissions);
        setPermissionsImported(false);
      } else if (initialAppIds.length > 0 && permissionsImported == false) {
        const newApps = servicePrincipals?.Results?.filter((sp) =>
          initialAppIds.includes(sp.appId)
        )?.sort((a, b) => a.displayName.localeCompare(b.displayName));

        setSelectedApp((prevApps) => {
          if (JSON.stringify(prevApps) !== JSON.stringify(newApps)) {
            return newApps;
          }
          return prevApps;
        });

        setNewPermissions(currentPermissions);
        setInitialPermissions(currentPermissions);
        setPermissionsImported(true);
      }
    }
  }, [
    currentPermissions,
    initialPermissions,
    permissionsImported,
    selectedApp,
    servicePrincipals,
    spSuccess,
  ]);

  const getPermissionCounts = (appId) => {
    var appRoles = newPermissions?.Permissions[appId]?.applicationPermissions;
    var delegatedPermissions = newPermissions?.Permissions[appId]?.delegatedPermissions;

    var counts = `${appRoles?.length ?? 0}/${delegatedPermissions?.length ?? 0}`;
    return (
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "flex-start" }}
        spacing={2}
      >
        <SvgIcon fontSize="small" sx={{ mr: 1 }}>
          <ShieldCheckIcon />
        </SvgIcon>
        {counts}
      </Stack>
    );
  };

  const ApiPermissionRow = ({ servicePrincipal = null, spPermissions, formControl }) => {
    const [value, setValue] = useState(0);
    const [spInitialized, setSpInitialized] = useState(false);
    const [appTable, setAppTable] = useState([]);
    const [delegatedTable, setDelegatedTable] = useState([]);
    const [permissionsChanged, setPermissionsChanged] = useState(false);

    const {
      data: spInfo = [],
      isSuccess: spInfoSuccess,
      isFetching: spInfoFetching,
    } = ApiGetCall({
      url: `/api/ExecServicePrincipals?Id=${servicePrincipal.id}`,
      queryKey: `execServicePrincipals-${servicePrincipal.id}`,
      waiting: true,
    });

    const currentAppPermission = useWatch({
      control: formControl.control,
      name: `Permissions.${servicePrincipal.appId}.applicationPermissions`,
    });
    const currentDelegatedPermission = useWatch({
      control: formControl.control,
      name: `Permissions.${servicePrincipal.appId}.delegatedPermissions`,
    });

    useEffect(() => {
      if (spInfoSuccess && !spInitialized) {
        if (appTable.length === 0) {
          setAppTable(
            spPermissions?.applicationPermissions
              ?.sort((a, b) => a.value.localeCompare(b.value))
              ?.map((perm) => ({
                id: perm.id,
                value: perm.value,
                description: spInfo?.Results?.appRoles.find((role) => role.id === perm.id)
                  ?.description,
              }))
          );
        }
        if (delegatedTable.length === 0) {
          setDelegatedTable(
            spPermissions?.delegatedPermissions
              ?.sort((a, b) => a.value.localeCompare(b.value))
              ?.map((perm) => ({
                id: perm.id,
                value: perm.value,
                description:
                  spInfo?.Results?.publishedPermissionScopes.find((scope) => scope.id === perm.id)
                    ?.userConsentDescription ?? "Manually added",
              }))
          );
        }
        setSpInitialized(true);
      }
    }, [spInitialized, spInfoSuccess, appTable?.length, delegatedTable?.length]);

    useEffect(() => {
      if (spInfoSuccess) {
        var appRoles = appTable?.map((perm) => perm.id).sort();
        var delegatedPermissions = delegatedTable?.map((perm) => perm.id).sort();
        var originalAppRoles = spPermissions?.applicationPermissions.map((perm) => perm.id).sort();
        var originalDelegatedPermissions = spPermissions?.delegatedPermissions
          .map((perm) => perm.id)
          .sort();
        if (
          JSON.stringify(appRoles) !== JSON.stringify(originalAppRoles) ||
          JSON.stringify(delegatedPermissions) !== JSON.stringify(originalDelegatedPermissions)
        ) {
          setPermissionsChanged(true);
        } else {
          setPermissionsChanged(false);
        }
      }
    }, [appTable, delegatedTable, spInfoSuccess, spPermissions]);

    const handleAddRow = (permissionType, permission) => {
      if (permissionType === "applicationPermissions") {
        var newAppPermission = {
          id: permission.value,
          value: permission.label,
          description: spInfo?.Results?.appRoles.find((role) => role.id === permission.value)
            ?.description,
        };
        setAppTable([...(appTable ?? []), newAppPermission]);
        formControl.setValue(`Permissions.${servicePrincipal.appId}.applicationPermissions`, null);
      } else {
        var newDelegatedPermission = {
          id: permission.value,
          value: permission.label,
          description: spInfo?.Results?.publishedPermissionScopes.find(
            (scope) => scope.id === permission.value
          )?.userConsentDescription,
        };
        setDelegatedTable([...(delegatedTable ?? []), newDelegatedPermission]);
        formControl.setValue(`Permissions.${servicePrincipal.appId}.delegatedPermissions`, null);
      }
    };

    const handleRemoveRow = (permissionType, permission) => {
      if (permission?.id) {
        if (permissionType === "applicationPermissions") {
          setAppTable((prevAppTable) => prevAppTable.filter((perm) => perm.id !== permission.id));
        } else {
          setDelegatedTable((prevDelegatedTable) =>
            prevDelegatedTable.filter((perm) => perm.id !== permission.id)
          );
        }
      }
    };

    const handleSavePermissions = () => {
      savePermissionChanges(
        servicePrincipal.appId,
        appTable.map((perm) => ({ id: perm.id, value: perm.value })),
        delegatedTable.map((perm) => ({ id: perm.id, value: perm.value }))
      );
    };

    function tabProps(index) {
      return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
      };
    }

    const handleTabChange = (event, newValue) => {
      setValue(newValue);
    };

    return (
      <>
        {servicePrincipal && spInfoSuccess && (
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Manage the permissions for the {servicePrincipal.displayName}.
            </Typography>

            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                  value={value}
                  onChange={handleTabChange}
                  aria-label={`Permissions for ${servicePrincipal.displayName}`}
                >
                  <Tab label="Application" {...tabProps(0)} />
                  <Tab label="Delegated" {...tabProps(1)} />
                </Tabs>
              </Box>
              <CippCardTabPanel value={value} index={0}>
                {servicePrincipal?.appRoles?.length > 0 ? (
                  <>
                    <Stack spacing={2}>
                      <Grid container sx={{ display: "flex", alignItems: "center" }} spacing={2}>
                        <Grid item xl={8} xs={12}>
                          <CippFormComponent
                            type="autoComplete"
                            label="Application Permissions"
                            name={`Permissions.${servicePrincipal.appId}.applicationPermissions`}
                            isFetching={spInfoFetching}
                            options={spInfo?.Results?.appRoles
                              ?.filter((role) => !appTable.find((perm) => perm.id === role.id))
                              .map((role) => ({
                                label: role.value,
                                value: role.id,
                              }))}
                            formControl={formControl}
                            multiple={false}
                          />
                        </Grid>
                        <Grid item>
                          <Tooltip title="Add Permission">
                            <div
                              onClick={() =>
                                handleAddRow("applicationPermissions", currentAppPermission)
                              }
                            >
                              <Button variant="outlined" disabled={!currentAppPermission}>
                                <SvgIcon fontSize="small">
                                  <PlusIcon />
                                </SvgIcon>
                              </Button>
                            </div>
                          </Tooltip>
                        </Grid>
                      </Grid>
                      <CippDataTable
                        title={`${servicePrincipal.displayName} Application Permissions`}
                        noCard={true}
                        data={appTable}
                        simpleColumns={["value", "description"]}
                        actions={[
                          {
                            label: "Delete Permission",
                            icon: <Delete />,
                            noConfirm: true,
                            customFunction: (row) => handleRemoveRow("applicationPermissions", row),
                          },
                        ]}
                      />
                    </Stack>
                  </>
                ) : (
                  <Alert color="warning" icon={<WarningAmberOutlined />} sx={{ mb: 3 }}>
                    No Application Permissions found.
                  </Alert>
                )}
              </CippCardTabPanel>
              <CippCardTabPanel value={value} index={1}>
                <Stack spacing={2}>
                  {spInfo?.Results?.publishedPermissionScopes?.length === 0 && (
                    <Alert color="warning" icon={<WarningAmberOutlined />}>
                      No Published Delegated Permissions found.
                    </Alert>
                  )}
                  <Grid container sx={{ display: "flex", alignItems: "center" }} spacing={2}>
                    <Grid item xl={8} xs={12}>
                      <CippFormComponent
                        type="autoComplete"
                        label="Delegated Permissions"
                        name={`Permissions.${servicePrincipal.appId}.delegatedPermissions`}
                        isFetching={spInfoFetching}
                        options={spInfo?.Results?.publishedPermissionScopes
                          ?.filter((scope) => !delegatedTable.find((perm) => perm.id === scope.id))
                          .map((scope) => ({
                            label: scope.value,
                            value: scope.id,
                          }))}
                        formControl={formControl}
                        multiple={false}
                      />
                    </Grid>
                    <Grid item sx={{ ms: 2 }}>
                      <Tooltip title="Add Permission">
                        <div
                          onClick={() =>
                            handleAddRow("delegatedPermissions", currentDelegatedPermission)
                          }
                        >
                          <Button variant="outlined" disabled={!currentDelegatedPermission}>
                            <SvgIcon fontSize="small">
                              <PlusIcon />
                            </SvgIcon>
                          </Button>
                        </div>
                      </Tooltip>
                    </Grid>
                  </Grid>

                  <CippDataTable
                    noCard={true}
                    sx={{ width: "100%" }}
                    title={`${servicePrincipal.displayName} Delegated Permissions`}
                    data={delegatedTable}
                    simpleColumns={["value", "description"]}
                    actions={[
                      {
                        label: "Delete Permission",
                        icon: <Delete />,
                        noConfirm: true,
                        customFunction: (row) => handleRemoveRow("delegatedPermissions", row),
                      },
                    ]}
                  />
                </Stack>
              </CippCardTabPanel>

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSavePermissions}
                disabled={!permissionsChanged}
              >
                Save Changes
              </Button>
            </Box>
          </>
        )}
      </>
    );
  };

  return (
    <>
      {spLoading && <Skeleton height={300} />}
      {spSuccess && (
        <>
          <Grid container>
            <Grid item xl={12} md={12} sx={{ mb: 3 }}>
              <Grid
                container
                sx={{ display: "flex", mb: 3, alignItems: "center" }}
                justifyContent="space-between"
              >
                <Grid item xl={8}>
                  {servicePrincipals?.Metadata?.Success && (
                    <CippFormComponent
                      type="autoComplete"
                      fullWidth
                      label="Select a Service Principal or enter an AppId if not listed"
                      name="servicePrincipal"
                      createOption={true}
                      onChange={onCreateServicePrincipal}
                      isFetching={spFetching}
                      options={servicePrincipals?.Results.map((sp) => {
                        return { label: `${sp.displayName} (${sp.appId})`, value: sp.appId };
                      })}
                      formControl={formControl}
                      multiple={false}
                    />
                  )}
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Add Service Principal">
                      <div
                        onClick={(e) => {
                          setSelectedApp([
                            ...selectedApp,
                            servicePrincipals?.Results?.find(
                              (sp) => sp.appId === currentSelectedSp.value
                            ),
                          ]);
                          formControl.setValue("servicePrincipal", null);
                        }}
                      >
                        <Button
                          variant="contained"
                          component={!currentSelectedSp?.value ? "span" : undefined}
                          disabled={!currentSelectedSp?.value}
                        >
                          <SvgIcon fontSize="small">
                            <PlusIcon />
                          </SvgIcon>
                        </Button>
                      </div>
                    </Tooltip>

                    <Tooltip title="Reset to Default">
                      <Button
                        onClick={() => {
                          confirmReset();
                        }}
                        variant="outlined"
                      >
                        <SvgIcon fontSize="small">
                          <Undo />
                        </SvgIcon>
                      </Button>
                    </Tooltip>
                    <Tooltip title="Download Manifest">
                      <Button
                        variant="outlined"
                        onClick={() => {
                          generateManifest({ appDisplayName: appDisplayName });
                        }}
                        className={`circular-button`}
                      >
                        <SvgIcon fontSize="small">
                          <Download />
                        </SvgIcon>
                      </Button>
                    </Tooltip>

                    <Tooltip title="Import Manifest">
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setManifestVisible(true);
                        }}
                        className={`circular-button`}
                      >
                        <SvgIcon fontSize="small">
                          <Upload />
                        </SvgIcon>
                      </Button>
                    </Tooltip>
                  </Stack>
                </Grid>
              </Grid>
              {/*<CippOffcanvas
                title="Import Manifest"
                visible={manifestVisible}
                onHide={() => {
                  setManifestVisible(false);
                }}
              >
                <Grid container>
                  <Grid item xl={12}>
                    <p>
                      Import a JSON application manifest to set permissions. This will overwrite any
                      existing permissions.
                    </p>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xl={12}>
                    <CippDropzone
                      onDrop={onManifestImport}
                      accept={{ "application/json": [".json"] }}
                      dropMessage="Drag a JSON app manifest here, or click to select one."
                      maxFiles={1}
                      returnCard={false}
                    />
                  </Grid>
                </Grid>
                {importedManifest && (
                  <>
                    <Grid container className="mt-4">
                      <Grid item xl={12}>
                        <Button
                          onClick={() => importManifest()}
                          startIcon={
                            <SvgIcon fontSize="small">
                              <Save />
                            </SvgIcon>
                          }
                        >
                          Import
                        </Button>
                      </Grid>
                    </Grid>
                    <Grid container className="mt-3">
                      <Grid item xl={12}>
                        <h4>Preview</h4>
                        <CippCodeBlock
                          code={JSON.stringify(importedManifest, null, 2)}
                          language="json"
                          showLineNumbers={false}
                        />
                      </Grid>
                    </Grid>
                  </>
                )}
              </CippOffcanvas>*/}
              {calloutMessage && (
                <Grid container sx={{ mb: 2 }}>
                  <Grid item>
                    <Alert variant="outlined" color="info">
                      {calloutMessage}
                    </Alert>
                  </Grid>
                </Grid>
              )}

              {newPermissions?.MissingPermissions &&
                newPermissions?.Type === "Table" &&
                Object.keys(newPermissions?.MissingPermissions).length > 0 && (
                  <Grid container>
                    <Grid item>
                      <Alert color="warning" icon={<WarningAmberOutlined />}>
                        <Grid container>
                          <Grid item xl={10} sm={12}>
                            <b>New Permissions Available</b>
                            {Object.keys(newPermissions?.MissingPermissions).map((perm) => {
                              // translate appid to display name
                              var sp = servicePrincipals?.Results?.find((sp) => sp.appId === perm);
                              return (
                                <div key={`missing-${perm}`}>
                                  {sp?.displayName}:{" "}
                                  {Object.keys(newPermissions?.MissingPermissions[perm]).map(
                                    (type) => {
                                      return (
                                        <>
                                          {newPermissions?.MissingPermissions[perm][type].length >
                                            0 && (
                                            <span key={`missing-${perm}-${type}`}>
                                              {type == "applicationPermissions"
                                                ? "Application"
                                                : "Delegated"}{" "}
                                              -{" "}
                                              {newPermissions?.MissingPermissions[perm][type]
                                                .map((p) => {
                                                  return p.value;
                                                })
                                                .join(", ")}
                                            </span>
                                          )}
                                        </>
                                      );
                                    }
                                  )}
                                </div>
                              );
                            })}
                          </Grid>
                          <Grid item xl={2} sm={12} className="my-auto">
                            <Tooltip text="Add Missing Permissions">
                              <IconButton
                                onClick={() => {
                                  var updatedPermissions = JSON.parse(
                                    JSON.stringify(newPermissions)
                                  );
                                  Object.keys(newPermissions?.MissingPermissions).map((perm) => {
                                    Object.keys(newPermissions?.MissingPermissions[perm]).map(
                                      (type) => {
                                        if (!updatedPermissions.Permissions[perm][type]) {
                                          updatedPermissions.Permissions[perm][type] = [];
                                        }
                                        newPermissions?.MissingPermissions[perm][type].map((p) => {
                                          updatedPermissions.Permissions[perm][type].push(p);
                                        });
                                      }
                                    );
                                  });
                                  updatedPermissions.MissingPermissions = {};
                                  setNewPermissions(updatedPermissions);
                                }}
                              >
                                <SvgIcon fontSize="small">
                                  <WrenchIcon />
                                </SvgIcon>
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Alert>
                    </Grid>
                  </Grid>
                )}

              <>
                {selectedApp &&
                  selectedApp?.length > 0 &&
                  selectedApp?.map((sp, spIndex) => (
                    <Accordion
                      expanded={expanded === sp.appId}
                      key={`accordion-item-${spIndex}-${sp?.appId}`}
                      variant="outlined"
                      onChange={handleChange(sp.appId)}
                    >
                      <AccordionSummary>
                        <Stack
                          direction="row"
                          spacing={2}
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ width: "100%" }}
                        >
                          <Box>{sp.displayName}</Box>
                          <Stack direction="row" spacing={2}>
                            <Tooltip title="Application/Delegated">
                              <Chip
                                color="info"
                                variant="outlined"
                                label={getPermissionCounts(sp.appId)}
                                sx={{ width: "100px" }}
                              />
                            </Tooltip>
                            <Tooltip
                              title={
                                sp.appId === "00000003-0000-0000-c000-000000000000"
                                  ? "You can't remove Microsoft Graph"
                                  : `Remove ${sp.displayName}`
                              }
                            >
                              <div
                                onClick={() => {
                                  removeServicePrincipal(sp.appId);
                                }}
                              >
                                <IconButton
                                  disabled={sp.appId === "00000003-0000-0000-c000-000000000000"}
                                  color="error"
                                >
                                  <SvgIcon fontSize="small">
                                    <Delete />
                                  </SvgIcon>
                                </IconButton>
                              </div>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <ApiPermissionRow
                          servicePrincipal={sp}
                          spPermissions={newPermissions?.Permissions?.[sp.appId]}
                          formControl={formControl}
                          key={`apirow-${spIndex}`}
                        />
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </>
            </Grid>
          </Grid>

          <Grid container sx={{ display: "flex", alignItems: "center" }}>
            <Grid item xl={1} xs={12}>
              <Button
                variant="contained"
                startIcon={
                  <SvgIcon fontSize="small">
                    <Save />
                  </SvgIcon>
                }
                type="submit"
                disabled={
                  updatePermissions.isPending ||
                  _.isEqual(currentPermissions.Permissions, newPermissions.Permissions)
                }
                onClick={handleSubmit}
              >
                Save
              </Button>
            </Grid>
            <Grid item xl={11} xs={12}>
              <CippApiResults apiObject={updatePermissions} />
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default CippAppPermissionBuilder;
