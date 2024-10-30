import React, { useEffect, useMemo, useState, useCallback } from "react";
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
} from "@mui/material";

import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { CippDataTable } from "../CippTable/CippDataTable";
import { useDialog } from "../../hooks/use-dialog";
import { PlusIcon, ShieldCheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import CippFormComponent from "./CippFormComponent";
import { Save, Undo, Upload, Warning } from "@mui/icons-material";
import { useWatch } from "react-hook-form";

const CippAppPermissionBuilder = ({
  onSubmit,
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

  const currentSelectedSp = useWatch({ control: formControl.control, name: "servicePrincipal" });
  const {
    data: servicePrincipals = [],
    isSuccess: spSuccess,
    isFetching: spFetching,
    refetch: refetchSpList,
  } = ApiGetCall({
    url: "/api/ExecServicePrincipals",
    queryKey: "execServicePrincipals",
    waiting: true,
  });

  const removeServicePrincipal = (appId) => {
    var servicePrincipal = selectedApp.find((sp) => sp?.appId === appId);
    var newServicePrincipals = selectedApp.filter((sp) => sp?.appId !== appId);

    if (removePermissionConfirm) {
      removePermissionDialog.handleOpen();
    } else {
      setSelectedApp(newServicePrincipals);
      var updatedPermissions = JSON.parse(JSON.stringify(newPermissions));
      delete updatedPermissions.Permissions[appId];
      setNewPermissions(updatedPermissions);
    }
  };

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

  const addPermissionRow = (servicePrincipal, permissionType, permission) => {
    console.log(servicePrincipal, permissionType, permission);
    var updatedPermissions = JSON.parse(JSON.stringify(newPermissions));

    if (!updatedPermissions?.Permissions[servicePrincipal]) {
      updatedPermissions.Permissions[servicePrincipal] = {
        applicationPermissions: [],
        delegatedPermissions: [],
      };
    }
    var currentPermission = updatedPermissions?.Permissions[servicePrincipal][permissionType];
    var newPermission = [];
    if (currentPermission) {
      currentPermission.map((perm) => {
        if (perm.id !== permission.value) {
          newPermission.push(perm);
        }
      });
    }
    newPermission.push({ id: permission.value, value: permission.label });

    updatedPermissions.Permissions[servicePrincipal][permissionType] = newPermission;
    setNewPermissions(updatedPermissions);
  };

  const removePermissionRow = (servicePrincipal, permissionType, permissionId, permissionValue) => {
    if (removePermissionConfirm) {
      removePermissionDialog.handleOpen();
    } else {
      var updatedPermissions = JSON.parse(JSON.stringify(newPermissions));
      var currentPermission = updatedPermissions?.Permissions[servicePrincipal][permissionType];
      var newPermission = [];
      if (currentPermission) {
        currentPermission.map((perm) => {
          if (perm.id !== permissionId) {
            newPermission.push(perm);
          }
        });
      }
      updatedPermissions.Permissions[servicePrincipal][permissionType] = newPermission;
      setNewPermissions(updatedPermissions);
    }
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
        console.log(reader.result);
        try {
          var manifest = JSON.parse(reader.result);
          setImportedManifest(manifest);
          console.log(importedManifest);
        } catch {
          console.log("invalid manifest");
        }
      };
      reader.readAsText(file);
    });
  }, []);

  useEffect(() => {
    if (spSuccess) {
      // console.log(selectedApp, currentPermissions);

      try {
        var initialAppIds = Object.keys(currentPermissions?.Permissions);
      } catch {
        initialAppIds = [];
      }

      if (selectedApp.length == 0 && initialAppIds.length == 0) {
        var microsoftGraph = servicePrincipals?.Results?.find(
          (sp) => sp?.appId === "00000003-0000-0000-c000-000000000000"
        );
        //console.log(microsoftGraph);
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
        var newApps = [];
        initialAppIds?.map((appId) => {
          var newSp = servicePrincipals?.Results?.find((sp) => sp.appId === appId);
          if (newSp) {
            newApps.push(newSp);
          }
        });
        newApps = newApps.sort((a, b) => {
          return a.displayName.localeCompare(b.displayName);
        });
        console.log(newApps);
        setSelectedApp(newApps);
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
    const [appPermissionTable, setAppPermissionTable] = useState([]);
    const [delegatedPermissionTable, setDelegatedPermissionTable] = useState([]);

    const currentAppPermission = useWatch({
      control: formControl.control,
      name: `Permissions.${servicePrincipal.appId}.applicationPermissions`,
    });
    const currentDelegatedPermission = useWatch({
      control: formControl.control,
      name: `Permissions.${servicePrincipal.appId}.delegatedPermissions`,
    });

    const {
      data: spInfo = [],
      isSuccess: spInfoSuccess,
      isFetching: spInfoFetching,
    } = ApiGetCall({
      url: `/api/ExecServicePrincipals?Id=${servicePrincipal.id}`,
      queryKey: `execServicePrincipals-${servicePrincipal.id}`,
      waiting: true,
    });

    return (
      <>
        {servicePrincipal && spInfoSuccess && (
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Manage the permissions for the {servicePrincipal.displayName}.
            </Typography>
            <Grid container>
              <Grid item xl={12}>
                <Grid container>
                  <Grid item xl={12}>
                    {servicePrincipal?.appRoles?.length > 0 ? (
                      <>
                        <Grid container>
                          <Grid container>
                            <Grid item xl={6} sm={12}>
                              <CippFormComponent
                                type="autoComplete"
                                fullWidth
                                label="Application Permissions"
                                name={`Permissions.${servicePrincipal.appId}.applicationPermissions`}
                                isFetching={spInfoFetching}
                                options={spInfo?.Results?.appRoles?.map((role) => ({
                                  label: role.value,
                                  value: role.id,
                                }))}
                                formControl={formControl}
                                multiple={false}
                              />
                            </Grid>
                            <Grid item xl={6} sm={12} className="mt-auto">
                              <Tooltip title="Add Permission">
                                <IconButton
                                  onClick={() =>
                                    addPermissionRow(
                                      servicePrincipal.appId,
                                      "applicationPermissions",
                                      currentAppPermission
                                    )
                                  }
                                >
                                  <SvgIcon fontSize="small">
                                    <PlusIcon />
                                  </SvgIcon>
                                </IconButton>
                              </Tooltip>
                            </Grid>
                          </Grid>
                        </Grid>
                        <div className="px-4">
                          <CippDataTable
                            title={`${servicePrincipal.displayName} Application Permissions`}
                            data={spPermissions?.applicationPermissions?.map((perm) => {
                              return {
                                id: perm.id,
                                value: perm.value,
                                description: spInfo?.Results?.appRoles.find(
                                  (role) => role.id === perm.id
                                )?.description,
                              };
                            })}
                            simpleColumns={["value", "description"]}
                            actions={[
                              {
                                label: "Delete Permission",
                                icon: <TrashIcon />,
                                noConfirm: true,
                                customFunction: (row) =>
                                  removePermissionRow(
                                    servicePrincipal.appId,
                                    "applicationPermissions",
                                    row.id,
                                    row.value
                                  ),
                              },
                            ]}
                          />
                        </div>
                      </>
                    ) : (
                      <Alert color="warning">No Application Permissions found.</Alert>
                    )}
                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xl={12}>
                    <hr />
                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xl={12}>
                    {spInfo?.Results?.publishedPermissionScopes?.length === 0 && (
                      <Alert color="warning">No Published Delegated Permissions found.</Alert>
                    )}
                    <Grid container>
                      <Grid item xl={6} sm={12}>
                        <CippFormComponent
                          type="autoComplete"
                          fullWidth
                          label="Delegated Permissions"
                          name={`Permissions.${servicePrincipal.appId}.delegatedPermissions`}
                          isFetching={spInfoFetching}
                          options={spInfo?.Results?.publishedPermissionScopes?.map((scope) => ({
                            label: scope.value,
                            value: scope.id,
                          }))}
                          formControl={formControl}
                          multiple={false}
                        />
                      </Grid>
                      <Grid item xl={6} sm={12} className="mt-auto">
                        <Tooltip title="Add Permission">
                          <Button
                            onClick={() =>
                              addPermissionRow(
                                servicePrincipal.appId,
                                "delegatedPermissions",
                                currentDelegatedPermission
                              )
                            }
                            className={`circular-button`}
                          >
                            <SvgIcon fontSize="small">
                              <PlusIcon />
                            </SvgIcon>
                          </Button>
                        </Tooltip>
                      </Grid>
                    </Grid>

                    <div className="px-4 mb-3">
                      <CippDataTable
                        title={`${servicePrincipal.displayName} Delegated Permissions`}
                        data={spPermissions?.delegatedPermissions?.map((perm) => {
                          return {
                            id: perm.id,
                            value: perm.value,
                            description: spInfo?.Results?.publishedPermissionScopes.find(
                              (scope) => scope.id === perm.id
                            )?.userConsentDescription,
                          };
                        })}
                        simpleColumns={["value", "description"]}
                        actions={[]}
                      />
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </>
        )}
      </>
    );
  };

  return (
    <>
      {spFetching && <Skeleton />}
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
                      <span>
                        <Button
                          variant="contained"
                          onClick={(e) =>
                            setSelectedApp([
                              ...selectedApp,
                              servicePrincipals?.Results?.find(
                                (sp) => sp.appId === currentSelectedSp.value
                              ),
                            ])
                          }
                          disabled={!currentSelectedSp?.value}
                        >
                          <SvgIcon fontSize="small">
                            <PlusIcon />
                          </SvgIcon>
                        </Button>
                      </span>
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
                          <Save />
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
                      <Alert color="warning">
                        <Grid container>
                          <Grid item xl={10} sm={12}>
                            <SvgIcon fontSize="small">
                              <Warning />
                            </SvgIcon>
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
                                className={`circular-button float-end`}
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
                    <Accordion key={`accordion-item-${spIndex}-${sp?.appId}`} variant="outlined">
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
                              <span>
                                <IconButton
                                  onClick={() => {
                                    removeServicePrincipal(sp.appId);
                                  }}
                                  disabled={sp.appId === "00000003-0000-0000-c000-000000000000"}
                                  color="error"
                                >
                                  <SvgIcon fontSize="small">
                                    <TrashIcon />
                                  </SvgIcon>
                                </IconButton>
                              </span>
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
          <Grid container className="me-3">
            <Grid container className="mb-3">
              <Grid item xl={4} md={12}>
                <Button
                  variant="contained"
                  startIcon={
                    <SvgIcon fontSize="small">
                      <Save />
                    </SvgIcon>
                  }
                  type="submit"
                  //disabled={submitting}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default CippAppPermissionBuilder;
