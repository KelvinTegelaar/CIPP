import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Skeleton,
  Grid,
  Paper,
  Divider,
  Chip,
  Alert,
  ButtonGroup,
  CircularProgress,
} from "@mui/material";
import { Search, VpnKey, Computer, CheckCircle, Cancel, Info, Key } from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";
import CippFormComponent from "./CippFormComponent";
import { useSettings } from "../../hooks/use-settings";

const getVolumeTypeLabel = (volumeType) => {
  const types = {
    0: "Operating System Volume",
    1: "Fixed Data Volume",
    2: "Removable Data Volume",
    3: "Unknown",
  };
  return types[volumeType] || `Type ${volumeType}`;
};

export const CippBitlockerKeySearch = () => {
  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      searchType: "keyId",
    },
  });
  const searchTerm = useWatch({ control: formControl.control, name: "searchTerm" });
  const searchType = useWatch({ control: formControl.control, name: "searchType" }) || "keyId";

  // State to store retrieved recovery keys by keyId
  const [recoveryKeys, setRecoveryKeys] = useState({});
  const [loadingKeys, setLoadingKeys] = useState({});

  const retrieveKeyMutation = ApiPostCall({});

  const handleRetrieveKey = async (keyId, deviceId, tenant) => {
    setLoadingKeys((prev) => ({ ...prev, [keyId]: true }));

    try {
      const response = await retrieveKeyMutation.mutateAsync({
        url: "/api/ExecGetRecoveryKey",
        data: {
          GUID: deviceId,
          RecoveryKeyType: "BitLocker",
          tenantFilter: tenant,
        },
      });

      // Extract the key from the response
      if (response?.data?.Results?.copyField) {
        setRecoveryKeys((prev) => ({ ...prev, [keyId]: response.data.Results.copyField }));
      }
    } catch (error) {
      console.error("Failed to retrieve key:", error);
    } finally {
      setLoadingKeys((prev) => ({ ...prev, [keyId]: false }));
    }
  };

  const getBitlockerKeys = ApiGetCall({
    url: "/api/ExecBitlockerSearch",
    data: { [searchType]: searchTerm },
    queryKey: `bitlocker-${searchType}-${searchTerm}`,
    waiting: false,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm && !getBitlockerKeys.isFetching) {
      getBitlockerKeys.refetch();
    }
  };

  const results = getBitlockerKeys.data?.Results || [];

  const searchTypeOptions = [
    { label: "Key ID", value: "keyId" },
    { label: "Device ID", value: "deviceId" },
  ];

  return (
    <CippButtonCard title="BitLocker Key Search">
      <Grid container spacing={3}>
        {/* Search Section */}
        <Grid size={{ xs: 12 }}>
          <Box component="form" onSubmit={handleSearch} sx={{ display: "flex", gap: 0 }}>
            <Box
              sx={{
                minWidth: 180,
                "& .MuiFormControl-root": {
                  m: 0,
                },
                "& .MuiInputBase-root": {
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <CippFormComponent
                type="select"
                name="searchType"
                label="Type"
                formControl={formControl}
                options={searchTypeOptions}
                disableClearable={true}
              />
            </Box>
            <Box
              sx={{
                flex: 1,
                "& .MuiFormControl-root": {
                  m: 0,
                },
                "& .MuiInputBase-root": {
                  borderRadius: 0,
                },
              }}
            >
              <CippFormComponent
                type="textField"
                name="searchTerm"
                label={searchType === "keyId" ? "BitLocker Recovery Key ID" : "Device ID"}
                placeholder={
                  searchType === "keyId" ? "Enter BitLocker recovery key ID" : "Enter device ID"
                }
                formControl={formControl}
                disableVariables={true}
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              disabled={!searchTerm || getBitlockerKeys.isFetching}
              sx={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
            >
              <Search />
            </Button>
          </Box>
        </Grid>

        {/* Results Section */}
        {getBitlockerKeys.isFetching ? (
          <Grid size={{ xs: 12 }}>
            <Divider />
            <Typography variant="h6" gutterBottom>
              Searching...
            </Typography>
            <Skeleton variant="rectangular" width="100%" height={200} />
          </Grid>
        ) : getBitlockerKeys.isSuccess ? (
          <>
            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {results.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" icon={<Info />}>
                  No BitLocker keys found matching your search criteria.
                </Alert>
              </Grid>
            ) : (
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Found {results.length} BitLocker Key{results.length !== 1 ? "s" : ""}
                </Typography>

                {results.map((result, index) => (
                  <Paper
                    key={index}
                    elevation={2}
                    sx={{ p: 3, mb: 2, backgroundColor: "background.paper" }}
                  >
                    <Grid container spacing={2}>
                      {/* BitLocker Key Information */}
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          <VpnKey sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }} />
                          BitLocker Key Information
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Key ID
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                          >
                            {result.keyId || "N/A"}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Volume Type
                        </Typography>
                        <Chip
                          label={getVolumeTypeLabel(result.volumeType)}
                          size="small"
                          color={result.volumeType === "0" ? "primary" : "default"}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Created
                        </Typography>
                        <Typography variant="body2">
                          {result.createdDateTime
                            ? new Date(result.createdDateTime).toLocaleString()
                            : "N/A"}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Tenant
                        </Typography>
                        <Typography variant="body2">{result.tenant || "N/A"}</Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Recovery Key
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {recoveryKeys[result.keyId] ? (
                            <>
                              <Typography
                                variant="body2"
                                sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                              >
                                {recoveryKeys[result.keyId]}
                              </Typography>
                              <CippCopyToClipBoard text={recoveryKeys[result.keyId]} />
                            </>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                loadingKeys[result.keyId] ? <CircularProgress size={16} /> : <Key />
                              }
                              onClick={() =>
                                handleRetrieveKey(result.keyId, result.deviceId, result.tenant)
                              }
                              disabled={
                                loadingKeys[result.keyId] || !result.keyId || !result.deviceId
                              }
                            >
                              Retrieve Key
                            </Button>
                          )}
                        </Box>
                      </Grid>

                      {/* Device Information */}
                      {result.deviceFound && (
                        <>
                          <Grid size={{ xs: 12 }}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              <Computer sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }} />
                              Device Information
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Device Name
                            </Typography>
                            <Typography variant="body2">{result.deviceName || "N/A"}</Typography>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Device ID
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                              >
                                {result.deviceId || "N/A"}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Operating System
                            </Typography>
                            <Typography variant="body2">
                              {result.operatingSystem || "N/A"}
                              {result.osVersion && ` (${result.osVersion})`}
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Account Status
                            </Typography>
                            <Chip
                              icon={
                                result.accountEnabled ? (
                                  <CheckCircle sx={{ fontSize: 16 }} />
                                ) : (
                                  <Cancel sx={{ fontSize: 16 }} />
                                )
                              }
                              label={result.accountEnabled ? "Enabled" : "Disabled"}
                              size="small"
                              color={result.accountEnabled ? "success" : "default"}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Trust Type
                            </Typography>
                            <Typography variant="body2">{result.trustType || "N/A"}</Typography>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Last Sign In
                            </Typography>
                            <Typography variant="body2">
                              {result.lastSignIn
                                ? new Date(result.lastSignIn).toLocaleString()
                                : "N/A"}
                            </Typography>
                          </Grid>
                        </>
                      )}

                      {!result.deviceFound && (
                        <Grid size={{ xs: 12 }}>
                          <Alert severity="warning" icon={<Info />}>
                            Device information not found in cache. The device may have been deleted
                            or not yet synced.
                          </Alert>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                ))}
              </Grid>
            )}
          </>
        ) : getBitlockerKeys.isError ? (
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Alert severity="error">
              Error searching for BitLocker keys: {getBitlockerKeys.error?.message}
            </Alert>
          </Grid>
        ) : null}
      </Grid>
    </CippButtonCard>
  );
};

export default CippBitlockerKeySearch;
